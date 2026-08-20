import API from "../../../shared/services/api";

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  return API.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getResumeHistory = () => API.get("/resume/history");
