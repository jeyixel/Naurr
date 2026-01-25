# Debugging Guide - Message Storage Issue

## Fixed Issue ✅
**Socket.IO was connecting to wrong port (5173 instead of 5000)**
- Fixed in `client/src/components/SocketProvider.tsx`

## How to Debug Further

### 1. Check Server Console
When you send a message, you should see:
```
📩 Received message:send from user <userId> { conversationId, text, tempId }
✅ Conversation found, creating message...
✅ Message created in DB: <messageId>
✅ Populated message: <message object>
✅ Message emitted to conversation:<conversationId>
```

### 2. Check Browser Console
When you send a message, you should see:
```
📤 Sending message to conversation <conversationId> { text, tempId }
📨 Received message:new <data>
```

When you open a chat, you should see:
```
🔌 Joining conversation: <conversationId>
```

When Socket connects:
```
✅ Socket connected: <socketId>
```

### 3. Verify MongoDB
After sending messages, check MongoDB:

```bash
# Connect to MongoDB
mongosh

# Switch to your database
use <your_database_name>

# Check messages
db.messages.find().pretty()

# Check conversations
db.conversations.find().pretty()
```

### 4. Common Issues & Solutions

#### Messages not saving to DB:
- ✅ Check server console for error messages
- ✅ Verify MongoDB connection (should see "DB Connected" on server start)
- ✅ Check if conversation exists (look for "Conversation not found" error)

#### Messages not showing in real-time:
- ✅ Check if Socket is connected (browser console)
- ✅ Verify you joined the conversation room
- ✅ Check server console for "Message emitted to conversation" log

#### Authentication errors:
- ✅ Check if JWT cookie is being sent (Network tab > WS connection > Headers)
- ✅ Verify JWT_SECRET is same in .env
- ✅ Look for "Authentication error" in server console

### 5. Testing Flow

1. **Open two browsers** (or one normal + one incognito)
2. **Create two accounts**
3. **Add each other as friends** using friend codes
4. **In Browser 1**: Select friend and open chat
5. **In Browser 2**: Select friend and open chat
6. **Send message from Browser 1**
7. **Check**:
   - Message appears immediately in Browser 1 (optimistic UI)
   - Message appears in Browser 2 (realtime)
   - Server console shows message saved
   - MongoDB contains the message

### 6. Expected Console Output

**Server:**
```
DB Connected
Server running on 5000
User connected: <userId1>
User <userId1> joined conversation <conversationId>
User connected: <userId2>
User <userId2> joined conversation <conversationId>
📩 Received message:send from user <userId1> ...
✅ Message created in DB: <messageId>
✅ Message emitted to conversation:<conversationId>
```

**Browser 1:**
```
✅ Socket connected: <socketId>
🔌 Joining conversation: <conversationId>
📤 Sending message to conversation <conversationId> ...
📨 Received message:new ...
```

**Browser 2:**
```
✅ Socket connected: <socketId>
🔌 Joining conversation: <conversationId>
📨 Received message:new ...
```

---

If messages still aren't saving, share the console output and I'll help debug further!
