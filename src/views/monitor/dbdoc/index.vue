<template>
  <div>
    <div class="ml20 mt20">
      <doc-alert title="数据库文档" url="https://gitee.com/leshalv/screw" />
      <el-button type="primary" plain icon="Download" @click="handleExport('HTML')">导出 HTML</el-button>
      <el-button type="primary" plain icon="Download" @click="handleExport('Word')">导出 Word</el-button>
      <el-button type="primary" plain icon="Download" @click="handleExport('Markdown')">导出 Markdown</el-button>
    </div>
    <i-frame v-if="!loading" v-loading="loading" v-model:src="src"></i-frame>
  </div>
</template>

<script setup lang="ts">
const {proxy} = getCurrentInstance() as ComponentInternalInstance;
import * as DbDocApi from '@/api/monitor/dbdoc';

const loading = ref(true)
const src = ref('')

/** 页面加载 */
const init = async () => {
  try {
    const res = await DbDocApi.exportHtml();
    const blob = new Blob([res as any], {type: 'text/html'});
    src.value = window.URL.createObjectURL(blob);
  } finally {
    loading.value = false;
  }
}

/** 处理导出  */
const handleExport = async (type: string) => {
  if (type === 'HTML') {
    const res = await DbDocApi.exportHtml();
    proxy?.$download.export(res as any, '数据库文档.html', 'text/html');
  }
  if (type === 'Word') {
    const res = await DbDocApi.exportWord();
    proxy?.$download.export(res as any, '数据库文档.doc', 'application/msword');
  }
  if (type === 'Markdown') {
    const res = await DbDocApi.exportMarkdown();
    proxy?.$download.export(res as any, '数据库文档.md', 'text/markdown');
  }
}

/** 初始化 */
onMounted(async () => {
  await init()
})
</script>
