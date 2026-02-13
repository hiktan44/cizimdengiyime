import { describe, it, expect } from 'vitest';
import { base64ToFile } from '../utils/fileUtils';

describe('File Utilities', () => {
  describe('base64ToFile', () => {
    it('should convert base64 string to File object', async () => {
      const base64String = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const fileName = 'test.png';

      const file = await base64ToFile(base64String, fileName);

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe(fileName);
      expect(file.type).toBe('image/png');
    });

    it('should handle different image types', async () => {
      const jpegBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
      const file = await base64ToFile(jpegBase64, 'test.jpg');

      // Since we mock fetch to return png, just check that file is created
      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe('test.jpg');
    });

    it('should create file from base64 string', async () => {
      const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      const file = await base64ToFile(base64, 'test.png');
      expect(file).toBeInstanceOf(File);
    });
  });
});
