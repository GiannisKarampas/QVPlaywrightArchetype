import { APIRequestContext } from '@playwright/test';
import { BaseAPI } from '@core/base/BaseAPI';
import {
  ILoginRequest,
  ILoginResponse,
  IAuthTokens,
  IAPIResponse,
} from '@types/api.types';
import logger from '@core/helpers/logger';

export class AuthService extends BaseAPI {
  constructor(apiContext: APIRequestContext) {
    super(apiContext);
  }

  async login(credentials: ILoginRequest): Promise<IAPIResponse<ILoginResponse>> {
    logger.info(`Logging in user: ${credentials.email}`);

    const response = await this.post<ILoginResponse>('/auth/login', credentials);
    await this.expectStatusOk(response);

    if (response.data.tokens?.accessToken) {
      this.setAuthToken(response.data.tokens.accessToken);
      logger.info('Auth token set after successful login');
    }

    return response;
  }

  async logout(): Promise<IAPIResponse<void>> {
    logger.info('Logging out user');

    const response = await this.post<void>('/auth/logout');
    this.removeAuthToken();

    return response;
  }

  async refreshToken(refreshToken: string): Promise<IAPIResponse<IAuthTokens>> {
    logger.info('Refreshing auth token');

    const response = await this.post<IAuthTokens>('/auth/refresh', {
      refreshToken,
    });

    await this.expectStatusOk(response);

    if (response.data.accessToken) {
      this.setAuthToken(response.data.accessToken);
      logger.info('Auth token refreshed');
    }

    return response;
  }

  async verifyToken(token: string): Promise<IAPIResponse<{ valid: boolean }>> {
    logger.info('Verifying token');

    return await this.post<{ valid: boolean }>('/auth/verify', { token });
  }

  async forgotPassword(email: string): Promise<IAPIResponse<{ message: string }>> {
    logger.info(`Requesting password reset for: ${email}`);

    return await this.post<{ message: string }>('/auth/forgot-password', {
      email,
    });
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<IAPIResponse<{ message: string }>> {
    logger.info('Resetting password');

    return await this.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    });
  }

  async changePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<IAPIResponse<{ message: string }>> {
    logger.info('Changing password');

    return await this.post<{ message: string }>('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  }
}
