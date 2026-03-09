<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    <main class="max-w-6xl mx-auto px-4 py-6">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from './components/common/Header.vue'
import Footer from './components/common/Footer.vue'
</script>
