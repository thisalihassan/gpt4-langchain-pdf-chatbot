import type { NextApiRequest, NextApiResponse } from 'next';
import { PineconeService } from '@/src/utils/pinecone';
import { config as appConfig } from '@/src/utils';
import { EmbeddingService } from '@/src/utils/openai';

type ResponseData = {
  message?: string;
  answer?: string;
  question?: string;
};

type RequestBody = {
  question: string;
  history: ChatHistory;
};

const pineconeService = new PineconeService(appConfig);
const openaiService = new EmbeddingService(appConfig);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method != 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
  }
  const { question, history = [] }: RequestBody = await req.body;
  if (!question) {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    const queryEmbedding = await openaiService.generateEmbedding(question);
    const searchResponse = await pineconeService.query(queryEmbedding);

    const contexts =
      searchResponse.matches?.map((match) => match.metadata.content) || [];

    if (contexts.length === 0) {
      return res.json({ message: 'No relevant data found.' });
    }
    const prompt = `
User Question: ${question}
Provided context: ${contexts.join('\n---\n')}`;

    history.push({
      role: 'user',
      content: prompt,
    });

    const answer = await openaiService.completion(history);
    res.status(200).json({ answer, question: prompt });
  } catch (error) {
    console.error('Error processing QnA:', error);
    return res.json({ message: 'Failed to process the query.' });
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
