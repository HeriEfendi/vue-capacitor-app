<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="header-dark">
        <ion-buttons slot="start">
          <ion-back-button default-href="/products" />
        </ion-buttons>
        <ion-title>Tambah Produk</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap bg-light">
      <div class="mobile-card p-4">
        <h5 class="fw-bold text-dark mb-4">Informasi Produk</h5>

        <div class="form-stack">
          <div class="field-group mb-3">
            <label class="field-label">Nama Produk</label>
            <input type="text" v-model="newProduct.name" class="form-control app-control" placeholder="Contoh: Es Teh Manis" />
          </div>

          <div class="field-group mb-3">
            <label class="field-label">Kategori</label>
            <select v-model="newProduct.categoryId" class="form-select app-control">
              <option :value="null" disabled>Pilih Kategori</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <div class="row mb-3">
            <div class="col-6">
              <div class="field-group">
                <label class="field-label">Harga (IDR)</label>
                <input type="number" v-model.number="newProduct.price" class="form-control app-control" placeholder="0" />
              </div>
            </div>
            <div class="col-6">
              <div class="field-group">
                <label class="field-label">Stok Awal</label>
                <input type="number" v-model.number="newProduct.stock" class="form-control app-control" placeholder="0" />
              </div>
            </div>
          </div>

          <div class="field-group mb-3">
            <label class="field-label">Deskripsi</label>
            <textarea v-model="newProduct.description" class="form-control app-control form-control-textarea" rows="3" placeholder="Tulis deskripsi produk di sini..."></textarea>
          </div>

          <div class="field-group mb-4">
            <label class="field-label">Foto Produk</label>
            <input type="file" class="form-control app-control" accept="image/*" @change="handleImageUpload" />
            <small class="text-muted">Opsional, unggah file gambar produk.</small>
          </div>

          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" v-model="newProduct.featured" id="featuredCheck">
            <label class="form-check-label text-dark fw-semibold" for="featuredCheck">
              Produk Unggulan (Tampilkan di halaman depan)
            </label>
          </div>
        </div>
      </div>

      <div class="p-3">
        <button class="btn btn-action primary w-100 py-3 fw-bold fs-6" @click="addProduct">
          Simpan Produk
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ProductRepository, CategoryRepository } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, toastController } from '@ionic/vue';

export default {
  name: 'ProductCreateView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton },
  setup() {
    const router = useRouter()
    const categories = ref([])
    const newProduct = ref({
      name: '',
      price: 0,
      stock: 0,
      description: '',
      image: null,
      categoryId: null,
      featured: false
    })

    const fetchCategories = async () => {
      categories.value = await CategoryRepository.getAll()
      if (categories.value.length > 0) {
        newProduct.value.categoryId = categories.value[0].id
      }
    }

    onMounted(fetchCategories)

    const handleImageUpload = (e) => {
      const f = e.target.files[0];
      if (f) newProduct.value.image = f
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

    const addProduct = async () => {
      if (!newProduct.value.name.trim()) {
        await showToast('Nama produk tidak boleh kosong!')
        return
      }
      if (newProduct.value.price < 0) {
        await showToast('Harga produk tidak boleh negatif!')
        return
      }
      if (newProduct.value.stock < 0) {
        await showToast('Stok tidak boleh negatif!')
        return
      }

      // Convert featured to integer (0 or 1)
      const dataToSave = {
        ...newProduct.value,
        featured: newProduct.value.featured ? 1 : 0
      }

      await ProductRepository.add(dataToSave)
      await showToast('Produk berhasil ditambahkan!', 'success')
      router.push('/products')
    }

    return { newProduct, categories, handleImageUpload, addProduct }
  }
}
</script>
