import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Chroma } from 'langchain/vectorstores/chroma';
import { chroma } from '@/utils/chroma-client';
import { CustomPDFLoader } from '@/utils/customPDFLoader';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { OpenAIEmbeddingFunction } from 'chromadb';
import { CHROMA_COLLECTION, OPENAI_API_KEY } from '@/config/env';
import { OPENAI_MODEL_NAME } from '@/config/env';

/* Name of directory to retrieve your files from */
const filePath = 'docs';

export const run = async () => {
  try {
    /*load raw docs from the all files in the directory */
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (path) => new CustomPDFLoader(path),
    });

    // const loader = new PDFLoader(filePath);
    const rawDocs = await directoryLoader.load();

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs');

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const embeddingss = new OpenAIEmbeddingFunction(OPENAI_API_KEY, OPENAI_MODEL_NAME);
    const collection = await chroma.getOrCreateCollection(CHROMA_COLLECTION,{}, embeddingss);

    //embed the PDF documents
    await Chroma.fromDocuments(docs, embeddings, {
      collectionName: collection.name,
    });
  } catch (error) {
    console.error('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion complete');
})();
