import API from "../../../shared/services/api";

// Every API call this feature needs lives here - components never call
// axios/API directly, they call these named functions instead.
export const signup = (name, email, password) =>
  API.post("/auth/signup", { name, email, password });

export const login = (email, password) =>
  API.post("/auth/login", { email, password });
