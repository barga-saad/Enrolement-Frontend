/**
 * API Configuration and Client
 * Axios instance with interceptors for auth and error handling
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { LoginResponse, ApiError, ApiResponse } from '../types';
import { storage } from '../utils/helpers';
import { logger } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const REQUEST_ID_HEADER = 'X-Request-Id';

const generateRequestId = (): string => {
  return `fe-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - Add auth token
  client.interceptors.request.use((config) => {
    const requestId = generateRequestId();
    (config as any).metadata = {
      startedAt: Date.now(),
      requestId,
    };
    config.headers[REQUEST_ID_HEADER] = requestId;

    const token = storage.get('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    logger.debug('Outgoing API request', {
      method: config.method?.toUpperCase(),
      url: config.url,
      requestId,
    });

    return config;
  });

  // Response interceptor - Handle errors
  client.interceptors.response.use(
    (response) => {
      const metadata = (response.config as any).metadata as { startedAt?: number; requestId?: string } | undefined;
      const durationMs = metadata?.startedAt ? Date.now() - metadata.startedAt : undefined;
      const responseRequestId = response.headers?.['x-request-id'] || metadata?.requestId;

      logger.info('API response received', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        durationMs,
        requestId: responseRequestId,
      });

      return response;
    },
    (error: AxiosError<ApiError>) => {
      const config = error.config as any;
      const metadata = config?.metadata as { startedAt?: number; requestId?: string } | undefined;
      const durationMs = metadata?.startedAt ? Date.now() - metadata.startedAt : undefined;
      const status = error.response?.status;

      logger.error(
        'API request failed',
        {
          method: config?.method?.toUpperCase(),
          url: config?.url,
          status,
          durationMs,
          requestId: error.response?.headers?.['x-request-id'] || metadata?.requestId,
        },
        error
      );

      if (error.response?.status === 401) {
        // Token expired or invalid
        storage.remove('authToken');
        storage.remove('user');
        logger.warn('Session expired, redirecting to login', {
          url: config?.url,
          requestId: metadata?.requestId,
        });
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();

/**
 * API Service methods
 */
export const apiService = {
  // Auth endpoints
  login: (username: string, password: string) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/login', { username, password }),

  logout: () =>
    apiClient.post('/auth/logout'),

  changePassword: (username: string, newPassword: string) =>
    apiClient.post('/auth/change-password', { username, newPassword }),

  getMe: (token: string) =>
    apiClient.get<ApiResponse<LoginResponse>>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // User endpoints
  getUsers: () =>
    apiClient.get('/admin/users'),

  getUser: (id: number) =>
    apiClient.get(`/admin/users/${id}`),

  createUser: (data: any) =>
    apiClient.post('/admin/users', data),

  updateUser: (id: number, data: any) =>
    apiClient.put(`/admin/users/${id}`, data),

  deleteUser: (id: number) =>
    apiClient.delete(`/admin/users/${id}`),

  assignRoleToUser: (userId: number, roleId: number) =>
    apiClient.post(`/admin/users/${userId}/roles`, { roleId }),

  revokeRoleFromUser: (userId: number, roleId: number) =>
    apiClient.delete(`/admin/users/${userId}/roles/${roleId}`),

  getUserRoles: (userId: number) =>
    apiClient.get(`/admin/users/${userId}/roles`),

  // Role endpoints
  getRoles: () =>
    apiClient.get('/admin/roles'),

  getRole: (id: number) =>
    apiClient.get(`/admin/roles/${id}`),

  createRole: (data: any) =>
    apiClient.post('/admin/roles', data),

  updateRole: (id: number, data: any) =>
    apiClient.put(`/admin/roles/${id}`, data),

  deleteRole: (id: number) =>
    apiClient.delete(`/admin/roles/${id}`),

  assignPermissionToRole: (roleId: number, permissionId: number) =>
    apiClient.post(`/admin/roles/${roleId}/permissions`, { permissionId }),

  removePermissionFromRole: (roleId: number, permissionId: number) =>
    apiClient.delete(`/admin/roles/${roleId}/permissions/${permissionId}`),

  getRolePermissions: (roleId: number) =>
    apiClient.get(`/admin/roles/${roleId}/permissions`),

  // Permission endpoints
  getPermissions: () =>
    apiClient.get('/admin/permissions'),

  getPermission: (id: number) =>
    apiClient.get(`/admin/permissions/${id}`),

  createPermission: (data: any) =>
    apiClient.post('/admin/permissions', data),

  updatePermission: (id: number, data: any) =>
    apiClient.put(`/admin/permissions/${id}`, data),

  deletePermission: (id: number) =>
    apiClient.delete(`/admin/permissions/${id}`),

  getOwnerCheckPermissions: () =>
    apiClient.get('/admin/permissions/owner-check/true'),

  // Partner endpoints
  getPartners: () =>
    apiClient.get('/v1/read/partners'),

  getPartner: (id: string) =>
    apiClient.get(`/getpartner/${id}`),

  createPartner: (data: any) =>
    apiClient.post('/v1/create/partners', data),

  updatePartner: (id: string, data: any) =>
    apiClient.put('/v1/update/partners', { ...data, id }),

  deletePartner: (id: string) =>
    apiClient.delete('/v1/delete/partners', { params: { partnerReferenceNumber: id } }),

  // Transfer endpoints
  getTransfers: () =>
    apiClient.get('/v1/read/transfers'),

  getPartnerTransfers: (partnerId: string) =>
    apiClient.get(`/gealltransfers/${partnerId}`),

  createTransfer: (data: any) =>
    apiClient.post('/v1/create/transfers', data),

  updateTransfer: (id: string, data: any) =>
    apiClient.put('/v1/update/transfers', { ...data, id }),

  deleteTransfer: (id: string) =>
    apiClient.delete('/v1/delete/transfers', { params: { transferReferenceNumber: id } }),

  // Validation endpoints
  submitForValidation: (partnerId: number) =>
    apiClient.post(`/v1/validations/partners/${partnerId}/submit`),

  saveDraft: (partnerId: number) =>
    apiClient.post(`/v1/validations/partners/${partnerId}/draft`),

  validatePartner: (validationId: number) =>
    apiClient.post(`/v1/validations/${validationId}/validate`),

  rejectPartner: (validationId: number, reason: string) =>
    apiClient.post(`/v1/validations/${validationId}/reject`, { reason }),

  getPendingValidations: () =>
    apiClient.get('/v1/validations/pending'),

  getDraftValidations: () =>
    apiClient.get('/v1/validations/drafts'),

  getValidationHistory: (partnerId: number) =>
    apiClient.get(`/v1/validations/history/${partnerId}`),

  getValidation: (validationId: number) =>
    apiClient.get(`/v1/validations/${validationId}`),

  // Export endpoints
  exportPartnersCsv: () =>
    apiClient.get('/v1/export/partners', { responseType: 'blob' }),

  // Audit log endpoints
  getAuditLogs: (page = 0, size = 20) =>
    apiClient.get(`/admin/audit-logs?page=${page}&size=${size}`),

  getAuditLogsByEntity: (entityType: string, page = 0, size = 20) =>
    apiClient.get(`/admin/audit-logs/by-entity?entityType=${entityType}&page=${page}&size=${size}`),

  getAuditLogsByUser: (userId: number, page = 0, size = 20) =>
    apiClient.get(`/admin/audit-logs/by-user/${userId}?page=${page}&size=${size}`),
};
