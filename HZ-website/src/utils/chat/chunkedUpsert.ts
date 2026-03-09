import type { Index, PineconeRecord } from "@pinecone-database/pinecone";

const sliceIntoChunks = <T>(arr: T[], chunkSize: number) => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, (i + 1) * chunkSize)
  );
};

export const chunkedUpsert = async (
  index: Index,
  vectors: PineconeRecord[],
  namespace: string,
  chunkSize: number
) => {
  console.log("In chunkedUpsert function");

  const chunks = sliceIntoChunks<PineconeRecord>(vectors, chunkSize);

  try {
    await Promise.allSettled(
      chunks.map(async (chunk) => {
        try {
          await index.namespace(namespace).upsert(chunk);
        } catch (e) {
          console.log("Error upserting chunk", e);
        }
      })
    );

    return true;
  } catch (e) {
    throw new Error(`Error upserting vectors into index: ${e}`);
  }
};
