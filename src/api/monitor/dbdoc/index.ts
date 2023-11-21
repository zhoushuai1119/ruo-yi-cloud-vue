import request from '@/utils/request';

// 导出 html 格式的数据文档
export function exportHtml() {
  return request({
    url: '/monitor/database/doc/exportHtml',
    method: 'get',
    responseType: 'blob'
  });
}

