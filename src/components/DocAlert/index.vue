<template>
  <el-alert type="success" show-icon>
    <template #title>
      <div @click="goToUrl">{{ '【' + title + '】文档地址：' + url }}</div>
    </template>
  </el-alert>
</template>
<script setup lang="ts">
import { propTypes } from '@/utils/propTypes'

const props = defineProps({
  title: propTypes.string,
  url: propTypes.string
})

/** 跳转 URL 链接 */
const goToUrl = () => {
  window.open(props.url)
}
</script>
<style scoped>
.el-alert--success.is-light {
  margin-bottom: 20px;
  cursor: pointer;
  border: 1px solid green;
}
</style>
