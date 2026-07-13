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

function _isUserCancelled(err) {
  const msg = err?.message ?? ''
  return (
    msg === 'User cancelled photos app' ||
    msg === 'User cancelled' ||
    msg === 'No image picked' ||
    err?.code === 'userCancelled' ||
    // Capacitor 5+ Android cancel
    msg.toLowerCase().includes('cancel')
  )
}

/**
 * Check and request camera/photos permission on native platform.
 */
async function checkAndRequestPermissions(source) {
  if (!isNative()) return
  try {
    const status = await Camera.checkPermissions()
    if (source === CameraSource.Camera) {
      if (status.camera !== 'granted') {
        const req = await Camera.requestPermissions({ permissions: ['camera'] })
        if (req.camera !== 'granted') {
          throw new Error('Izin kamera ditolak. Buka Pengaturan → Aplikasi → izinkan Kamera.')
        }
      }
    } else {
      if (status.photos !== 'granted') {
        const req = await Camera.requestPermissions({ permissions: ['photos'] })
        if (req.photos !== 'granted') {
          throw new Error('Izin galeri ditolak. Buka Pengaturan → Aplikasi → izinkan Penyimpanan/Foto.')
        }
      }
    }
  } catch (err) {
    console.warn('Error checking/requesting permissions:', err)
  }
}

/**
 * Ambil foto dari Kamera (Capacitor Camera).
 */
export async function captureFromCamera() {
  try {
    await checkAndRequestPermissions(CameraSource.Camera)
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      saveToGallery: false,
      correctOrientation: true,
      webUseInput: false, // Use PWA elements webcam modal on web/desktop
    })

    // Capacitor bisa return base64String atau dataUrl tergantung platform/versi
    const src = photo.dataUrl
      || (photo.base64String ? `data:image/jpeg;base64,${photo.base64String}` : null)
    if (!src) throw new Error('Tidak ada data gambar dari kamera.')
    return await cropBase64ToWebP(src)
  } catch (err) {
    if (_isUserCancelled(err)) return null
    // Deteksi permission denied
    const msg = err?.message ?? ''
    if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')) {
      throw new Error('Izin kamera ditolak. Buka Pengaturan → Aplikasi → izinkan Kamera.')
    }
    throw err
  }
}

/** Pilih gambar dari Galeri (Capacitor Camera). */
export async function pickFromGallery() {
  try {
    await checkAndRequestPermissions(CameraSource.Photos)
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
      correctOrientation: true,
      webUseInput: true, // Use standard input on web/desktop for compatibility
    })

    const src = photo.dataUrl
      || (photo.base64String ? `data:image/jpeg;base64,${photo.base64String}` : null)
    if (!src) throw new Error('Tidak ada data gambar dari galeri.')
    return await cropBase64ToWebP(src)
  } catch (err) {
    if (_isUserCancelled(err)) return null
    const msg = err?.message ?? ''
    if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')) {
      throw new Error('Izin galeri ditolak. Buka Pengaturan → Aplikasi → izinkan Penyimpanan/Foto.')
    }
    throw err
  }
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
// Storage: Web (localStorage with IndexedDB fallback)
// ─────────────────────────────────────────────

async function _writeToWebStorage(base64, productId) {
  const fileName = `product_${productId}.webp`
  const dataUrl = `data:image/webp;base64,${base64}`

  // Write to localStorage (primary)
  try {
    localStorage.setItem(fileName, dataUrl)
  } catch (e) {
    console.warn('Failed to save to localStorage:', e)
  }

  // Also write to IndexedDB (as a robust fallback)
  try {
    await _writeToIDB(base64, productId)
  } catch (e) {
    console.warn('Failed to save to IndexedDB fallback:', e)
  }

  return fileName
}

async function _readFromWebStorage(fileName) {
  // Try localStorage first
  const localData = localStorage.getItem(fileName)
  if (localData) {
    return localData
  }
  // Fallback to IndexedDB
  return await _readFromIDB(fileName)
}

async function _deleteFromWebStorage(fileName) {
  try {
    localStorage.removeItem(fileName)
  } catch (e) {
    console.warn('Failed to delete from localStorage:', e)
  }
  await _deleteFromIDB(fileName)
}

// ─────────────────────────────────────────────
// Public API — platform-aware
// ─────────────────────────────────────────────

/**
 * Simpan gambar produk dari File object (file input browser).
 */
export async function saveProductImage(file, productId) {
  const base64 = await cropAndConvertToWebP(file)
  return isNative()
    ? await _writeToFilesystem(base64, productId)
    : await _writeToWebStorage(base64, productId)
}

/**
 * Simpan gambar produk dari base64 WebP (hasil Camera/Gallery).
 */
export async function saveProductImageFromBase64(base64, productId) {
  return isNative()
    ? await _writeToFilesystem(base64, productId)
    : await _writeToWebStorage(base64, productId)
}

/**
 * Baca gambar produk sebagai data URL siap pakai di <img>.
 */
export async function readProductImage(fileName) {
  if (!fileName) return null
  return isNative()
    ? await _readFromFilesystem(fileName)
    : await _readFromWebStorage(fileName)
}

/**
 * Hapus gambar produk.
 */
export async function deleteProductImage(fileName) {
  if (!fileName) return
  return isNative()
    ? await _deleteFromFilesystem(fileName)
    : await _deleteFromWebStorage(fileName)
}
