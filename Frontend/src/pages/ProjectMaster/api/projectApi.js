import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// PROJECT MASTER CRUD
export const createProject = (data) => API.post("/projects", data);

export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const getProject = (id) => API.get(`/projects/${id}`);

// LOCATION
export const saveLocation = (id, data) => API.post(`/projects/${id}/location`, data);

// TEAM
export const saveTeam = (id, data) => API.post(`/projects/${id}/team`, data);

// MANPOWER
export const saveManpower = (id, data) => API.post(`/projects/${id}/manpower`, data);

// MATERIALS
export const saveMaterials = (id, data) => API.post(`/projects/${id}/materials`, data);

// TOOLS
export const saveTools = (id, data) => API.post(`/projects/${id}/tools`, data);

// DOCUMENTS
export const uploadDocument = (id, formData) =>
  API.post(`/projects/${id}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// BUDGET
export const saveBudget = (id, data) => API.post(`/projects/${id}/budget`, data);

// TRANSPORT
export const saveTransport = (id, data) => API.post(`/projects/${id}/transport`, data);

// STATUS
export const saveStatus = (id, data) => API.put(`/projects/${id}/status`, data);

// TIMELINE
export const saveTimeline = (id, data) => API.put(`/projects/${id}/timeline`, data);