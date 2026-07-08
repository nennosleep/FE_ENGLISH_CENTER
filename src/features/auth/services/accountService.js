import identityAxios from '../../../core/api/identityApi';

export const updateAccount = (id, data) => 
    identityAxios.put(`/accounts/${id}`, data).then(res => res.data);
