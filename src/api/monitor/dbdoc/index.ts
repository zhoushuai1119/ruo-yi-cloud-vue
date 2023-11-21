import request from '@/utils/request';

// 导出 html 格式的数据文档
export function exportHtml() {
  return request({
    url: '/monitor/database/doc/exportHtml',
    method: 'get',
    responseType: 'blob'
  });
}

// 导出 markdown 格式的数据文档
export function exportMarkdown() {
  return request({
    url: '/monitor/database/doc/exportMarkdown',
    method: 'get',
    responseType: 'blob'
  });
}

// 导出 word 格式的数据文档
export function exportWord() {
  return request({
    url: '/monitor/database/doc/exportWord',
    method: 'get',
    responseType: 'blob'
  });
}

