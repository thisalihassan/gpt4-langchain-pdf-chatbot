import { ChromaClient } from "chromadb";



async function initChroma() {
  try {
    const client = new ChromaClient(process.env.CHROMA_API);

    return client;
  } catch (error) {
    console.error('error', error);
    throw new Error('Failed to initialize chroma Client');
  }
}

export const chroma = await initChroma();
