import mongoose from "mongoose";

const ragChatSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    unique: true 
  },
  messages: [
    {
      role: { 
        type: String, 
        enum: ["user", "assistant", "system"], 
        required: true 
      },
      content: { 
        type: String, 
        required: true 
      },
      timestamp: { 
        type: Date, 
        default: Date.now 
      }
    }
  ]
});

export default mongoose.model("RagChat", ragChatSchema);
