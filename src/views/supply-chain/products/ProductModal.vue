<template>
  <ion-modal :is-open="isOpen" @didDismiss="emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ isEdit ? 'Edit Produk' : 'Tambah Produk' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="emit('close')"><ion-icon :icon="closeOutline" /></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap bg-light">
      <div class="mobile-card p-4">
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

          <div class="field-group mb-4">
            <label class="field-label">Foto Produk</label>
            <div class="img-upload-preview mb-3">
              <img v-if="previewUrl" :src="previewUrl" class="img-preview" />
              <div v-else class="img-placeholder">
                <ion-icon :icon="imageOutline" style="font-size: 2.8rem;" />
                <span>Belum ada foto</span>
              </div>
              <div v-if="isProcessing" class="img-processing-overlay">
                <ion-spinner name="crescent" />
              </div>
            </div>
            <div class="img-source-buttons">
              <button type="button" class="btn-img-source" @click="openCamera" :disabled="isProcessing"><ion-icon :icon="cameraOutline" /><span>Kamera</span></button>
              <button type="button" class="btn-img-source" @click="openGallery" :disabled="isProcessing"><ion-icon :icon="imagesOutline" /><span>Galeri</span></button>
            </div>
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
    </ion-content>

    <ion-footer>
      <div class="p-3">
        <button class="btn btn-action primary w-100 py-3 fw-bold fs-6" @click="save" :disabled="isProcessing">
          Simpan Perubahan
        </button>
      </div>
    </ion-footer>
  </ion-modal>
</template>

<script setup lang="ts">
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonFooter, IonSpinner } from '@ionic/vue';
import { 
    closeOutline, cameraOutline, imagesOutline, folderOpenOutline, 
    imageOutline, checkmarkCircleOutline, sparklesOutline 
} from 'ionicons/icons';
import { ref, onMounted, watch } from 'vue';
import { 
    captureFromCamera, pickFromGallery, cropAndConvertToWebP, readProductImage, saveProductImageFromBase64 
} from '../../../composables/useProductImage';

const props = defineProps<{ isOpen: boolean, isEdit: boolean, product: any, categories: any[] }>();
const emit = defineEmits(['close', 'save']);

const fileInput = ref(null); // ponytail: Hapus saat refactoring template tuntas
const previewUrl = ref(null);
const isProcessing = ref(false);

const applyBase64 = (base64: string) => {
    props.product.pendingBase64 = base64;
    previewUrl.value = `data:image/webp;base64,${base64}`;
};

const openCamera = async () => {
  if (isProcessing.value) return;
  isProcessing.value = true;
  try {
    const { Camera } = await import('@capacitor/camera');
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: 'uri',
      source: 'CAMERA',
    });
    previewUrl.value = image.webPath;
    if (Capacitor.isNativePlatform()) {
      const { Filesystem } = await import('@capacitor/filesystem');
      const file = await Filesystem.readFile({
        path: image.path,
      });
      props.product.image = `data:image/webp;base64,${file.data}`;
    } else {
      const response = await fetch(image.webPath!);
      const blob = await response.blob();
      const reader = new FileReader();
      const base64 = await new Promise((resolve) => {
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
      });
      const fileName = await saveProductImageFromBase64(base64 as string, Date.now());
      props.product.image = fileName;
    }
  } catch (error: any) {
    if (error.message !== 'User cancelled photos app') {
      console.error('Camera error:', error);
    }
    if (Capacitor.isNativePlatform()) {
      // Native sudah handle via Camera plugin
    }
  } finally {
    isProcessing.value = false;
  }
};

const openGallery = async () => {
    isProcessing.value = true;
    try {
        const base64 = await pickFromGallery();
        if (base64) {
          const fileName = await saveProductImageFromBase64(base64, Date.now());
          props.product.image = fileName;
          applyBase64(base64);
        }
    } catch (err: any) {
        console.error('Gagal membuka galeri:', err);
        alert(err?.message || 'Gagal membuka galeri. Pastikan izin penyimpanan telah diberikan.');
    } finally { isProcessing.value = false; }
};

const handleFileInput = async (e: any) => {
    const f = e.target.files[0];
    if (!f) return;
    isProcessing.value = true;
    try {
        const base64 = await cropAndConvertToWebP(f);
        const fileName = await saveProductImageFromBase64(base64, Date.now());
        props.product.image = fileName;
        applyBase64(base64);
    } catch (err) { console.error(err); } finally { isProcessing.value = false; }
};

const save = () => {
    emit('save', props.product);
};

onMounted(async () => {
  if (props.product.image) {
    if (typeof props.product.image === 'string' && props.product.image.startsWith('data:')) {
      previewUrl.value = props.product.image;
    } else if (typeof props.product.image === 'string') {
      previewUrl.value = await readProductImage(props.product.image);
    } else {
      previewUrl.value = URL.createObjectURL(props.product.image);
    }
  }
});

watch(() => props.isOpen, async (val) => {
    if (val && props.product.image) {
        previewUrl.value = await readProductImage(props.product.image);
    } else {
        previewUrl.value = null;
    }
});
</script>


<style scoped>
.img-upload-preview { position: relative; width: 160px; height: 160px; border-radius: 14px; border: 2px dashed #b39ddb; background: #f5f3ff; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.img-preview { width: 100%; height: 100%; object-fit: cover; }
.img-placeholder { display: flex; flex-direction: column; align-items: center; gap: 6px; color: #b39ddb; font-size: 0.75rem; }
.img-processing-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.82); display: flex; align-items: center; justify-content: center; }
.img-source-buttons { display: flex; gap: 10px; }
.btn-img-source { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 10px 6px; border: 1.5px solid #d1c4e9; border-radius: 12px; background: #fff; color: #5e35b1; font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: background 0.18s, border-color 0.18s, transform 0.12s; }
.btn-img-source ion-icon { font-size: 1.4rem; }
</style>
