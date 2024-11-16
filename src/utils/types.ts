interface AppConfig {
  pineconeApiKey: string;
  pineconeIndex: string;
  openaiApiKey: string;
  openaiEmbeddingModelName: string;
  openaiModelName: string;
  batchSize: number;
}

type ChatHistory = { role: 'assistant' | 'user'; content: string }[];
