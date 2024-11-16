import {
  Index,
  Pinecone,
  QueryResponse,
  RecordMetadata,
} from '@pinecone-database/pinecone';

export class PineconeService {
  private pinecone: Pinecone;
  private index: Index<RecordMetadata>;
  static pinecone: PineconeService;

  constructor(private config: AppConfig) {
    this.pinecone = new Pinecone({ apiKey: config.pineconeApiKey });
    this.index = this.pinecone.Index(config.pineconeIndex);
  }

  async query(
    queryEmbedding: number[],
  ): Promise<QueryResponse<RecordMetadata>> {
    const response = await this.index.query({
      topK: 5,
      vector: queryEmbedding,
      includeMetadata: true,
    });
    return response;
  }

  async upsertVectors(
    vectors: Array<{
      id: string;
      values: number[];
      metadata: Record<string, any>;
    }>,
  ) {
    await this.index.upsert(vectors);
  }
}
