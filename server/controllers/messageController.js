import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

const extractPublicId = (url) => {
  if (!url) return null;
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1];
  return lastPart.split(".")[0];
};

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );
    const userIds = filteredUsers.map((u) => u._id);
    const unseenAgg = await Message.aggregate([
      {
        $match: {
          receiver: userId,
          seen: false,
          sender: { $in: userIds },
        },
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
    ]);
    const unseenMessages = {};
    unseenAgg.forEach((item) => {
      unseenMessages[item._id.toString()] = item.count;
    });

    const lastMessagesAgg = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId, receiver: { $in: userIds } },
            { sender: { $in: userIds }, receiver: userId },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$receiver",
              else: "$sender",
            },
          },
          lastMsgAt: { $first: "$createdAt" },
        },
      },
    ]);

    const userLastMessageMap = {};
    lastMessagesAgg.forEach((item) => {
      userLastMessageMap[item._id.toString()] = item.lastMsgAt;
    });
    const usersWithLastMsg = filteredUsers.map((user) => {
      const u = user.toObject();
      u.lastMessageAt = userLastMessageMap[user._id.toString()] || null;
      return u;
    });
    res.json({
      success: true,
      users: usersWithLastMsg,
      unseenMessages,
    });
  } catch (error) {
    console.log("Error in getUsersForSidebar:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: selectedUserId },
        { sender: selectedUserId, receiver: myId },
      ],
    });
    await Message.updateMany(
      { sender: selectedUserId, receiver: myId, seen: false },
      { seen: true }
    );
    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.log("Error in getMessages:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({
      success: true,
      message: "Message marked as seen",
    });
  } catch (error) {
    console.log("Error in markMessagesAsSeen:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const sender = req.user._id;
    const receiver = req.params.id;
    const { text, image } = req.body;

    if (!receiver) {
      return res.status(400).json({ message: "Receiver is required." });
    }
    if (!text && !image) {
      return res.status(400).json({ message: "Message cannot be empty." });
    }

    let imageUrl = image;

    if (image && image.startsWith("data:image/")) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chattr/messages",
      });
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({ sender, receiver, text, image: imageUrl });
    const savedMessage = await newMessage.save();

    const receiverSocketId = userSocketMap[receiver];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", savedMessage);
    }
    const senderSocketId = userSocketMap[sender];
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", savedMessage);
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    console.log("Error in sendMessage:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const message = await Message.findById(id);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }
    if (String(message.sender) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      });
    }
    if (message.image) {
      const publicId = extractPublicId(message.image);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn("Failed to delete image from Cloudinary:", err.message);
        }
      }
    }
    message.deleted = true;
    message.text = "This message was deleted";
    message.image = "";
    const updatedMessage = await message.save();
    const senderSocketId = userSocketMap[message.sender];
    const receiverSocketId = userSocketMap[message.receiver];
    if (senderSocketId)
      io.to(senderSocketId).emit("messageDeleted", updatedMessage);
    if (receiverSocketId)
      io.to(receiverSocketId).emit("messageDeleted", updatedMessage);
    res.json({
      success: true,
      message: "Message deleted",
      data: updatedMessage,
    });
  } catch (error) {
    console.log("Error in deleteMessage:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
