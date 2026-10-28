require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "";
const MAX_MESSAGE_LENGTH = 1000;
const MAX_USERNAME_LENGTH = 30;
const MAX_HISTORY = 100;

app.use(express.static(path.join(__dirname, "..", "client")));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "not connected",
    persistence: Boolean(MONGODB_URI)
  });
});

const messageSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true, maxlength: MAX_USERNAME_LENGTH },
  text: { type: String, required: true, trim: true, maxlength: MAX_MESSAGE_LENGTH },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

const Message = mongoose.model("Message", messageSchema);
const memoryMessages = [];

async function getHistory() {
  if (mongoose.connection.readyState === 1) {
    const rows = await Message.find()
      .sort({ createdAt: -1 })
      .limit(MAX_HISTORY)
      .lean();

    return rows.reverse().map(row => ({
      username: row.username,
      text: row.text,
      createdAt: row.createdAt
    }));
  }

  return memoryMessages.slice(-MAX_HISTORY);
}

async function saveMessage(message) {
  if (mongoose.connection.readyState === 1) {
    const saved = await Message.create(message);
    return {
      username: saved.username,
      text: saved.text,
      createdAt: saved.createdAt
    };
  }

  memoryMessages.push(message);
  if (memoryMessages.length > MAX_HISTORY) memoryMessages.shift();
  return message;
}

io.on("connection", socket => {
  console.log(`Client connected: ${socket.id}`);

  getHistory()
    .then(history => socket.emit("chat history", history))
    .catch(error => {
      console.error("Failed to load message history:", error.message);
      socket.emit("chat history", memoryMessages.slice(-MAX_HISTORY));
    });

  socket.on("chat message", async payload => {
    if (!payload || typeof payload.text !== "string") return;

    const username = typeof payload.username === "string"
      ? payload.username.trim().slice(0, MAX_USERNAME_LENGTH) || "Guest"
      : "Guest";
    const text = payload.text.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!text) return;

    const message = { username, text, createdAt: new Date() };

    try {
      const savedMessage = await saveMessage(message);
      io.emit("chat message", savedMessage);
    } catch (error) {
      console.error("Failed to save message:", error.message);
      socket.emit("chat error", "Message could not be saved. Please try again.");
    }
  });

  socket.on("disconnect", reason => {
    console.log(`Client disconnected: ${socket.id} (${reason})`);
  });
});

async function start() {
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 4000 });
      console.log("Connected to MongoDB");
    } catch (error) {
      console.warn(`MongoDB unavailable: ${error.message}`);
      console.warn("Starting in memory-only mode; messages will not persist after restart.");
    }
  } else {
    console.log("MONGODB_URI not set; starting in memory-only mode.");
  }

  server.listen(PORT, () => {
    console.log(`Chat app running at http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

start().catch(error => {
  console.error("Failed to start chat app:", error);
  process.exit(1);
});

async function shutdown() {
  console.log("\nShutting down...");
  server.close(async () => {
    await mongoose.disconnect().catch(() => {});
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
