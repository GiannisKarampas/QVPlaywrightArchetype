import { APIRequestContext } from '@playwright/test';
import { BaseAPI } from '@core/base/BaseAPI';
import {
  IUser,
  ICreateUserRequest,
  IUpdateUserRequest,
  IAPIResponse,
  IPaginatedResponse,
} from '@types/api.types';
import logger from '@core/helpers/logger';

export class UserService extends BaseAPI {
  constructor(apiContext: APIRequestContext) {
    super(apiContext);
  }

  async createUser(userData: ICreateUserRequest): Promise<IAPIResponse<IUser>> {
    logger.info(`Creating user: ${userData.email}`);

    const response = await this.post<IUser>('/users', userData);
    await this.expectStatusCreated(response);

    return response;
  }

  async getUser(userId: string): Promise<IAPIResponse<IUser>> {
    logger.info(`Getting user: ${userId}`);

    const response = await this.get<IUser>(`/users/${userId}`);
    await this.expectStatusOk(response);

    return response;
  }

  async getUsers(params?: {
    page?: number;
    pageSize?: number;
    role?: string;
  }): Promise<IAPIResponse<IPaginatedResponse<IUser>>> {
    logger.info('Getting users list');

    const response = await this.get<IPaginatedResponse<IUser>>('/users', {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        ...(params?.role && { role: params.role }),
      },
    });

    await this.expectStatusOk(response);

    return response;
  }

  async updateUser(
    userId: string,
    userData: IUpdateUserRequest,
  ): Promise<IAPIResponse<IUser>> {
    logger.info(`Updating user: ${userId}`);

    const response = await this.patch<IUser>(`/users/${userId}`, userData);
    await this.expectStatusOk(response);

    return response;
  }

  async deleteUser(userId: string): Promise<IAPIResponse<void>> {
    logger.info(`Deleting user: ${userId}`);

    const response = await this.delete<void>(`/users/${userId}`);
    await this.expectStatusNoContent(response);

    return response;
  }

  async getCurrentUser(): Promise<IAPIResponse<IUser>> {
    logger.info('Getting current user');

    const response = await this.get<IUser>('/users/me');
    await this.expectStatusOk(response);

    return response;
  }

  async updateCurrentUser(userData: IUpdateUserRequest): Promise<IAPIResponse<IUser>> {
    logger.info('Updating current user');

    const response = await this.patch<IUser>('/users/me', userData);
    await this.expectStatusOk(response);

    return response;
  }

  async searchUsers(query: string): Promise<IAPIResponse<IUser[]>> {
    logger.info(`Searching users: ${query}`);

    const response = await this.get<IUser[]>('/users/search', {
      params: { q: query },
    });

    await this.expectStatusOk(response);

    return response;
  }
}
