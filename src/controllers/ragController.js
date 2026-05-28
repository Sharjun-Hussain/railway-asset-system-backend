import { queryRAG } from "../services/ragService.js";

export const handleRagQuery = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    // req.user should be populated by the authMiddleware
    const answer = await queryRAG(prompt, req.user);

    res.status(200).json({
      success: true,
      data: { answer }
    });
  } catch (error) {
    console.error("Error in handleRagQuery:", error);
    res.status(500).json({ success: false, message: "Failed to process RAG query" });
  }
};
