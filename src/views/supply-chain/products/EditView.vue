<template>
  <ion-page v-if="product">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/products" />
        </ion-buttons>
        <ion-title>Edit Produk</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap bg-light">
      <div class="mobile-card p-4">
        <h5 class="fw-bold text-dark mb-4">Informasi Produk</h5>

        <div class="form-stack">
          <div class="field-group mb-3">
            <label class="field-label">Nama Produk</label>
            <input type="text" v-model="product.name" class="form-control app-control" placeholder="Contoh: Es Teh Manis" />
          </div>

          <div class="field-group mb-3">
            <label class="field-label">Kategori</label>
            <select v-model="product.categoryId" class="form-select app-control">
              <option :value="null" disabled>Pilih Kategori</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <div class="row mb-3">
            <div class="col-6">
              <div class="field-group">
                <label class="field-label">Harga (IDR)</label>
                <input type="number" v-model.number="product.price" class="form-control app-control" />
              </div>
            </div>
            <div class="col-6">
              <div class="field-group">
                <label class="field-label">Stok</label>
                <input type="number" v-model.number="product.stock" class="form-control app-control" />
              </div>
            </div>
          </div>

          <div class="field-group mb-3">
            <label class="field-label">Deskripsi</label>
            <textarea v-model="product.description" class="form-control app-control form-control-textarea" rows="3" placeholder="Tulis deskripsi produk di sini..."></textarea>
          </div>

          <!-- ===== Foto Produk ===== -->
          <div class="field-group mb-4">
            <label class="field-label">Foto Produk</label>

            <!-- Preview Area -->
            <div class="img-upload-preview mb-3">
              <img v-if="previewUrl" :src="previewUrl" alt="Preview Foto Produk" class="img-preview" />
              <div v-else class="img-placeholder">
                <ion-icon :icon="imageOutline" style="font-size: 2.8rem;" />
                <span>Belum ada foto</span>
              </div>
              <!-- Badge Tersimpan -->
              <span v-if="previewUrl && !pendingBase64" class="img-saved-badge">
                <ion-icon :icon="checkmarkCircleOutline" /> Tersimpan
              </span>
              <!-- Badge Baru -->
              <span v-if="pendingBase64" class="img-new-badge">
                <ion-icon :icon="sparklesOutline" /> Baru
              </span>
              <div v-if="isProcessing" class="img-processing-overlay">
                <ion-spinner name="crescent" />
                <span style="font-size:0.8rem;">Memproses...</span>
              </div>
            </div>

            <!-- Tombol Sumber Gambar -->
            <div class="img-source-buttons">
              <button type="button" class="btn-img-source" @click="openCamera" :disabled="isProcessing">
                <ion-icon :icon="cameraOutline" />
                <span>Kamera</span>
              </button>
              <button type="button" class="btn-img-source" @click="openGallery" :disabled="isProcessing">
                <ion-icon :icon="imagesOutline" />
                <span>Galeri</span>
              </button>
              <button type="button" class="btn-img-source" @click="fileInput.click()" :disabled="isProcessing">
                <ion-icon :icon="folderOpenOutline" />
                <span>File</span>
              </button>
            </div>

            <!-- Hidden file input (fallback) -->
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display:none"
              @change="handleFileInput"
            />

            <small class="text-muted d-block mt-2">Gambar akan di-crop otomatis menjadi 500×500 px dan disimpan sebagai WebP.</small>
          </div>

          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" v-model="product.isFeatured" id="featuredCheck">
            <label class="form-check-label text-dark fw-semibold" for="featuredCheck">
              Produk Unggulan (Tampilkan di halaman depan)
            </label>
          </div>
        </div>
      </div>

      <div class="p-3">
        <button class="btn btn-action primary w-100 py-3 fw-bold fs-6" @click="save" :disabled="isSaving">
          <ion-spinner v-if="isSaving" name="crescent" style="width:18px;height:18px;margin-right:6px;" />
          {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ProductRepository, CategoryRepository } from '../../../db/repositories'
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonBackButton, IonIcon, IonSpinner, toastController
} from '@ionic/vue'
import {
  cameraOutline, imagesOutline, folderOpenOutline,
  imageOutline, checkmarkCircleOutline, sparklesOutline
} from 'ionicons/icons'
import {
  captureFromCamera,
  pickFromGallery,
  cropAndConvertToWebP,
  saveProductImageFromBase64,
  readProductImage,
  deleteProductImage
} from '../../../composables/useProductImage'

