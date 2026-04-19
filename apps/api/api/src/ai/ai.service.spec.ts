import { GoogleGenAI } from '@google/genai';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { AIService } from './ai.service';

jest.mock('@google/genai');

describe('AIService', () => {
  let service: AIService;
  let configService: ConfigService;

  const mockApiKey = 'test-api-key';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(mockApiKey),
          },
        },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error if GEMINI_API_KEY is not defined outside test environment', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    (configService.get as jest.Mock).mockReturnValue(null);

    expect(() => new AIService(configService)).toThrow('GEMINI_API_KEY is not defined');

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should not throw if GEMINI_API_KEY is missing in test environment', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    (configService.get as jest.Mock).mockReturnValue(null);

    expect(() => new AIService(configService)).not.toThrow();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should throw InternalServerErrorException when extractServices is called without configured AI', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    (configService.get as jest.Mock).mockReturnValue(null);

    service = new AIService(configService);

    await expect(service.extractServices(Buffer.from('test'), 'image/jpeg')).rejects.toThrow(
      InternalServerErrorException,
    );

    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('extractServices', () => {
    const mockFileBuffer = Buffer.from('test');
    const mockMimeType = 'image/jpeg';

    it('should successfully extract services from valid AI response', async () => {
      const mockServices = [
        {
          name: 'Classic Haircut',
          priceEUR: 25,
          durationMin: 30,
          description: 'A traditional cut',
        },
      ];

      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: JSON.stringify(mockServices),
      });

      (GoogleGenAI as jest.Mock).mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      // Re-initialize service to apply new mock implementation
      service = new AIService(configService);

      const result = await service.extractServices(mockFileBuffer, mockMimeType);

      expect(result).toEqual(mockServices);
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should handle AI response with markdown formatting', async () => {
      const mockServices = [
        { name: 'Beard Trim', priceEUR: 15, durationMin: 20, description: null },
      ];
      const mockText = `
\`\`\`json
${JSON.stringify(mockServices)}
\`\`\`
`;

      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: mockText,
      });

      (GoogleGenAI as jest.Mock).mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      service = new AIService(configService);

      const result = await service.extractServices(mockFileBuffer, mockMimeType);

      expect(result).toEqual(mockServices);
    });

    it('should throw InternalServerErrorException if AI response is not valid JSON', async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: 'Invalid Response',
      });

      (GoogleGenAI as jest.Mock).mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      service = new AIService(configService);

      await expect(service.extractServices(mockFileBuffer, mockMimeType)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException if AI response is not an array', async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: '{"name": "Not an array"}',
      });

      (GoogleGenAI as jest.Mock).mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      service = new AIService(configService);

      await expect(service.extractServices(mockFileBuffer, mockMimeType)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should sanitize and filter results', async () => {
      const rawData = [
        { name: ' Valid ', priceEUR: '20', durationMin: -5, description: '' },
        { name: '', priceEUR: 10 }, // Should be filtered out
      ];

      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: JSON.stringify(rawData),
      });

      (GoogleGenAI as jest.Mock).mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      service = new AIService(configService);

      const result = await service.extractServices(mockFileBuffer, mockMimeType);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Valid',
        priceEUR: 20,
        durationMin: 1, // Math.max(1, -5)
        description: null, // empty string becomes null
      });
    });

    it('should throw InternalServerErrorException on GoogleGenAI error', async () => {
      const mockGenerateContent = jest.fn().mockRejectedValue(new Error('API Error'));

      (GoogleGenAI as jest.Mock).mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      service = new AIService(configService);

      await expect(service.extractServices(mockFileBuffer, mockMimeType)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
