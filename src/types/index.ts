/**
 * TypeScript Type Definitions
 * Shared types for the entire application
 */

// Auth Types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roleNames: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isDeleted: boolean;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Role Types
export interface Role {
  id: number;
  roleName: string;
  description: string;
  isActive: boolean;
  permissionNames: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isDeleted: boolean;
}

export interface RoleCreateRequest {
  roleName: string;
  description: string;
  isActive: boolean;
}

export interface RoleUpdateRequest {
  description: string;
  isActive: boolean;
}

// Permission Types
export interface Permission {
  id: number;
  permissionName: string;
  endpoint: string;
  httpMethod: string;
  description: string;
  requiresOwnerCheck: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isDeleted: boolean;
}

export interface PermissionCreateRequest {
  permissionName: string;
  endpoint: string;
  httpMethod: string;
  description: string;
  requiresOwnerCheck: boolean;
  isActive: boolean;
}

export interface PermissionUpdateRequest {
  description: string;
  requiresOwnerCheck: boolean;
  isActive: boolean;
}

// Partner Types
export interface Partner {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  referenceNumber: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'ARCHIVED';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PartnerCreateRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface PartnerUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
}

// Transfer Types
export interface Transfer {
  id: number;
  amount: number;
  currency: string;
  status: 'PENDING' | 'AUTHORIZED' | 'COMPLETED' | 'REJECTED';
  partnerId: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TransferCreateRequest {
  amount: number;
  currency: string;
  partnerId: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Error Types
export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
  path: string;
  errors?: Record<string, string[]>;
}
