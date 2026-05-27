import identityAxios from '../config/identityAxios';

export const updateAccount = (id, data) => 
    identityAxios.put(`/accounts/${id}`, data).then(res => res.data);
