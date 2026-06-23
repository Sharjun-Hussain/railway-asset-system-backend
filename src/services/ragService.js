import OpenAI from "openai";
import RAGknowledge from "../models/RAGknowledge.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const queryRAG = async (prompt, user) => {
  try {
    console.log("User Prompt:", prompt);

    // console.log("Prompt:", prompt);

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: prompt,
    });

    const queryVector = embeddingResponse.data[0].embedding;

    const filterConditions = [];

    // Bypass strict scoping for high-level administrative roles
    const isGlobalAdmin = user.roles?.some(role => 
      role.name === 'Super Admin' || role.name === 'Auditor'
    );

    if (!isGlobalAdmin) {
      if (user.divisionId) {
        filterConditions.push({ divisionId: user.divisionId });
      }
      if (user.stationId) {
        filterConditions.push({ stationId: user.stationId });
      }
      if (user.warehouseIds && user.warehouseIds.length > 0) {
        filterConditions.push({ warehouseId: { $in: user.warehouseIds } });
      }
    }

    let matchFilter = undefined;
    if (filterConditions.length > 0) {
      matchFilter = { 
        $or: [
          ...filterConditions,
          {
            divisionId: { $exists: false },
            stationId: { $exists: false },
            warehouseId: { $exists: false }
          }
        ] 
      };
    }



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

    const context = searchResults.map(doc => `[Source: ${doc.source}]\n${doc.content}`).join("\n\n");

    // console.log("Context:", context);

    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const scopeDescription = isGlobalAdmin 
      ? "This user has Global Admin privileges and can access all stations and divisions."
      : "This user has RESTRICTED access. They can ONLY see data for their specifically assigned station and warehouses.";

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an intelligent AI assistant for the Railway Administration Dashboard. Today's date is ${currentDate}. 

${scopeDescription}

IMPORTANT RULES:
1. Answer the user's question based ONLY on the provided context below.
2. The context provided to you has already been strictly filtered by the system based on the user's Role-Based Access Control (RBAC) permissions.
3. If the user asks about a station, warehouse, division, or location, and that data is NOT in the context, you MUST politely explain that based on their system permissions, they only have access to their assigned station/warehouse data, and cannot view information belonging to other stations.
4. If the question is completely unrelated to the railway system or the context, politely decline to answer.
5. When listing records (transactions, assets, stock levels), format each record as a separate numbered item with a bold title header (e.g. "1. **RECEIVE — Single Relay**"), followed by its fields as indented bullet points underneath. Always add a blank line between each numbered record to visually separate them. Never mix fields from different records into a single flat list. Each record must be self-contained and clearly separated.

Context:
${context}`
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const finalAnswer = chatResponse.choices[0].message.content;
    return finalAnswer;

  } catch (error) {
    console.error("RAG Service Error:", error);
    throw error;
  }
};
