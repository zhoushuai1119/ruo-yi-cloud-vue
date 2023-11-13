import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DatasourceVO, DatasourceForm, DatasourceQuery } from '@/api/system/datasource/types';

/**
 * 查询多数据源配置列表
 * @param query
 * @returns {*}
 */

export const listDatasource = (query?: DatasourceQuery): AxiosPromise<DatasourceVO[]> => {
  return request({
    url: '/system/datasource/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询多数据源配置详细
 * @param id
 */
export const getDatasource = (id: string | number): AxiosPromise<DatasourceVO> => {
  return request({
    url: '/system/datasource/' + id,
    method: 'get'
  });
};

/**
 * 新增多数据源配置
 * @param data
 */
export const addDatasource = (data: DatasourceForm) => {
  return request({
    url: '/system/datasource',
    method: 'post',
    data: data
  });
};

/**
 * 修改多数据源配置
 * @param data
 */
export const updateDatasource = (data: DatasourceForm) => {
  return request({
    url: '/system/datasource',
    method: 'put',
    data: data
  });
};

/**
 * 删除多数据源配置
 * @param id
 */
export const delDatasource = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/datasource/' + id,
    method: 'delete'
  });
};
