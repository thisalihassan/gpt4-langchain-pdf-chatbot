import { CHROMA_COLLECTION } from '@/config/env';
import { chroma } from '@/utils/chroma-client';

export const run = async () => {
  try {
    await chroma.deleteCollection(CHROMA_COLLECTION || 'test')
  } catch (error) {
    console.error('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('Collection Deleted');
})();
