import { queryRAG } from "../services/ragService.js";
import RagChat from "../models/ragChat.js";

export const handleRagQuery = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }


    const answer = await queryRAG(prompt, req.user);

    // Store chat in the database
    const timestamp = new Date();
    await RagChat.findOneAndUpdate(
      { userId: req.user._id },
      {
        $push: {
          messages: {
            $each: [
              { role: "user", content: prompt, timestamp },
              { role: "assistant", content: answer, timestamp: new Date() }
            ]
          }
        }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      data: { answer }
    });
  } catch (error) {
    console.error("Error in handleRagQuery:", error);
    res.status(500).json({ success: false, message: "Failed to process RAG query" });
  }
};

export const getRagHistory = async (req, res) => {
  try {
    const chat = await RagChat.findOne({ userId: req.user._id });
    res.status(200).json({
      success: true,
      data: chat ? chat.messages : []
    });
  } catch (error) {
    console.error("Error fetching RAG history:", error);
    res.status(500).json({ success: false, message: "Failed to fetch chat history" });
  }
};
