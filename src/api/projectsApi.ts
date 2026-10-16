import apiClient from "./ConfigAxios";

export interface Project {
    id: string | number;
    name: string;
    description: string;
    [key: string]: any;
}

export async function getProjects(): Promise<Project[]> {
    const response: any = await apiClient.get("/api/projects");
    return Array.isArray(response) ? response : response?.data || [];
}

export interface NewProject {
    name: string;
    description: string;
    status: string;
    owner: string;
    startDate: string;
    dueDate: string;
}

export async function createProject(project: NewProject): Promise<Project> {
    return apiClient.post("/api/projects", project);
}

export async function getProject(id: string | number): Promise<Project> {
    const response: any = await apiClient.get(`/api/projects/${id}`);
    return response?.data || response;
}

export async function deleteProject(id: string | number): Promise<void> {
    await apiClient.delete(`/api/projects/${id}`);
}

export interface ProjectPayload {
    name: string;
    description: string;
    status: string;
    owner: string;
    startDate: string | null;
    dueDate: string | null;
}

export async function updateProject({
    id,
    data,
}: {
    id: string | number;
    data: ProjectPayload;
}): Promise<Project> {
    return apiClient.put(`/api/projects/${id}`, data);
}

export interface ProjectFilters {
    status: string;
    keyword: string;
}

export async function searchProjects(filters: ProjectFilters): Promise<Project[]> {
    const params: Record<string, string> = {};
    if (filters.status) params.status = filters.status;
    if (filters.keyword.trim()) params.keyword = filters.keyword.trim();

    const response: any = await apiClient.get("/api/projects", { params });
    return Array.isArray(response) ? response : response?.data || [];
}