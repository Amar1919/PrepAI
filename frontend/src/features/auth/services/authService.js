import API from "../../../shared/services/api";

export const signup = (name, email, password) =>
  API.post("/auth/signup", { name, email, password });

export const login = (email, password) =>
  API.post("/auth/login", { email, password });

export const forgotPassword = (email) =>
  API.post("/auth/forgot-password", { email });

export const resetPassword = (token, password) =>
  API.post("/auth/reset-password", { token, password });