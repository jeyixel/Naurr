import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export function setupSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.jwt;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
          return next(new Error("Authentication error: Invalid token"));
        }

        socket.userId = payload.id;
        next();
      });
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room for direct notifications
    socket.join(`user:${socket.userId}`);

    // Join a conversation room
    socket.on("conversation:join", async (conversationId) => {
      try {
        // Verify user is a participant
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.userId,
        });

        if (!conversation) {
          socket.emit("error", { message: "Conversation not found" });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
      } catch (error) {
        console.error("Error joining conversation:", error);
        socket.emit("error", { message: "Failed to join conversation" });
      }
    });

    // Leave a conversation room
    socket.on("conversation:leave", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Send a message
    socket.on("message:send", async (data) => {
      try {
        const { conversationId, text, tempId } = data;
        console.log(`📩 Received message:send from user ${socket.userId}`, { conversationId, text, tempId });

        if (!text || !text.trim()) {
          console.log(`❌ Empty text received`);
          socket.emit("message:error", { tempId, error: "Message text is required" });
          return;
        }

        // Verify user is a participant
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.userId,
        });

        if (!conversation) {
          console.log(`❌ Conversation not found: ${conversationId}`);
          socket.emit("message:error", { tempId, error: "Conversation not found" });
          return;
        }

        console.log(`✅ Conversation found, creating message...`);

        // Create message
        const message = await Message.create({
          conversationId,
          senderId: socket.userId,
          text: text.trim(),
        });

        console.log(`✅ Message created in DB:`, message._id);

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

        console.log(`✅ Populated message:`, populatedMessage);

        // Emit to all participants in the conversation room
        io.to(`conversation:${conversationId}`).emit("message:new", {
          message: populatedMessage,
          tempId,
        });

        console.log(`✅ Message emitted to conversation:${conversationId}`);
      } catch (error) {
        console.error("❌ Error sending message:", error);
        socket.emit("message:error", {
          tempId: data.tempId,
          error: "Failed to send message",
        });
      }
    });

    // Typing indicator
    socket.on("typing:start", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:start", {
        userId: socket.userId,
        conversationId,
      });
    });

    socket.on("typing:stop", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:stop", {
        userId: socket.userId,
        conversationId,
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
}
