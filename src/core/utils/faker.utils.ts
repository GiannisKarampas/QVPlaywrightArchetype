import { faker } from '@faker-js/faker';
import { IUser, ICreateUserRequest } from '../../types/api.types';
import { CryptoUtils } from '@core/utils/crypto.utils';
import logger from '@core/helpers/logger';

export class FakerUtils {
  static generateUser(): IUser {
    return {
      id: CryptoUtils.generateUUID(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: faker.helpers.arrayElement(['user', 'admin', 'moderator']),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    };
  }

  static generateCreateUserRequest(): ICreateUserRequest {
    return {
      email: faker.internet.email(),
      password: CryptoUtils.generateRandomPassword(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: 'user',
    };
  }

  static generateEmail(): string {
    return faker.internet.email();
  }

  static generatePassword(): string {
    return CryptoUtils.generateRandomPassword();
  }

  static generateFullName(): string {
    return faker.person.fullName();
  }

  static generateFirstName(): string {
    return faker.person.firstName();
  }

  static generateLastName(): string {
    return faker.person.lastName();
  }

  static generatePhoneNumber(): string {
    return faker.phone.number();
  }

  static generateAddress(): string {
    return faker.location.streetAddress();
  }

  static generateCity(): string {
    return faker.location.city();
  }

  static generateCountry(): string {
    return faker.location.country();
  }

  static generateZipCode(): string {
    return faker.location.zipCode();
  }

  static generateCompanyName(): string {
    return faker.company.name();
  }

  static generateJobTitle(): string {
    return faker.person.jobTitle();
  }

  static generateUrl(): string {
    return faker.internet.url();
  }

  static generateText(sentences: number = 3): string {
    return faker.lorem.sentences(sentences);
  }

  static generateParagraph(): string {
    return faker.lorem.paragraph();
  }

  static generateNumber(min: number = 0, max: number = 100): number {
    return faker.number.int({ min, max });
  }

  static generateBoolean(): boolean {
    return faker.datatype.boolean();
  }

  static generateDate(options?: { past?: boolean; future?: boolean }): Date {
    if (options?.past) {
      return faker.date.past();
    }
    if (options?.future) {
      return faker.date.future();
    }
    return faker.date.recent();
  }

  static pickRandom<T>(array: T[]): T {
    return faker.helpers.arrayElement(array);
  }

  static pickRandomMultiple<T>(array: T[], count: number): T[] {
    return faker.helpers.arrayElements(array, count);
  }

  static shuffle<T>(array: T[]): T[] {
    return faker.helpers.shuffle(array);
  }

  static setLocale(_locale: string): void {
    // Note: faker.locale is deprecated in newer versions
    // Use faker.setDefaultRefDate() or locale-specific imports if needed
    logger.warn('setLocale is deprecated - use locale-specific faker imports');
  }

  static setSeed(seed: number): void {
    faker.seed(seed);
  }
}

export const generateUser = FakerUtils.generateUser.bind(FakerUtils);
export const generateEmail = FakerUtils.generateEmail.bind(FakerUtils);
export const generatePassword = FakerUtils.generatePassword.bind(FakerUtils);
