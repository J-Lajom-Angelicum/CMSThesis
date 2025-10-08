// api/userApi.ts
import api from "./axios";

export const getDoctors = async () => {
  const res = await api.get("/users?role=DOCTOR");
  return res.data;
};