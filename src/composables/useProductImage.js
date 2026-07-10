import { Filesystem, Directory } from '@capacitor/filesystem'
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'

const PRODUCT_DIR = 'h_dev/product'

// ─────────────────────────────────────────────
// Platform detection
// ─────────────────────────────────────────────
function isNative() {
  return Capacitor.isNativePlatform()
}

// ─────────────────────────────────────────────
// Image processing helpers (platform-agnostic)
// ─────────────────────────────────────────────

/**
 * Crop & resize gambar dari File object ke 500x500 WebP base64 (tanpa prefix).
 */
export function cropAndConvertToWebP(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => _cropBase64ImageToWebP(e.target.result, resolve, reject)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Crop & resize gambar dari data URL / base64 ke 500x500 WebP base64 (tanpa prefix).
 */
export function cropBase64ToWebP(dataUrl) {
  return new Promise((resolve, reject) => {
    _cropBase64ImageToWebP(dataUrl, resolve, reject)
  })
}

/** Internal: canvas crop logic */
function _cropBase64ImageToWebP(src, resolve, reject) {
  const img = new Image()
  img.onload = () => {
    const size = Math.min(img.width, img.height)
    const sx = (img.width - size) / 2
    const sy = (img.height - size) / 2
    const canvas = document.createElement('canvas')
    canvas.width = 500
    canvas.height = 500
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, sx, sy, size, size, 0, 0, 500, 500)
    const dataUrl = canvas.toDataURL('image/webp', 0.88)
    resolve(dataUrl.split(',')[1])
  }
  img.onerror = reject
  img.src = src
}

// ─────────────────────────────────────────────
// Camera / Gallery capture
// ─────────────────────────────────────────────

/** Ambil foto dari Kamera (Capacitor Camera). */
export async function captureFromCamera() {
  const photo = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Camera,
    saveToGallery: false,
  })
  return await cropBase64ToWebP(photo.dataUrl)
}

/** Pilih gambar dari Galeri (Capacitor Camera). */
export async function pickFromGallery() {
  const photo = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Photos,
  })
  return await cropBase64ToWebP(photo.dataUrl)
}

// ─────────────────────────────────────────────
// Storage: Native Android (Capacitor Filesystem)
// Lokasi: Documents/h_dev/product/
// ─────────────────────────────────────────────

async function _ensureDir() {
  try {
    await Filesystem.mkdir({
      path: PRODUCT_DIR,
      directory: Directory.Documents,
      recursive: true,
    })
  } catch {
    // Direktori sudah ada — abaikan
  }
}

async function _writeToFilesystem(base64, productId) {
  await _ensureDir()
  const fileName = `product_${productId}.webp`
  await Filesystem.writeFile({
    path: `${PRODUCT_DIR}/${fileName}`,
    data: base64,
    directory: Directory.Documents,
  })
  return fileName
}

async function _readFromFilesystem(fileName) {
  try {
    const result = await Filesystem.readFile({
      path: `${PRODUCT_DIR}/${fileName}`,
      directory: Directory.Documents,
    })
    return `data:image/webp;base64,${result.data}`
  } catch {
    return null
  }
}

async function _deleteFromFilesystem(fileName) {
  try {
    await Filesystem.deleteFile({
      path: `${PRODUCT_DIR}/${fileName}`,
      directory: Directory.Documents,
    })
  } catch {
    // File tidak ada — abaikan
  }
}

// ─────────────────────────────────────────────
// Storage: Browser / Desktop (IndexedDB)
// Database: ProductImagesDB, store: 'images'
// ─────────────────────────────────────────────

function _openImageDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('ProductImagesDB', 1)
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore('images')
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

async function _writeToIDB(base64, productId) {
  const fileName = `product_${productId}.webp`
  const idb = await _openImageDB()
  await new Promise((resolve, reject) => {
    const tx = idb.transaction('images', 'readwrite')
    tx.objectStore('images').put(`data:image/webp;base64,${base64}`, fileName)
    tx.oncomplete = resolve
    tx.onerror = (e) => reject(e.target.error)
  })
  idb.close()
  return fileName
}

async function _readFromIDB(fileName) {
  try {
    const idb = await _openImageDB()
    const dataUrl = await new Promise((resolve, reject) => {
      const tx = idb.transaction('images', 'readonly')
      const req = tx.objectStore('images').get(fileName)
      req.onsuccess = (e) => resolve(e.target.result || null)
      req.onerror = (e) => reject(e.target.error)
    })
    idb.close()
    return dataUrl
  } catch {
    return null
  }
}

async function _deleteFromIDB(fileName) {
  try {
    const idb = await _openImageDB()
    await new Promise((resolve, reject) => {
      const tx = idb.transaction('images', 'readwrite')
      tx.objectStore('images').delete(fileName)
      tx.oncomplete = resolve
      tx.onerror = (e) => reject(e.target.error)
    })
    idb.close()
  } catch {
    // Abaikan
  }
}

// ─────────────────────────────────────────────
// Public API — platform-aware
// ─────────────────────────────────────────────

/**
 * Simpan gambar produk dari File object (file input browser).
 * Native Android → Documents/h_dev/product/
 * Browser/Desktop → IndexedDB (ProductImagesDB)
 */
export async function saveProductImage(file, productId) {
  const base64 = await cropAndConvertToWebP(file)
  return isNative()
    ? await _writeToFilesystem(base64, productId)
    : await _writeToIDB(base64, productId)
}

/**
 * Simpan gambar produk dari base64 WebP (hasil Camera/Gallery).
 * Native Android → Documents/h_dev/product/
 * Browser/Desktop → IndexedDB (ProductImagesDB)
 */
export async function saveProductImageFromBase64(base64, productId) {
  return isNative()
    ? await _writeToFilesystem(base64, productId)
    : await _writeToIDB(base64, productId)
}

/**
 * Baca gambar produk sebagai data URL siap pakai di <img>.
 * Native Android → baca dari Filesystem
 * Browser/Desktop → baca dari IndexedDB
 */
export async function readProductImage(fileName) {
  if (!fileName) return null
  return isNative()
    ? await _readFromFilesystem(fileName)
    : await _readFromIDB(fileName)
}

/**
 * Hapus gambar produk.
 * Native Android → hapus dari Filesystem
 * Browser/Desktop → hapus dari IndexedDB
 */
export async function deleteProductImage(fileName) {
  if (!fileName) return
  return isNative()
    ? await _deleteFromFilesystem(fileName)
    : await _deleteFromIDB(fileName)
}