export default {
  name: 'ProductEditView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonIcon, IonSpinner },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const product = ref(null)
    const categories = ref([])

    // State upload
    const fileInput = ref(null)
    const previewUrl = ref(null)
    const pendingBase64 = ref(null)   // base64 WebP baru yang belum disimpan
    const isProcessing = ref(false)
    const isSaving = ref(false)

    const loadData = async () => {
      categories.value = await CategoryRepository.getAll()
      const data = await ProductRepository.getById(Number(route.params.id))
      if (data) {
        product.value = {
          ...data,
          isFeatured: data.featured === 1
        }
        // Load gambar lama dari Filesystem
        if (data.image) {
          previewUrl.value = await readProductImage(data.image)
        }
      }
    }

    onMounted(loadData)

    const showToast = async (msg, color = 'danger') => {
      const toast = await toastController.create({
        message: msg, duration: 2500, color, position: 'top'
      })
      await toast.present()
    }

    const applyBase64 = (base64) => {
      pendingBase64.value = base64
      previewUrl.value = `data:image/webp;base64,${base64}`
    }

    const openCamera = async () => {
      isProcessing.value = true
      try {
        const base64 = await captureFromCamera()
        applyBase64(base64)
      } catch (err) {
        if (err?.message !== 'User cancelled photos app') {
          await showToast('Gagal membuka kamera.')
          console.error(err)
        }
      } finally {
        isProcessing.value = false
      }
    }

    const openGallery = async () => {
      isProcessing.value = true
      try {
        const base64 = await pickFromGallery()
        applyBase64(base64)
      } catch (err) {
        if (err?.message !== 'User cancelled photos app') {
          await showToast('Gagal membuka galeri.')
          console.error(err)
        }
      } finally {
        isProcessing.value = false
      }
    }

    const handleFileInput = async (e) => {
      const f = e.target.files[0]
      if (!f) return
      isProcessing.value = true
      try {
        const base64 = await cropAndConvertToWebP(f)
        applyBase64(base64)
      } catch (err) {
        await showToast('Gagal memproses gambar.')
        console.error(err)
      } finally {
        isProcessing.value = false
        e.target.value = ''
      }
    }

    const save = async () => {
      if (!product.value.name.trim()) {
        await showToast('Nama produk tidak boleh kosong!')
        return
      }
      if (product.value.price < 0) {
        await showToast('Harga produk tidak boleh negatif!')
        return
      }
      if (product.value.stock < 0) {
        await showToast('Stok tidak boleh negatif!')
        return
      }

      isSaving.value = true
      try {
        const dataToSave = {
          ...product.value,
          featured: product.value.isFeatured ? 1 : 0
        }
        delete dataToSave.isFeatured

        // Jika ada gambar baru
        if (pendingBase64.value) {
          if (product.value.image) {
            await deleteProductImage(product.value.image)
          }
          const fileName = await saveProductImageFromBase64(pendingBase64.value, product.value.id)
          dataToSave.image = fileName
        }

        await ProductRepository.update(product.value.id, dataToSave)
        await showToast('Produk berhasil diperbarui!', 'success')
        router.push('/products')
      } catch (err) {
        console.error('Gagal menyimpan produk:', err)
        await showToast('Gagal menyimpan produk, coba lagi.')
      } finally {
        isSaving.value = false
      }
    }

    return {
      product, categories,
      fileInput, previewUrl, pendingBase64, isProcessing, isSaving,
      cameraOutline, imagesOutline, folderOpenOutline,
      imageOutline, checkmarkCircleOutline, sparklesOutline,
      openCamera, openGallery, handleFileInput, save
    }
  }
}
</script>

<style scoped>
/* ===== Preview ===== */
.img-upload-preview {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 14px;
  border: 2px dashed #b39ddb;
  background: #f5f3ff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.img-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.img-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #b39ddb;
  font-size: 0.75rem;
}
.img-saved-badge,
.img-new-badge {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.68rem;
  padding: 2px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.img-saved-badge {
  background: rgba(0,0,0,0.5);
  color: #fff;
}
.img-new-badge {
  background: rgba(103, 58, 183, 0.85);
  color: #fff;
}
.img-processing-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.82);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #6610f2;
}

/* ===== Source Buttons ===== */
.img-source-buttons {
  display: flex;
  gap: 10px;
}
.btn-img-source {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 10px 6px;
  border: 1.5px solid #d1c4e9;
  border-radius: 12px;
  background: #fff;
  color: #5e35b1;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, transform 0.12s;
}
.btn-img-source ion-icon {
  font-size: 1.4rem;
}
.btn-img-source:hover:not(:disabled) {
  background: #ede7f6;
  border-color: #7e57c2;
}
.btn-img-source:active:not(:disabled) {
  transform: scale(0.95);
}
.btn-img-source:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
