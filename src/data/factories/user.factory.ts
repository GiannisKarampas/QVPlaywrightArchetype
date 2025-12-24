import { FakerUtils } from '@core/utils/faker.utils';
import { IUser, ICreateUserRequest } from '@types/api.types';
import { CryptoUtils } from '@core/utils/crypto.utils';

export class UserFactory {
  static create(overrides?: Partial<IUser>): IUser {
    const baseUser = FakerUtils.generateUser();

    return {
      ...baseUser,
      ...overrides,
    };
  }

  static createRequest(overrides?: Partial<ICreateUserRequest>): ICreateUserRequest {
    return {
      email: FakerUtils.generateEmail(),
      password: FakerUtils.generatePassword(),
      firstName: FakerUtils.generateFirstName(),
      lastName: FakerUtils.generateLastName(),
      role: 'user',
      ...overrides,
    };
  }

  static createMultiple(count: number, overrides?: Partial<IUser>): IUser[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createAdmin(overrides?: Partial<IUser>): IUser {
    return this.create({
      role: 'admin',
      ...overrides,
    });
  }

  static createWithValidEmail(domain: string = 'example.com'): IUser {
    return this.create({
      email: `test-${CryptoUtils.generateRandomString(8)}@${domain}`,
    });
  }

  static createUniqueUsers(count: number): IUser[] {
    return Array.from({ length: count }, () =>
      this.create({
        email: `unique-${CryptoUtils.generateUUID()}@example.com`,
      }),
    );
  }
}
