import API from "../../../shared/services/api";

export const getProblems = () => API.get("/dsa/problems");

export const getProblem = (id) => API.get(`/dsa/problems/${id}`);

export const submitCode = ({ problemId, code, language }) =>
  API.post("/dsa/submit", { problemId, code, language });

export const getSubmissions = () => API.get("/dsa/submissions");
