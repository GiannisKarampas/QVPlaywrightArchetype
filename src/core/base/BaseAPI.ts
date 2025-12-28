import { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '@config/environment.config';
import logger from '@core/helpers/logger';
import { RetryHelper } from '@core/helpers/retry.helper';
import { IAPIResponse, IAPIError, IAPIRequestConfig } from '../../types/api.types';

export abstract class BaseAPI {
  protected apiContext: APIRequestContext;
  protected baseURL: string;
  protected defaultHeaders: Record<string, string>;

  constructor(apiContext: APIRequestContext) {
    this.apiContext = apiContext;
    this.baseURL = env.get('apiBaseUrl');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  protected async get<T>(
    endpoint: string,
    config: IAPIRequestConfig = {},
  ): Promise<IAPIResponse<T>> {
    logger.info(`GET ${endpoint}`);

    const response = await this.executeRequest(async () => {
      return await this.apiContext.get(this.buildUrl(endpoint, config.baseURL), {
        headers: { ...this.defaultHeaders, ...config.headers },
        params: config.params,
        timeout: config.timeout || env.get('apiTimeout'),
      });
    }, config.retries);

    return this.handleResponse<T>(response);
  }

  protected async post<T>(
    endpoint: string,
    data?: unknown,
    config: IAPIRequestConfig = {},
  ): Promise<IAPIResponse<T>> {
    logger.info(`POST ${endpoint}`);

    const response = await this.executeRequest(async () => {
      return await this.apiContext.post(this.buildUrl(endpoint, config.baseURL), {
        headers: { ...this.defaultHeaders, ...config.headers },
        data,
        params: config.params,
        timeout: config.timeout || env.get('apiTimeout'),
      });
    }, config.retries);

    return this.handleResponse<T>(response);
  }

  protected async put<T>(
    endpoint: string,
    data?: unknown,
    config: IAPIRequestConfig = {},
  ): Promise<IAPIResponse<T>> {
    logger.info(`PUT ${endpoint}`);

    const response = await this.executeRequest(async () => {
      return await this.apiContext.put(this.buildUrl(endpoint, config.baseURL), {
        headers: { ...this.defaultHeaders, ...config.headers },
        data,
        params: config.params,
        timeout: config.timeout || env.get('apiTimeout'),
      });
    }, config.retries);

    return this.handleResponse<T>(response);
  }

  protected async patch<T>(
    endpoint: string,
    data?: unknown,
    config: IAPIRequestConfig = {},
  ): Promise<IAPIResponse<T>> {
    logger.info(`PATCH ${endpoint}`);

    const response = await this.executeRequest(async () => {
      return await this.apiContext.patch(this.buildUrl(endpoint, config.baseURL), {
        headers: { ...this.defaultHeaders, ...config.headers },
        data,
        params: config.params,
        timeout: config.timeout || env.get('apiTimeout'),
      });
    }, config.retries);

    return this.handleResponse<T>(response);
  }

  protected async delete<T>(
    endpoint: string,
    config: IAPIRequestConfig = {},
  ): Promise<IAPIResponse<T>> {
    logger.info(`DELETE ${endpoint}`);

    const response = await this.executeRequest(async () => {
      return await this.apiContext.delete(this.buildUrl(endpoint, config.baseURL), {
        headers: { ...this.defaultHeaders, ...config.headers },
        params: config.params,
        timeout: config.timeout || env.get('apiTimeout'),
      });
    }, config.retries);

    return this.handleResponse<T>(response);
  }

  public setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    logger.debug('Auth token set in default headers');
  }

  public removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
    logger.debug('Auth token removed from default headers');
  }

  public setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  public removeHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  private buildUrl(endpoint: string, baseURL?: string): string {
    const base = baseURL || this.baseURL;
    return endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`;
  }

  private async executeRequest(
    requestFn: () => Promise<APIResponse>,
    retries?: number,
  ): Promise<APIResponse> {
    if (retries !== undefined && retries > 0) {
      return await RetryHelper.retry(requestFn, {
        maxAttempts: retries,
        delay: env.get('apiRetryDelay'),
        backoff: 'exponential',
      });
    }

    return await requestFn();
  }

  private async handleResponse<T>(response: APIResponse): Promise<IAPIResponse<T>> {
    const status = response.status();
    const statusText = response.statusText();
    const headers = response.headers();

    logger.info(`Response Status: ${status} ${statusText}`);

    let data: T;
    const contentType = headers['content-type'] || '';

    try {
      if (contentType.includes('application/json')) {
        data = (await response.json()) as T;
      } else {
        data = (await response.text()) as unknown as T;
      }
    } catch (error) {
      logger.error('Failed to parse response body', error);
      throw new Error(`Failed to parse response: ${(error as Error).message}`);
    }

    if (status >= 400) {
      const apiError: IAPIError = {
        status,
        message: statusText,
        details: data,
      };
      logger.error(`API Error: ${status} - ${statusText}`, apiError);
      throw new Error(`API request failed: ${status} ${statusText}`);
    }

    return {
      status,
      statusText,
      data,
      headers,
    };
  }

  protected async expectStatus(
    response: IAPIResponse<unknown>,
    expectedStatus: number,
  ): Promise<void> {
    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, but got ${response.status}`);
    }
  }

  protected async expectStatusOk(response: IAPIResponse<unknown>): Promise<void> {
    await this.expectStatus(response, 200);
  }

  protected async expectStatusCreated(response: IAPIResponse<unknown>): Promise<void> {
    await this.expectStatus(response, 201);
  }

  protected async expectStatusNoContent(response: IAPIResponse<unknown>): Promise<void> {
    await this.expectStatus(response, 204);
  }
}
