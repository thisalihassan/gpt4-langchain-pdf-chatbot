export const config: AppConfig = {
  pineconeApiKey: process.env.PINECONE_API_KEY!,
  pineconeIndex: process.env.PINECONE_INDEX!,
  openaiApiKey: process.env.OPENAI_API_KEY!,
  openaiModelName: process.env.OPENAI_MODEL_NAME!,
  openaiEmbeddingModelName: process.env.OPENAI_EMBEDDING_MODEL_NAME!,
  batchSize: 50,
};
