import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5181/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('wm_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRequest = err.config?.url?.includes('/auth/');
    if (err.response?.status === 401 && !isAuthRequest && typeof window !== 'undefined') {
      localStorage.removeItem('wm_token');
      localStorage.removeItem('wm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Helper for dummy resolving promises
const dummyResolve = (data: any, message = '') => Promise.resolve({
  data: { success: true, message, data, errors: null }
} as any);

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string, inviteToken?: string) =>
    api.post('/auth/login', { email, password, inviteToken }),
  register: (data: { email: string; password: string; firstName: string; lastName: string; inviteToken?: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  changePassword: (..._args: any[]) => dummyResolve(true),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: object) => api.post('/auth/reset-password', data),
};

// ── Workspaces ────────────────────────────────────────────
export const workspacesApi = {
  getAll: () => api.get('/workspaces'),
  create: (data: { name: string }) => api.post('/workspaces', data),
  update: (id: number, data: { name: string }) => api.put(`/workspaces/${id}`, data),
  delete: (id: number) => api.delete(`/workspaces/${id}`),
  archive: (..._args: any[]) => dummyResolve(true),
  restore: (..._args: any[]) => dummyResolve(true),
  getMembers: (id: number) => api.get(`/workspaces/${id}/members`),
  addMember: (id: number, data: { userId: number }) => api.post(`/workspaces/${id}/members`, data),
  removeMember: (id: number, userId: number) => api.delete(`/workspaces/${id}/members/${userId}`),
  updateMemberRole: (..._args: any[]) => dummyResolve(true),
};

// ── Projects ──────────────────────────────────────────────
export const projectsApi = {
  getAll: (workspaceId: number) => api.get(`/projects?workspaceId=${workspaceId}`),
  getById: (id: number) => api.get(`/projects/${id}`),
  create: (data: object) => api.post('/projects', data),
  update: (id: number, data: object) => api.put(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
  getMembers: (id: number) => api.get(`/projects/${id}/members`),
  addMember: (id: number, userId: number) => api.post(`/projects/${id}/members`, { userId }),
  removeMember: (id: number, userId: number) => api.delete(`/projects/${id}/members/${userId}`),
};

// ── Boards ────────────────────────────────────────────────
export const boardsApi = {
  getByProject: (projectId: number) => api.get(`/boards?projectId=${projectId}`),
  getById: (id: number) => api.get(`/boards/${id}`),
  create: (data: object) => api.post('/boards', data),
  update: (id: number, data: object) => api.put(`/boards/${id}`, data),
  delete: (id: number) => api.delete(`/boards/${id}`),
  getMembers: (id: number) => api.get(`/boards/${id}/members`),
  addMember: (id: number, data: { userId: number }) => api.post(`/boards/${id}/members`, data),
  removeMember: (id: number, userId: number) => api.delete(`/boards/${id}/members/${userId}`),
  archive: (..._args: any[]) => dummyResolve(true),
  restore: (..._args: any[]) => dummyResolve(true),
  duplicate: (..._args: any[]) => dummyResolve(1),
  toggleFavorite: (..._args: any[]) => dummyResolve(true),
};

// ── Lists ─────────────────────────────────────────────────
export const listsApi = {
  getByBoard: (boardId: number) => api.get(`/lists?boardId=${boardId}`),
  create: (data: object) => api.post('/lists', data),
  update: (id: number, data: object) => api.put(`/lists/${id}`, data),
  reorder: (..._args: any[]) => dummyResolve(true),
  delete: (id: number) => api.delete(`/lists/${id}`),
  archive: (..._args: any[]) => dummyResolve(true),
  restore: (..._args: any[]) => dummyResolve(true),
  duplicate: (..._args: any[]) => dummyResolve(1),
  move: (..._args: any[]) => dummyResolve(true),
  sort: (..._args: any[]) => dummyResolve(true),
};

// ── Tasks ─────────────────────────────────────────────────
export const tasksApi = {
  getByBoard: (boardId: number, _filters?: any) => api.get(`/tasks/board/${boardId}`),
  getById: (id: number) => api.get(`/tasks/${id}`),
  create: (data: object) => api.post('/tasks', data),
  update: (id: number, data: object) => api.put(`/tasks/${id}`, data),
  move: (id: number, listId: number, position?: number) => api.post(`/tasks/${id}/move`, { listId, position }),
  reorder: (..._args: any[]) => dummyResolve(true),
  addLabel: (..._args: any[]) => dummyResolve(true),
  removeLabel: (..._args: any[]) => dummyResolve(true),
  delete: (id: number) => api.delete(`/tasks/${id}`),
  archive: (..._args: any[]) => dummyResolve(true),
  restore: (..._args: any[]) => dummyResolve(true),
  duplicate: (..._args: any[]) => dummyResolve({}),
  watch: (..._args: any[]) => dummyResolve(true),
  getMembers: (..._args: any[]) => dummyResolve([]),
  addMember: (..._args: any[]) => dummyResolve(true),
  removeMember: (..._args: any[]) => dummyResolve(true),
  getHistory: (..._args: any[]) => dummyResolve([]),
  getSubtasks: (..._args: any[]) => dummyResolve([]),
};

// ── Comments ──────────────────────────────────────────────
export const commentsApi = {
  getByTask: (taskId: number) => api.get(`/comments?taskId=${taskId}`),
  create: (data: { taskId: number; content: string; attachmentIds?: number[] }) => api.post('/comments', data),
  update: (..._args: any[]) => dummyResolve(true),
  delete: (id: number) => api.delete(`/comments/${id}`),
  togglePin: (..._args: any[]) => dummyResolve(true),
};

// ── Dummy / Removed APIs to maintain compilation ──────────
export const dashboardApi = {
  getStats: (..._args: any[]) => dummyResolve({
    totalProjects: 0,
    totalTasks: 0,
    overdueTasks: 0,
    completedToday: 0,
    inProgressTasks: 0,
    totalMembers: 0,
    tasksByStatus: [],
    tasksByPriority: [],
    recentActivities: [],
  })
};
export const rolesApi = {
  getAll: (..._args: any[]) => dummyResolve([
    { id: 1, name: 'Super Admin' },
    { id: 2, name: 'Admin' },
    { id: 3, name: 'Viewer' }
  ]),
  getPermissions: (..._args: any[]) => dummyResolve([]),
  getRolePermissions: (..._args: any[]) => dummyResolve([]),
  create: (..._args: any[]) => dummyResolve({}),
  setPermissions: (..._args: any[]) => dummyResolve(true),
};
export const notificationsApi = {
  getAll: (..._args: any[]) => dummyResolve([]),
  getUnreadCount: (..._args: any[]) => dummyResolve({ unreadCount: 0 }),
  markRead: (..._args: any[]) => dummyResolve(true),
  markAllRead: (..._args: any[]) => dummyResolve(true),
};
export const usersApi = {
  getAll: (workspaceId?: number) => api.get(workspaceId ? `/users?workspaceId=${workspaceId}` : '/users'),
  assignRoles: (id: number, roles: string[]) => api.post(`/users/${id}/roles`, roles),
  update: (id: number, data: { firstName: string; lastName: string; role?: string; phone?: string; jobTitle?: string; bio?: string }) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};
export const adminApi = {
  getPlatformSummary: () => api.get('/adminplatform/summary'),
};
export const invitationsApi = {
  create: (data: { email: string; workspaceId: number; projectId?: number; boardId?: number }) => api.post('/invitations', data),
  validate: (token: string) => api.get(`/invitations/validate?token=${token}`),
  accept: (token: string) => api.post(`/invitations/accept?token=${token}`),
};
export const auditApi = { getLogs: (..._args: any[]) => dummyResolve([]) };
export const departmentsApi = {
  getByWorkspace: (..._args: any[]) => dummyResolve([]),
  getById: (..._args: any[]) => dummyResolve({}),
  create: (..._args: any[]) => dummyResolve({}),
  update: (..._args: any[]) => dummyResolve({}),
  delete: (..._args: any[]) => dummyResolve(true),
};
export const labelsApi = {
  getByProject: (..._args: any[]) => dummyResolve([]),
  create: (..._args: any[]) => dummyResolve({}),
  update: (..._args: any[]) => dummyResolve({}),
  delete: (..._args: any[]) => dummyResolve(true),
};
export const checklistsApi = {
  getByTask: (..._args: any[]) => dummyResolve([]),
  create: (..._args: any[]) => dummyResolve({}),
  addItem: (..._args: any[]) => dummyResolve({}),
  toggleItem: (..._args: any[]) => dummyResolve(true),
  delete: (..._args: any[]) => dummyResolve(true),
  deleteItem: (..._args: any[]) => dummyResolve(true),
};
export const attachmentsApi = {
  getByTask: (taskId: number) => api.get(`/attachments?taskId=${taskId}`),
  upload: (taskId: number, file: File) => {
    const formData = new FormData();
    formData.append('taskId', taskId.toString());
    formData.append('file', file);
    return api.post('/attachments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id: number) => api.delete(`/attachments/${id}`),
};
export const workflowsApi = {
  getByProject: (..._args: any[]) => dummyResolve([]),
  getDetails: (..._args: any[]) => dummyResolve({}),
  create: (..._args: any[]) => dummyResolve({}),
  addState: (..._args: any[]) => dummyResolve({}),
  updateState: (..._args: any[]) => dummyResolve({}),
  deleteState: (..._args: any[]) => dummyResolve(true),
  addTransition: (..._args: any[]) => dummyResolve({}),
  deleteTransition: (..._args: any[]) => dummyResolve(true),
  delete: (..._args: any[]) => dummyResolve(true),
};
export const timeTrackingApi = {
  getByTask: (..._args: any[]) => dummyResolve([]),
  logTime: (..._args: any[]) => dummyResolve({}),
  delete: (..._args: any[]) => dummyResolve(true),
};
export const activitiesApi = {
  getByTask: (taskId: number) => api.get(`/activities?taskId=${taskId}`),
  getByProject: (..._args: any[]) => dummyResolve([]),
  getByBoard: (..._args: any[]) => dummyResolve([]),
  getByUser: (..._args: any[]) => dummyResolve([]),
  getByWorkspace: (..._args: any[]) => dummyResolve([]),
};
export const searchApi = { query: (..._args: any[]) => dummyResolve([]) };
export const settingsApi = {
  getAll: (..._args: any[]) => dummyResolve([]),
  save: (..._args: any[]) => dummyResolve(true),
};
export const customFieldsApi = {
  getDefinitions: (..._args: any[]) => dummyResolve([]),
  createDefinition: (..._args: any[]) => dummyResolve({}),
  updateDefinition: (..._args: any[]) => dummyResolve({}),
  deleteDefinition: (..._args: any[]) => dummyResolve(true),
  getTaskValues: (..._args: any[]) => dummyResolve([]),
  saveTaskValues: (..._args: any[]) => dummyResolve(true),
};
export const organizationsApi = {
  getAll: (..._args: any[]) => dummyResolve([]),
  getById: (..._args: any[]) => dummyResolve({}),
  create: (..._args: any[]) => dummyResolve({}),
};

export const getAttachmentUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5181/api').replace(/\/api$/, '');
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default api;
