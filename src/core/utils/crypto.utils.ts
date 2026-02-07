import * as crypto from 'crypto';

export class CryptoUtils {
  static generateRandomString(length: number = 16): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static generateUUID(): string {
    return crypto.randomUUID();
  }

  static hash(data: string, algorithm: string = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  static md5(data: string): string {
    return this.hash(data, 'md5');
  }

  static sha256(data: string): string {
    return this.hash(data, 'sha256');
  }

  static sha512(data: string): string {
    return this.hash(data, 'sha512');
  }

  static encodeBase64(data: string): string {
    return Buffer.from(data).toString('base64');
  }

  static decodeBase64(encodedData: string): string {
    return Buffer.from(encodedData, 'base64').toString('utf-8');
  }

  static generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static generateRandomEmail(): string {
    const randomString = this.generateRandomString(8);
    return `test-${randomString}@example.com`;
  }

  static generateRandomPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    const values = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      password += charset[values[i] % charset.length];
    }

    return password;
  }

  /**
   * Encrypts text using AES-256-CBC with a random salt and IV
   * @param text - Text to encrypt
   * @param secretKey - Secret key for encryption
   * @returns Encrypted text in format: salt:iv:ciphertext
   */
  static encrypt(text: string, secretKey: string): string {
    const algorithm = 'aes-256-cbc';
    // Generate random salt for each encryption
    const salt = crypto.randomBytes(16);
    const key = crypto.scryptSync(secretKey, salt, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return salt:iv:ciphertext format
    return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypts text encrypted with the encrypt method
   * @param encryptedText - Encrypted text in format: salt:iv:ciphertext
   * @param secretKey - Secret key used for encryption
   * @returns Decrypted text
   */
  static decrypt(encryptedText: string, secretKey: string): string {
    const algorithm = 'aes-256-cbc';
    // Extract salt, IV, and ciphertext
    const [saltHex, ivHex, encrypted] = encryptedText.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const key = crypto.scryptSync(secretKey, salt, 32);
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

export const generateUUID = CryptoUtils.generateUUID.bind(CryptoUtils);
export const generateRandomString = CryptoUtils.generateRandomString.bind(CryptoUtils);
export const hash = CryptoUtils.hash.bind(CryptoUtils);
