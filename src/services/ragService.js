import OpenAI from "openai";
import RAGknowledge from "../models/RAGknowledge.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const queryRAG = async (prompt, user) => {
  try {
    console.log("\n================ RAG FLOW STARTED ================");
    console.log("1. User Prompt:", prompt);
    console.log("2. Requesting Embeddings from OpenAI...");

    // 1. Generate Embedding for the user's prompt
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: prompt,
    });
    
    const queryVector = embeddingResponse.data[0].embedding;

    // 2. Build pre-filter based on user's SCOPE only (division/station/warehouse).
    // Roles are NOT used as filters because global assets have no allowedRoles set.
    // Only restrict by physical scope when the user is explicitly scoped to a location.
    const filterConditions = [];

    // Scope-based matching ONLY
    if (user.divisionId) {
        filterConditions.push({ divisionId: user.divisionId });
    }
    if (user.stationId) {
        filterConditions.push({ stationId: user.stationId });
    }
    if (user.warehouseIds && user.warehouseIds.length > 0) {
        filterConditions.push({ warehouseId: { $in: user.warehouseIds } });
    }

    // If the user has NO scope restrictions (e.g. Super Admin), run without any filter.
    // If user IS scoped (e.g. Warehouse Manager), apply the scope filter.
    let matchFilter = undefined;
    if (filterConditions.length > 0) {
        matchFilter = { $or: filterConditions };
    }

    console.log("3. Filter Conditions Built:", JSON.stringify(matchFilter || "NO FILTER (Admin/Global)"));

    const vectorSearchQuery = {
      index: "vector_index",
      path: "embedding",
      queryVector: queryVector,
      numCandidates: 100,
      limit: 5
    };

    if (matchFilter) {
      vectorSearchQuery.filter = matchFilter;
    }

    // 3. Query MongoDB Vector Search
    const searchResults = await RAGknowledge.aggregate([
      {
        $vectorSearch: vectorSearchQuery
      },
      {
        $project: {
          content: 1,
          source: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    // Format the retrieved context
    const context = searchResults.map(doc => `[Source: ${doc.source}]\n${doc.content}`).join("\n\n");
    console.log("4. Context Extracted from MongoDB:");
    console.log(context ? context : "NO RELEVANT CONTEXT FOUND.");

    console.log("5. Sending Prompt + Context to OpenAI GPT...");
    // 4. Send to OpenAI Chat
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an intelligent AI assistant for the Railway Administration Dashboard. Answer the user's question based ONLY on the provided context below. If the answer is not in the context, say you don't have enough information.\n\nContext:\n${context}`
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const finalAnswer = chatResponse.choices[0].message.content;
    
    console.log("6. OpenAI Final Response:");
    console.log(finalAnswer);
    console.log("================ RAG FLOW COMPLETED ================\n");

    return finalAnswer;

  } catch (error) {
    console.error("RAG Service Error:", error);
    throw error;
  }
};
