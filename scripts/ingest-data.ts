import { loadEnvFile } from 'node:process';
loadEnvFile(process.cwd() + '/.env');

import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { PineconeService } from '@/src/utils/pinecone';
import { EmbeddingService } from '@/src/utils/openai';
import { config } from '@/src/utils';

class MarkdownProcessor {
  constructor(
    private embeddingService: EmbeddingService,
    private pineconeService: PineconeService,
    private config: AppConfig,
  ) {}

  private parseMarkdownSections(markdownSummaries: string[]): Array<{
    title: string;
    content: string;
    timestamp: string;
  }> {
    const sections: Array<{
      title: string;
      content: string;
      timestamp: string;
    }> = [];

    for (const videoSummary of markdownSummaries) {
      const parsedSections = videoSummary.split('## ').filter(Boolean);

      for (const section of parsedSections) {
        const [title, content] = section.split('\n', 2);
        const timestampMatch = title.match(/\((\d{2}:\d{2}:\d{2})\)/);
        const timestamp = timestampMatch
          ? timestampMatch[1]
          : '_start_time_not_provided_';

        sections.push({
          title: title.replace(/\[.*?\]/g, '').trim(),
          content: content || '',
          timestamp,
        });
      }
    }

    return sections;
  }

  async processMarkdownFile(filePath: string) {
    const rawData = fs.readFileSync(
      process.cwd() + '/scripts/' + filePath,
      'utf8',
    );
    const markdownSummaries = JSON.parse(rawData);

    const sections = this.parseMarkdownSections(markdownSummaries);

    const vectors = [];
    let i = 0;
    console.log('Sections: ', sections.length);
    for (const section of sections) {
      console.log(
        `Length of content: ${section.content.length}, index: ${i++}`,
      );
      const embedding = await this.embeddingService.generateEmbedding(
        section.content,
      );
      vectors.push({
        id: uuidv4(),
        values: embedding,
        metadata: {
          title: section.title,
          timestamp: section.timestamp,
          content: section.content,
        },
      });

      if (vectors.length >= this.config.batchSize) {
        await this.pineconeService.upsertVectors(vectors);
        console.log(`Upserted ${vectors.length} vectors.`);
        vectors.length = 0;
      }
    }

    if (vectors.length > 0) {
      await this.pineconeService.upsertVectors(vectors);
      console.log(`Upserted ${vectors.length} vectors.`);
    }
  }
}

const embeddingService = new EmbeddingService(config);
const pineconeService = new PineconeService(config);
const markdownProcessor = new MarkdownProcessor(
  embeddingService,
  pineconeService,
  config,
);

markdownProcessor
  .processMarkdownFile('./md.json')
  .then(() => console.log('Data ingestion complete!'))
  .catch((err) => console.error('Error during ingestion:', err));
