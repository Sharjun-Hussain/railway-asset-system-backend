import mongoose from "mongoose";
import OpenAI from "openai";
import dotenv from "dotenv";
import RAGknowledge from "../models/RAGknowledge.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const testRAG = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Let's see what is in the DB
    const totalDocs = await RAGknowledge.countDocuments();
    console.log(`Total RAG Documents: ${totalDocs}`);

    // Generate test embedding
    console.log("Generating test embedding...");
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: "What assets do we have?",
    });
    
    // Perform vector search
    console.log("Performing Vector Search...");
    const searchResults = await RAGknowledge.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: embeddingResponse.data[0].embedding,
          numCandidates: 10,
          limit: 3
        }
      },
      {
        $project: {
          content: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    console.log("Search Results (if successful, Vector Index is working!):");
    console.log(JSON.stringify(searchResults, null, 2));

  } catch (error) {
    console.error("Test failed. This usually means the Vector Index is still building or misconfigured:");
    console.error(error.message);
  } finally {
    process.exit(0);
  }
};

testRAG();
