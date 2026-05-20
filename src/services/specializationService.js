import schedulingAxios from "../config/identityAxios";

/* =========================
   GET ALL SPECIALIZATIONS
========================= */
export const getSpecializations = async () => {
  const response = await schedulingAxios.get("/specializations");
  console.log(response.data);
  return response.data.data;
};

/* =========================
   GET SPECIALIZATION BY ID
========================= */
export const getSpecializationById = async (id) => {
  const response = await schedulingAxios.get(`/specializations/${id}`);
  console.log(response.data);
  return response.data.data;
};

/* =========================
   GET SPECIALIZATION BY CODE
========================= */
export const getSpecializationByCode = async (code) => {
  const response = await schedulingAxios.get(`/specializations/code/${code}`);
  console.log(response.data);
  return response.data.data;
};

/* =========================
   CREATE SPECIALIZATION
========================= */
export const createSpecialization = async (specializationData) => {
  const response = await schedulingAxios.post(
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
  const response = await schedulingAxios.put(
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
  const response = await schedulingAxios.delete(`/specializations/${id}`);

  console.log(response.data);

  return response.data;
};
