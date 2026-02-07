import logger from '@core/helpers/logger';
import { RequestInterceptor, ResponseInterceptor } from '../types/interceptor.types';

/**
 * Request logging interceptor
 * Logs all outgoing API requests
 */
export const loggingRequestInterceptor: RequestInterceptor = async (url, options) => {
  logger.info(`→ ${options.method} ${url}`, {
    headers: options.headers,
    params: options.params,
    hasBody: !!options.data,
  });
};

/**
 * Response logging interceptor
 * Logs all incoming API responses
 */
export const loggingResponseInterceptor: ResponseInterceptor = async (response, request) => {
  const status = response.status();

  logger.info(`← ${request.method} ${request.url} - ${status}`, {
    status,
    statusText: response.statusText(),
    contentType: response.headers()['content-type'],
  });

  return response;
};
