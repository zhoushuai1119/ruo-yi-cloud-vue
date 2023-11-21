<template>
  <div>
    <i-frame v-model:src="url"></i-frame>
  </div>
</template>

<script setup lang="ts">
import {exportHtml} from "@/api/monitor/dbdoc";

const url = ref('');

/** 导出 html 格式的数据文档 */
const exportDocHtml = async () => {
  const res = await exportHtml();
  let blob = new Blob([res as any], {type: 'text/html'});
  url.value = window.URL.createObjectURL(blob);
}

onMounted(() => {
  exportDocHtml();
})
</script>
