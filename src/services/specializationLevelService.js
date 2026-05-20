import schedulingAxios from "../config/identityAxios";

/* =========================
   GET ALL LEVELS
========================= */
export const getSpecializationLevels = async () => {
  const response = await schedulingAxios.get("/specialization-levels");

  console.log(response.data);

  return response.data.data;
};

/* =========================
   GET LEVEL BY ID
========================= */
export const getSpecializationLevelById = async (id) => {
  const response = await schedulingAxios.get(`/specialization-levels/${id}`);

  console.log(response.data);

  return response.data.data;
};

/* =========================
   GET LEVEL BY CODE
========================= */
export const getSpecializationLevelByCode = async (code) => {
  const response = await schedulingAxios.get(
    `/specialization-levels/code/${code}`
  );

  console.log(response.data);

  return response.data.data;
};

/* =========================
   GET LEVELS BY SPECIALIZATION ID
========================= */
export const getLevelsBySpecializationId = async (specializationId) => {
  const response = await schedulingAxios.get(
    `/specialization-levels/specialization/${specializationId}`
  );

  console.log(response.data);

  return response.data.data;
};

/* =========================
   CREATE LEVEL
========================= */
export const createSpecializationLevel = async (levelData) => {
  const response = await schedulingAxios.post(
    "/specialization-levels",
    levelData
  );

  console.log(response.data);

  return response.data.data;
};

/* =========================
   UPDATE LEVEL
========================= */
export const updateSpecializationLevel = async (id, levelData) => {
  const response = await schedulingAxios.put(
    `/specialization-levels/${id}`,
    levelData
  );

  console.log(response.data);

  return response.data.data;
};

/* =========================
   DELETE LEVEL
========================= */
export const deleteSpecializationLevel = async (id) => {
  const response = await schedulingAxios.delete(`/specialization-levels/${id}`);

  console.log(response.data);

  return response.data;
};
