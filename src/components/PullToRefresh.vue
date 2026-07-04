<script setup>
import { onMounted } from 'vue';
import PullToRefresh from 'pulltorefreshjs';

onMounted(() => {
  PullToRefresh.init({
    mainElement: '#app',
    onRefresh() { window.location.reload(); }
  });
});
</script>

