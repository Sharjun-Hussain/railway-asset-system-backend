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
        filterConditions.push({ divisionId: user.divisionId._id || user.divisionId });
      }
      if (user.stationId) {
        filterConditions.push({ stationId: user.stationId._id || user.stationId });
      }
      if (user.warehouseIds && user.warehouseIds.length > 0) {
        const wIds = user.warehouseIds.map(w => w._id || w);
        filterConditions.push({ warehouseId: { $in: wIds } });
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
      limit: 50
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

    const isDivisionManager = user.roles?.some(role => 
      role.name === 'Division Manager'
    );
    const isStationMaster = user.roles?.some(role => 
      role.name === 'Station Master'
    );

    let scopeDescription;
    let fallbackRule;

    const divName = user.divisionId?.division_name || "Unknown";
    const stnName = user.stationId?.station_name || "Unknown";
    const whNames = user.warehouseIds?.map(w => w.warehouse_name).join(", ") || "Unknown";

    if (isGlobalAdmin) {
      scopeDescription = "This user has Global Admin privileges and can access all stations and divisions globally.";
      fallbackRule = "3. If the user asks about a station, warehouse, division, or location, and that data is NOT in the context, explain that the data could not be found in the current system knowledge base.";
    } else if (isDivisionManager) {
      scopeDescription = `This user is the Division Manager for the **${divName}** division. They have full access to ALL stations and ALL warehouses within the ${divName} division.`;
      fallbackRule = `3. If the user asks about a station, warehouse, division, or location, and that data is NOT in the context, you MUST politely explain that based on their system permissions, they only have access to data within the ${divName} division, or the requested data might not exist.`;
    } else if (isStationMaster) {
      scopeDescription = `This user is the Station Master for the **${stnName}** station in the ${divName} division. They have full access to the ${stnName} station and ALL its warehouses.`;
      fallbackRule = `3. If the user asks about a station, warehouse, division, or location, and that data is NOT in the context, you MUST politely explain that based on their system permissions, they only have access to data for the ${stnName} station, or the requested data might not exist.`;
    } else {
      scopeDescription = `This user has RESTRICTED access. They belong to the ${divName} division and the ${stnName} station. They can ONLY see data for the following specific warehouses: ${whNames}.`;
      fallbackRule = `3. If the user asks about a station, warehouse, division, or location, and that data is NOT in the context, you MUST politely explain that based on their system permissions, they only have access to data for their assigned warehouses (${whNames}), and cannot view information belonging to other locations.`;
    }

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
${fallbackRule}
4. If the question is completely unrelated to the railway system or the context, politely decline to answer.
5. **DISTINGUISH BETWEEN ASSETS AND STOCK**: "Asset Catalog" records describe the *types* of items that exist globally (no quantity). "Warehouse Stock" records describe *actual physical inventory* at a specific location (with a quantity). 
6. **EMPTY STOCK**: If the user asks for stock, inventory, or counts at a location, and there are NO "Warehouse Stock" records in the context for that location, you MUST explicitly state that there is currently **no stock recorded** (it is empty) rather than incorrectly listing "Asset Catalog" definitions as if they were stock.
7. When listing records (transactions, assets, stock levels), format each record as a separate numbered item with a bold title header (e.g. "1. **RECEIVE — Single Relay**"), followed by its fields as indented bullet points underneath. Always add a blank line between each numbered record to visually separate them. Never mix fields from different records into a single flat list. Each record must be self-contained and clearly separated.

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
