<template>
  <section class="why-choose-us-section py-5">
    <div class="container">
      <h2 class="text-center mb-5">Mengapa Memilih Kami?</h2>
      <div class="row">
        <div
          v-for="feature in features"
          :key="feature.id"
          class="col-md-4 text-center"
        >
          <div class="feature-card">
            <div class="icon-wrapper mb-4">
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
        icon: 'fas fa-check-circle',
        title: 'Produk Berkualitas',
        description: 'Semua produk UMKM kami telah melalui proses kurasi untuk menjamin kualitas terbaik.'
      },
      {
        id: 2,
        icon: 'fas fa-truck',
        title: 'Pengiriman Cepat',
        description: 'Kami bekerja sama dengan berbagai jasa pengiriman untuk memastikan produk sampai tepat waktu.'
      },
      {
        id: 3,
        icon: 'fas fa-heart',
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
.why-choose-us-section {
  padding: 80px 0;
  background-color: #f8f9fa; /* A light grey background to separate the section */
}

h2 {
  font-weight: 700;
  margin-bottom: 3rem;
}

.feature-card {
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 15px;
  height: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--bs-primary);
  color: #ffffff;
  margin-bottom: 1.5rem;
  font-size: 2.5rem; /* Adjust icon size */
  transition: all 0.3s ease;
}

.feature-card:hover .icon-wrapper {
  background-color: var(--bs-dark);
}

h4 {
  font-weight: 700;
  color: var(--bs-dark);
  margin-bottom: 1rem;
}

p {
  color: var(--bs-secondary);
  line-height: 1.7;
}
</style>

