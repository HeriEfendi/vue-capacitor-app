<template>
  <section class="py-5">
    <div class="container">
      <h2 class="text-center mb-4">Mengapa Memilih Kami?</h2>
      <div class="row">
        <div
          v-for="feature in features"
          :key="feature.id"
          class="col-md-4 text-center"
        >
          <div class="feature-card">
            <div class="mb-4">
              <i :class="feature.icon"></i>
            </div>
            <h4>{{ feature.title }}</h4>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'WhyChooseUs',
  setup() {
    const features = [
      {
        id: 1,
        icon: 'fas fa-check-circle fa-3x text-primary',
        title: 'Produk Berkualitas',
        description: 'Semua produk UMKM kami telah melalui proses kurasi untuk menjamin kualitas terbaik.'
      },
      {
        id: 2,
        icon: 'fas fa-truck fa-3x text-primary',
        title: 'Pengiriman Cepat',
        description: 'Kami bekerja sama dengan berbagai jasa pengiriman untuk memastikan produk sampai tepat waktu.'
      },
      {
        id: 3,
        icon: 'fas fa-heart fa-3x text-primary',
        title: 'Mendukung UMKM Lokal',
        description: 'Setiap pembelian Anda membantu mengembangkan UMKM lokal di Indonesia.'
      }
    ]

    return {
      features
    }
  }
}
</script>

<style scoped>
.feature-card {
  padding: 20px;
  height: 100%;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card i {
  color: var(--bs-primary);
  margin-bottom: 1rem;
}

h4 {
  font-weight: 600;
  margin-bottom: 1rem;
}

p {
  color: #6c757d;
  line-height: 1.6;
}
</style>

