import API from "../../../shared/services/api";

export const generateInterview = ({ role, experience, skills, company }) =>
  API.post("/interview/generate", { role, experience, skills, company });

export const getInterviewHistory = () => API.get("/interview/history");

export const deleteInterview = (id) => API.delete(`/interview/${id}`);

export const evaluateAnswer = ({ question, answer, interviewId, questionIndex }) =>
  API.post("/interview/evaluate", { question, answer, interviewId, questionIndex });
