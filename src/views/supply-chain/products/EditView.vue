<template>
  <ion-page v-if="product">
    <ion-header>
      <ion-toolbar class="header-dark">
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

          <div class="field-group mb-4">
            <label class="field-label">Foto Produk</label>
            <input type="file" class="form-control app-control" accept="image/*" @change="handleImageUpload" />
            <small class="text-muted">Opsional, unggah file gambar produk baru.</small>
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
        <button class="btn btn-action primary w-100 py-3 fw-bold fs-6" @click="save">
          Simpan Perubahan
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ProductRepository, CategoryRepository } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, toastController } from '@ionic/vue';

export default {
  name: 'ProductEditView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const product = ref(null)
    const categories = ref([])

    const loadData = async () => {
      categories.value = await CategoryRepository.getAll()
      const data = await ProductRepository.getById(Number(route.params.id))
      if (data) {
        product.value = {
          ...data,
          isFeatured: data.featured === 1
        }
      }
    }

    onMounted(loadData)

    const handleImageUpload = (e) => {
      const f = e.target.files[0];
      if (f) product.value.image = f
    }

    const showToast = async (msg, color = 'danger') => {
      const toast = await toastController.create({
        message: msg,
        duration: 2000,
        color: color,
        position: 'top'
      })
      await toast.present()
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

      // Convert isFeatured back to 0 or 1
      const dataToSave = {
        ...product.value,
        featured: product.value.isFeatured ? 1 : 0
      }
      delete dataToSave.isFeatured

      await ProductRepository.update(product.value.id, dataToSave)
      await showToast('Produk berhasil diperbarui!', 'success')
      router.push('/products')
    }

    return { product, categories, handleImageUpload, save }
  }
}
</script>
