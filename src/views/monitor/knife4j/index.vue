<template>
  <div>
    <i-frame v-model:src="url"></i-frame>
  </div>
</template>

<script setup lang="ts">
const url = ref(import.meta.env.VITE_APP_KNIFE4J_ADMIN);
</script>
