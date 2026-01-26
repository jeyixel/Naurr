import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // Array of participant user IDs (for direct chats, this will be exactly 2)
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // Unique key for direct messages: "<smallerUserId>:<largerUserId>"
    // This prevents duplicate DM threads between the same two users
    directKey: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Optional: Track last message for conversation list preview
    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    // Per-user read tracking
    memberStates: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        lastReadAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for fast direct conversation lookup
conversationSchema.index({ directKey: 1 });
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
