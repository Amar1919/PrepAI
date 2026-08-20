import API from "../../../shared/services/api";

export const getCompanies = () => API.get("/companies");

export const getCompany = (id) => API.get(`/companies/${id}`);
