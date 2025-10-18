import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: ["http://localhost:5173", "https://chattr-newaz.vercel.app"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "4mb" }));

export const io = new Server(server, { cors: corsOptions });

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    return next(new Error("Invalid token"));
  }
});

export const userSocketMap = {};
io.on("connection", (socket) => {
  const userId = socket.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }
  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

app.use("/api/status", (req, res) => res.send("OK"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

await connectDB();

const PORT = process.env.PORT || 5000;
if (
  process.env.DEPLOYMENT_PLATFORM === "railway" ||
  process.env.NODE_ENV !== "production"
) {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default server;
