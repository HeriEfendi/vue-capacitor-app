<template>
  <div class="d-flex flex-column align-items-center justify-content-center text-center" style="min-height:60vh">
    <h1 class="mb-3">Halaman tidak ditemukan</h1>
    <p class="text-secondary mb-4">URL yang Anda akses belum tersedia.</p>
    <router-link to="/dashboard" class="btn btn-primary">Kembali ke Beranda</router-link>
  </div>
  
</template>

<script>
export default { name: 'NotFound' }
</script>


