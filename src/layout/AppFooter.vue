<template>
  <CFooter>
    <div>
      <span>&copy; {{ new Date().getFullYear() }} H DEV.</span>
    </div>
    <div>
      <span>Powered by</span>
      <a href="https://coreui.io/vue/" target="_blank">CoreUI for Vue</a>
    </div>
  </CFooter>
</template>

<script>
import { CFooter } from '@coreui/vue'
export default {
  name: 'AppFooter',
  components: { CFooter },
}
</script>
