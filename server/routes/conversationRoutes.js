import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const router = express.Router();

// GET /api/conversations - List user's conversations with last message preview
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "username firstName lastName profilePicture")
      .sort({ lastMessageAt: -1 })
      .lean();

    res.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
});

// POST /api/conversations/direct/:otherUserId - Get or create a DM thread
router.post("/direct/:otherUserId", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { otherUserId } = req.params;

    if (userId === otherUserId) {
      return res.status(400).json({ message: "Cannot create conversation with yourself" });
    }

    // Check if other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create unique directKey: smaller ID first
    const sortedIds = [userId, otherUserId].sort();
    const directKey = `${sortedIds[0]}:${sortedIds[1]}`;

    // Try to find existing conversation
    let conversation = await Conversation.findOne({ directKey }).populate(
      "participants",
      "username firstName lastName profilePicture"
    );

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [userId, otherUserId],
        directKey,
        memberStates: [
          { userId, lastReadAt: new Date() },
          { userId: otherUserId, lastReadAt: new Date() },
        ],
      });

      // Populate participants
      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        "username firstName lastName profilePicture"
      );
    }

    res.json({ conversation });
  } catch (error) {
    console.error("Error creating/fetching conversation:", error);
    res.status(500).json({ message: "Failed to create/fetch conversation" });
  }
});

// GET /api/conversations/:conversationId/messages - Fetch message history with pagination
router.get("/:conversationId/messages", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;
    const { cursor, limit = 50 } = req.query;

    // Verify user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const query = { conversationId };
    if (cursor) {
      // Pagination: fetch messages older than cursor
      query.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("senderId", "username firstName lastName profilePicture")
      .lean();

    // Return in chronological order (oldest first)
    const orderedMessages = messages.reverse();

    res.json({
      messages: orderedMessages,
      hasMore: messages.length === parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// POST /api/conversations/:conversationId/messages - Send a new message (REST fallback)
router.post("/:conversationId/messages", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    // Verify user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Create message
    const message = await Message.create({
      conversationId,
      senderId: userId,
      text: text.trim(),
    });

    // Update conversation last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text.trim().substring(0, 100),
      lastMessageAt: new Date(),
    });

    // Populate sender info
    const populatedMessage = await Message.findById(message._id).populate(
      "senderId",
      "username firstName lastName profilePicture"
    );

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// POST /api/conversations/:conversationId/read - Mark conversation as read
router.post("/:conversationId/read", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Update user's lastReadAt
    const memberState = conversation.memberStates.find(
      (ms) => ms.userId.toString() === userId
    );

    if (memberState) {
      memberState.lastReadAt = new Date();
    } else {
      conversation.memberStates.push({
        userId,
        lastReadAt: new Date(),
      });
    }

    await conversation.save();

    res.json({ message: "Conversation marked as read" });
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    res.status(500).json({ message: "Failed to mark conversation as read" });
  }
});

export default router;
