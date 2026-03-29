import { GoogleGenAI } from '@google/genai';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ExtractedService = {
  name: string;
  priceEUR: number;
  durationMin: number;
  description: string | null;
};

@Injectable()
export class AIService {
  private readonly genAI: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined');
    }

    this.genAI = new GoogleGenAI({ apiKey });
  }

  async extractServices(fileBuffer: Buffer, mimeType: string): Promise<ExtractedService[]> {
    const prompt = `
Extract barber or salon services from the attached image or PDF pricelist.

Rules:
- Return only actual bookable services.
- Ignore branding, headings, slogans, contact information, and decorative text.
- Extract service name and price.
- If possible, suggest durationMin. If you can't infer it, use 30.
- If possible, suggest a short simple description.
- If description cannot be inferred confidently, use null.
- If price is missing, use 0.
- Return ONLY valid JSON.
- The JSON must be an array of objects with this exact shape:
[
  {
    "name": "string",
    "priceEUR": 0,
    "durationMin": 30,
    "description": "string"
  }
]
`;

    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: fileBuffer.toString('base64'),
                },
              },
            ],
          },
        ],
      });

      const text = (response.text ?? '').trim();

      const cleanedText = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const jsonMatch = cleanedText.match(/\[\s*[\s\S]*\]/);

      if (!jsonMatch) {
        console.error('Gemini response did not contain expected JSON array:', text);
        throw new InternalServerErrorException('Failed to extract services from Gemini response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(parsed)) {
        throw new InternalServerErrorException('Gemini response was not a valid array');
      }

      return parsed
        .map((item: unknown) => {
          const service = item as Record<string, unknown>;

          return {
            name: typeof service.name === 'string' ? service.name.trim() : '',
            priceEUR:
              typeof service.priceEUR === 'number'
                ? service.priceEUR
                : Number(service.priceEUR ?? 0) || 0,
            durationMin:
              typeof service.durationMin === 'number'
                ? Math.max(1, service.durationMin)
                : Number(service.durationMin) || 30,
            description:
              typeof service.description === 'string' && service.description.trim().length > 0
                ? service.description.trim()
                : null,
          };
        })
        .filter((service) => service.name.length > 0);
    } catch (error) {
      console.error('Gemini error:', error);
      throw new InternalServerErrorException('Error processing file with AI');
    }
  }
}
