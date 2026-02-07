import { z, ZodSchema, ZodObject, ZodRawShape } from 'zod';
import logger from '@core/helpers/logger';
import { IAPIResponse } from '../../types/api.types';

/**
 * Schema Validation Utilities
 *
 * Provides helpers for validating API responses against Zod schemas
 */

export class SchemaValidator {
  /**
   * Validate data against a Zod schema
   * @throws Error if validation fails
   */
  static validate<T>(schema: ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('Schema validation failed', {
          errors: error.errors,
          data,
        });

        const errorMessages = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');

        throw new Error(`Schema validation failed: ${errorMessages}`);
      }
      throw error;
    }
  }

  /**
   * Validate data against a Zod schema and return result
   * @returns { success: true, data } or { success: false, error }
   */
  static validateSafe<T>(
    schema: ZodSchema<T>,
    data: unknown,
  ): { success: true; data: T } | { success: false; error: z.ZodError } {
    const result = schema.safeParse(data);

    if (!result.success) {
      logger.warn('Schema validation failed (safe mode)', {
        errors: result.error.errors,
      });
    }

    return result;
  }

  /**
   * Validate API response data
   */
  static validateAPIResponse<T>(schema: ZodSchema<T>, response: IAPIResponse<unknown>): T {
    logger.debug('Validating API response against schema');

    try {
      const validatedData = this.validate(schema, response.data);
      logger.debug('API response validation successful');
      return validatedData;
    } catch (error) {
      logger.error('API response validation failed', {
        status: response.status,
        statusText: response.statusText,
      });
      throw error;
    }
  }

  /**
   * Validate partial object (useful for PATCH requests)
   * @param schema - Zod object schema to validate against
   * @param data - Data to validate
   * @returns Validated partial data
   */
  static validatePartial<T extends ZodRawShape>(
    schema: ZodObject<T>,
    data: unknown,
  ): Partial<z.infer<ZodObject<T>>> {
    const partialSchema = schema.partial();
    return this.validate(partialSchema, data);
  }

  /**
   * Validate array of items
   */
  static validateArray<T>(itemSchema: ZodSchema<T>, data: unknown): T[] {
    const arraySchema = z.array(itemSchema);
    return this.validate(arraySchema, data);
  }

  /**
   * Custom error messages helper
   */
  static formatValidationErrors(error: z.ZodError): string[] {
    return error.errors.map((err) => {
      const path = err.path.join('.') || 'root';
      return `${path}: ${err.message}`;
    });
  }

  /**
   * Check if data matches schema without throwing
   */
  static matches<T>(schema: ZodSchema<T>, data: unknown): boolean {
    return schema.safeParse(data).success;
  }

  /**
   * Get detailed validation report
   */
  static getValidationReport<T>(
    schema: ZodSchema<T>,
    data: unknown,
  ): {
    valid: boolean;
    errors?: string[];
    data?: T;
  } {
    const result = schema.safeParse(data);

    if (result.success) {
      return {
        valid: true,
        data: result.data,
      };
    }

    return {
      valid: false,
      errors: this.formatValidationErrors(result.error),
    };
  }
}

// Convenience exports
export const validate = SchemaValidator.validate.bind(SchemaValidator);
export const validateSafe = SchemaValidator.validateSafe.bind(SchemaValidator);
export const validateAPIResponse = SchemaValidator.validateAPIResponse.bind(SchemaValidator);
export const validatePartial = SchemaValidator.validatePartial.bind(SchemaValidator);
export const validateArray = SchemaValidator.validateArray.bind(SchemaValidator);
