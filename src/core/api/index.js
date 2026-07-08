/**
 * Barrel file — core/api
 * Export tất cả Axios instances để import từ 1 nơi duy nhất.
 *
 * Ví dụ sử dụng trong service:
 *   import { leadApi } from '../../core/api';
 */
export { default as identityApi }   from './identityApi';
export { default as schedulingApi } from './schedulingApi';
export { default as leadApi }       from './leadApi';
export { default as studentApi }    from './studentApi';
export { default as enrollmentApi } from './enrollmentApi';
export { default as tuitionApi }    from './tuitionApi';
export { createServiceAxios }       from './axiosFactory';
