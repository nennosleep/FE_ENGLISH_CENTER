import identityAxios from "../config/identityAxios";

/* =========================
   GET ALL SPECIALIZATIONS
========================= */
export const getSpecializations = async () => {
  const response = await identityAxios.get("/specializations");
  console.log(response.data);
  return response.data.data;
};

/* =========================
   GET SPECIALIZATION BY ID
========================= */
export const getSpecializationById = async (id) => {
  const response = await identityAxios.get(`/specializations/${id}`);
  console.log(response.data);
  return response.data.data;
};

/* =========================
   GET SPECIALIZATION BY CODE
========================= */
export const getSpecializationByCode = async (code) => {
  const response = await identityAxios.get(`/specializations/code/${code}`);
  console.log(response.data);
  return response.data.data;
};

/* =========================
   CREATE SPECIALIZATION
========================= */
export const createSpecialization = async (specializationData) => {
  const response = await identityAxios.post(
    "/specializations",
    specializationData
  );

  console.log(response.data);

  return response.data.data;
};

/* =========================
   UPDATE SPECIALIZATION
========================= */
export const updateSpecialization = async (id, specializationData) => {
  const response = await identityAxios.put(
    `/specializations/${id}`,
    specializationData
  );

  console.log(response.data);

  return response.data.data;
};

/* =========================
   DELETE SPECIALIZATION
========================= */
export const deleteSpecialization = async (id) => {
  const response = await identityAxios.delete(`/specializations/${id}`);

  console.log(response.data);

  return response.data;
};
