if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY in .env file');
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '';

const OPENAI_MODEL_NAME = process.env.OPENAI_MODEL_NAME ?? 'text-davinci-003';
const CHROMA_API = process.env.CHROMA_API ?? 'http://localhost:8000';
const CHROMA_COLLECTION = process.env.CHROMA_COLLECTION ?? '';

export { OPENAI_API_KEY, OPENAI_MODEL_NAME, CHROMA_API, CHROMA_COLLECTION };
