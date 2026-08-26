import API from "../../../shared/services/api";

export const getProfile = () => API.get("/user/profile");

export const updateProfile = ({ name, targetRole }) =>
  API.put("/user/profile", { name, targetRole });

export const getStats = () => API.get("/user/stats");

export const deleteAccount = (password) =>
  API.delete("/user/account", { data: { password } });
