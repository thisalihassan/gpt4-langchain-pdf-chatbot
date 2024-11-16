import type { NextApiRequest, NextApiResponse } from 'next';
import { PineconeService } from '@/src/utils/pinecone';
import { config as appConfig } from '@/src/utils';
import { EmbeddingService } from '@/src/utils/openai';

type RequestBody = {
  question: string;
  history: ChatHistory;
};

const pineconeService = new PineconeService(appConfig);
const openaiService = new EmbeddingService(appConfig);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const { question, history = [] }: RequestBody = await req.body;

    const queryEmbedding = await openaiService.generateEmbedding(question);
    const searchResponse = await pineconeService.query(queryEmbedding);

    const contexts =
      searchResponse.matches
        ?.map((match) => match.metadata!.content)
        .filter((content) => content && content!.trim() !== '') || [];

    if (contexts.length === 0) {
      res.write('No relevant data found.');
      res.end();
      return;
    }

    const prompt = `
User Question: ${question}
Provided context: ${contexts.join('\n---\n')}`;

    history.push({
      role: 'user',
      content: prompt,
    });

    const responseStream = await openaiService.completion(history);
    res.write(`data: ${JSON.stringify({ prompt })}\n\n`);
    for await (const chunk of responseStream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error processing QnA:', error);
    res.write(`data: { "error": "Failed to process the query." }\n\n`);
    res.end();
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 60,
};
