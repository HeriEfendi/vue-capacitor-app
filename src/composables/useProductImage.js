import { Filesystem, Directory } from '@capacitor/filesystem'
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera'

const PRODUCT_DIR = 'h_dev/product'

/**
 * Crop dan resize gambar ke 500x500 px dari File object, lalu convert ke WebP base64.
 * @param {File} file - File gambar dari input
 * @returns {Promise<string>} - base64 string (tanpa prefix data:...)
 */
export function cropAndConvertToWebP(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      cropBase64ImageToWebP(e.target.result, resolve, reject)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Crop dan resize gambar ke 500x500 px dari data URL / base64, lalu convert ke WebP base64.
 * @param {string} dataUrl - Data URL gambar (misal: "data:image/jpeg;base64,...")
 * @returns {Promise<string>} - base64 string WebP (tanpa prefix)
 */
export function cropBase64ToWebP(dataUrl) {
  return new Promise((resolve, reject) => {
    cropBase64ImageToWebP(dataUrl, resolve, reject)
  })
}

/** Internal helper: crop canvas logic */
function cropBase64ImageToWebP(src, resolve, reject) {
  const img = new Image()
  img.onload = () => {
    // Ambil sisi terkecil untuk crop kotak (square crop dari tengah)
    const size = Math.min(img.width, img.height)
    const sx = (img.width - size) / 2
    const sy = (img.height - size) / 2

    const canvas = document.createElement('canvas')
    canvas.width = 500
    canvas.height = 500

    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, sx, sy, size, size, 0, 0, 500, 500)

    // Export sebagai WebP (quality 0.88)
    const dataUrl = canvas.toDataURL('image/webp', 0.88)
    resolve(dataUrl.split(',')[1])
  }
  img.onerror = reject
  img.src = src
}

/**
 * Ambil foto dari Kamera menggunakan @capacitor/camera.
 * @returns {Promise<string>} - base64 WebP siap simpan
 */
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

/**
 * Pilih gambar dari Galeri/File menggunakan @capacitor/camera.
 * @returns {Promise<string>} - base64 WebP siap simpan
 */
export async function pickFromGallery() {
  const photo = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Photos,
  })
  return await cropBase64ToWebP(photo.dataUrl)
}

/**
 * Pastikan direktori h_dev/product sudah ada di Documents.
 */
async function ensureDir() {
  try {
    await Filesystem.mkdir({
      path: PRODUCT_DIR,
      directory: Directory.Documents,
      recursive: true,
    })
  } catch {
    // Direktori sudah ada — abaikan error
  }
}

/**
 * Simpan gambar produk ke Filesystem dari File object (input file biasa).
 * @param {File} file - File gambar dari input
 * @param {string|number} productId - ID unik produk
 * @returns {Promise<string>} - Nama file yang tersimpan (contoh: "product_123.webp")
 */
export async function saveProductImage(file, productId) {
  await ensureDir()
  const base64 = await cropAndConvertToWebP(file)
  return await _writeProductWebP(base64, productId)
}

/**
 * Simpan gambar produk ke Filesystem dari base64 WebP (hasil dari Camera/Gallery).
 * @param {string} base64 - base64 WebP (tanpa prefix)
 * @param {string|number} productId - ID unik produk
 * @returns {Promise<string>} - Nama file yang tersimpan
 */
export async function saveProductImageFromBase64(base64, productId) {
  await ensureDir()
  return await _writeProductWebP(base64, productId)
}

/** Internal: tulis base64 ke file */
async function _writeProductWebP(base64, productId) {
  const fileName = `product_${productId}.webp`
  const filePath = `${PRODUCT_DIR}/${fileName}`
  await Filesystem.writeFile({
    path: filePath,
    data: base64,
    directory: Directory.Documents,
  })
  return fileName
}

/**
 * Hapus gambar produk dari Filesystem.
 * @param {string} fileName - Nama file (contoh: "product_123.webp")
 */
export async function deleteProductImage(fileName) {
  if (!fileName) return
  try {
    await Filesystem.deleteFile({
      path: `${PRODUCT_DIR}/${fileName}`,
      directory: Directory.Documents,
    })
  } catch {
    // File tidak ada — abaikan
  }
}

/**
 * Baca gambar dari Filesystem dan kembalikan sebagai data URL siap pakai di <img>.
 * @param {string} fileName - Nama file (contoh: "product_123.webp")
 * @returns {Promise<string|null>} - Data URL "data:image/webp;base64,..." atau null
 */
export async function readProductImage(fileName) {
  if (!fileName) return null
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
