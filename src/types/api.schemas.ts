import { z } from 'zod';

/**
 * API Schema Validation using Zod
 *
 * Benefits:
 * - Type-safe schema validation
 * - Catches breaking API changes
 * - Documents expected response structure
 * - Runtime validation (not just TypeScript compile-time)
 */

// ============================================================================
// Auth Schemas
// ============================================================================

export const TokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
  expiresIn: z.number().optional(),
  tokenType: z.string().optional().default('Bearer'),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['user', 'admin', 'moderator']).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const LoginResponseSchema = z.object({
  user: UserSchema,
  tokens: TokensSchema,
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// ============================================================================
// User Schemas
// ============================================================================

export const CreateUserRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['user', 'admin', 'moderator']).optional().default('user'),
});

export const UpdateUserRequestSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(['user', 'admin', 'moderator']).optional(),
});

export const UserResponseSchema = UserSchema;

export const UsersListResponseSchema = z.object({
  data: z.array(UserSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// ============================================================================
// Generic Schemas
// ============================================================================

export const PaginationParamsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(10),
});

export const ErrorResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
});

export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string().optional(),
});

export const ValidationErrorsResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  errors: z.array(ValidationErrorSchema),
});

export const SuccessMessageSchema = z.object({
  message: z.string(),
});

// ============================================================================
// Type Inference (Get TypeScript types from Zod schemas)
// ============================================================================

export type Tokens = z.infer<typeof TokensSchema>;
export type User = z.infer<typeof UserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UsersListResponse = z.infer<typeof UsersListResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type ValidationErrorsResponse = z.infer<typeof ValidationErrorsResponseSchema>;
export type SuccessMessage = z.infer<typeof SuccessMessageSchema>;
