export interface IAPIResponse<T = unknown> {
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
}

export interface IAPIError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

export interface IAPIRequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  data?: unknown;
  retries?: number;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  user: IUser;
  tokens: IAuthTokens;
}

export interface IUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface IUpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IAPIValidationError {
  field: string;
  message: string;
  code?: string;
}
