import { FakerUtils } from '@core/utils/faker.utils';
import { CryptoUtils } from '@core/utils/crypto.utils';

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  createdAt: string;
}

export class ProductFactory {
  static create(overrides?: Partial<IProduct>): IProduct {
    return {
      id: CryptoUtils.generateUUID(),
      name: `Product ${FakerUtils.generateText(1)}`,
      description: FakerUtils.generateParagraph(),
      price: FakerUtils.generateNumber(10, 1000),
      category: FakerUtils.pickRandom(['Electronics', 'Clothing', 'Food', 'Books', 'Toys']),
      inStock: FakerUtils.generateBoolean(),
      createdAt: FakerUtils.generateDate({ past: true }).toISOString(),
      ...overrides,
    };
  }

  static createMultiple(count: number, overrides?: Partial<IProduct>): IProduct[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createInStock(overrides?: Partial<IProduct>): IProduct {
    return this.create({
      inStock: true,
      ...overrides,
    });
  }

  static createOutOfStock(overrides?: Partial<IProduct>): IProduct {
    return this.create({
      inStock: false,
      ...overrides,
    });
  }

  static createByCategory(category: string, count: number = 1): IProduct[] {
    return this.createMultiple(count, { category });
  }
}
