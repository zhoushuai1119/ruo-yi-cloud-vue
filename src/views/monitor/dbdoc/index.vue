<template>
  <div>
    <i-frame v-if="!loading" v-loading="loading" v-model:src="src"></i-frame>
  </div>
</template>

<script setup lang="ts">
import * as DbDocApi from '@/api/monitor/dbdoc'

const loading = ref(true) // 是否加载中
const src = ref('') // HTML 的地址

/** 页面加载 */
const init = async () => {
  try {
    const data = await DbDocApi.exportHtml()
    const blob = new Blob([data as any], {type: 'text/html'})
    src.value = window.URL.createObjectURL(blob)
  } finally {
    loading.value = false
  }
}

/** 初始化 */
onMounted(async () => {
  await init()
})
</script>
