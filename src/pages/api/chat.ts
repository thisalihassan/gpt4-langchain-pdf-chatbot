import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Chroma } from 'langchain/vectorstores/chroma';
import { makeChain } from '@/utils/makechain';
import { chroma } from '@/utils/chroma-client';
import { OpenAIEmbeddingFunction } from 'chromadb';
import { CHROMA_COLLECTION, OPENAI_API_KEY, OPENAI_MODEL_NAME } from '@/config/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {
    const embeddings = new OpenAIEmbeddingFunction(OPENAI_API_KEY, OPENAI_MODEL_NAME);
    const collection = await chroma.getCollection(CHROMA_COLLECTION, embeddings);

    /* create vectorstore*/
    const vectorStore = await Chroma.fromExistingCollection(
      new OpenAIEmbeddings({}),
      {
        collectionName: collection.name
      },
    );
    //create chain
    const chain = makeChain(vectorStore);
    //Ask a question using chat history
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    });

    res.status(200).json(response);
  } catch (error: any) {
    console.error('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
