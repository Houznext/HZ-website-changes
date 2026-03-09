import { embed } from "ai";
import { google } from "@ai-sdk/google";

const embeddingModel = google.textEmbeddingModel("text-embedding-004", {
  outputDimensionality: 512,
});

export async function getEmbeddings(input: string) {
  try {
    const { embedding } = await embed({
      model: embeddingModel,
      value: input.replace(/\n/g, " "),
    });

    return embedding as number[];
  } catch (e) {
    console.log("Error calling Google embedding API: ", e);
    throw new Error(`Error calling Google embedding API: ${e}`);
  }
}
