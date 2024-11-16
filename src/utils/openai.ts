import OpenAI from 'openai';

interface IEmbeddingService {
  generateEmbedding(input: string): Promise<number[]>;
  completion(history: ChatHistory): Promise<string>;
}

export class EmbeddingService implements IEmbeddingService {
  private openai: OpenAI;

  constructor(private config: AppConfig) {
    this.openai = new OpenAI({ apiKey: config.openaiApiKey });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: this.config.openaiEmbeddingModelName,
      input: text,
    });
    return response.data[0].embedding;
  }

  async completion(history: ChatHistory): Promise<string> {
    const newHistory = [
      {
        role: 'system',
        content: `You are a helpful and polite assistant. I will provide you a user question and then a context for your help from which you will have to answer. If the user question is not related to the provided context then just ignore it and response accordingly to the user question. If the context is relevant then extract the answer from it and answer to the user briefly. If the answer to the user question is not present in the current context you can use previous contexts to answer the question as well only if it is related.`,
      },
      ...history,
    ];
    console.log(newHistory);
    const response = await this.openai.chat.completions.create({
      messages: [...newHistory],
      model: process.env.OPENAI_MODEL_NAME!,
      max_tokens: 500,
    });

    return response.choices[0].message.content || 'No answer generated.';
  }
}
