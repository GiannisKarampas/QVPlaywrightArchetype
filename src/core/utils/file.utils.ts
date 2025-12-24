import * as fs from 'fs';
import * as path from 'path';
import logger from '@core/helpers/logger';

export class FileUtils {
  static async readFile(filePath: string): Promise<string> {
    try {
      logger.debug(`Reading file: ${filePath}`);
      const content = await fs.promises.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      logger.error(`Failed to read file: ${filePath}`, error);
      throw error;
    }
  }

  static async writeFile(filePath: string, content: string): Promise<void> {
    try {
      logger.debug(`Writing file: ${filePath}`);
      const dir = path.dirname(filePath);
      await this.ensureDirectoryExists(dir);
      await fs.promises.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      logger.error(`Failed to write file: ${filePath}`, error);
      throw error;
    }
  }

  static async readJSON<T>(filePath: string): Promise<T> {
    try {
      logger.debug(`Reading JSON file: ${filePath}`);
      const content = await this.readFile(filePath);
      return JSON.parse(content) as T;
    } catch (error) {
      logger.error(`Failed to read JSON file: ${filePath}`, error);
      throw error;
    }
  }

  static async writeJSON(filePath: string, data: unknown): Promise<void> {
    try {
      logger.debug(`Writing JSON file: ${filePath}`);
      const content = JSON.stringify(data, null, 2);
      await this.writeFile(filePath, content);
    } catch (error) {
      logger.error(`Failed to write JSON file: ${filePath}`, error);
      throw error;
    }
  }

  static async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.promises.access(dirPath);
    } catch {
      logger.debug(`Creating directory: ${dirPath}`);
      await fs.promises.mkdir(dirPath, { recursive: true });
    }
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      logger.debug(`Deleting file: ${filePath}`);
      await fs.promises.unlink(filePath);
    } catch (error) {
      logger.error(`Failed to delete file: ${filePath}`, error);
      throw error;
    }
  }

  static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static async copyFile(source: string, destination: string): Promise<void> {
    try {
      logger.debug(`Copying file from ${source} to ${destination}`);
      const dir = path.dirname(destination);
      await this.ensureDirectoryExists(dir);
      await fs.promises.copyFile(source, destination);
    } catch (error) {
      logger.error(`Failed to copy file from ${source} to ${destination}`, error);
      throw error;
    }
  }

  static getFileName(filePath: string): string {
    return path.basename(filePath);
  }

  static getFileExtension(filePath: string): string {
    return path.extname(filePath);
  }

  static getDirectoryName(filePath: string): string {
    return path.dirname(filePath);
  }

  static joinPaths(...paths: string[]): string {
    return path.join(...paths);
  }
}

export const readFile = FileUtils.readFile.bind(FileUtils);
export const writeFile = FileUtils.writeFile.bind(FileUtils);
export const readJSON = FileUtils.readJSON.bind(FileUtils);
export const writeJSON = FileUtils.writeJSON.bind(FileUtils);
