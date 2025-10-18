/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [messageCache, setMessageCache] = useState({});
  const { socket, axios, authUser } = useContext(AuthContext);

  const selectedUserRef = useRef(selectedUser);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  const getMessages = useCallback(
    async (userId) => {
      try {
        if (messageCache[userId]) {
          setMessages(messageCache[userId]);
          setUnseenMessages((prev) => ({
            ...prev,
            [userId]: 0,
          }));
          return;
        }
        setMessages([]);
        const { data } = await axios.get(`/api/messages/${userId}`);
        if (data.success) {
          const sortedMessages = data.messages.sort((a, b) =>
            a.createdAt.localeCompare(b.createdAt)
          );
          setMessages(sortedMessages);
          setMessageCache((prev) => ({
            ...prev,
            [userId]: sortedMessages,
          }));
          setUnseenMessages((prev) => ({
            ...prev,
            [userId]: 0,
          }));
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load messages");
      }
    },
    [axios, messageCache]
  );

  const getUsers = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        if (data.unseenMessages) {
          setUnseenMessages(data.unseenMessages);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    }
  }, [axios]);

  const sendMessage = useCallback(
    async (messageData) => {
      if (!selectedUserRef.current) return;
      try {
        await axios.post(
          `/api/messages/send/${selectedUserRef.current._id}`,
          messageData
        );
        getUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send message");
      }
    },
    [axios, getUsers]
  );

  useEffect(() => {
    if (!socket || !authUser) return;

    const handleNewMessage = (newMessage) => {
      const currentUserId = authUser._id;
      const chatUserId =
        newMessage.sender === currentUserId
          ? newMessage.receiver
          : newMessage.sender;

      setMessageCache((prev) => ({
        ...prev,
        [chatUserId]: [...(prev[chatUserId] || []), newMessage],
      }));

      getUsers();

      if (
        selectedUserRef.current &&
        selectedUserRef.current._id === chatUserId
      ) {
        setMessages((prev) => [...prev, newMessage]);
        if (newMessage.sender !== currentUserId) {
          axios.put(`/api/messages/mark/${newMessage._id}`);
          setUnseenMessages((prev) => ({ ...prev, [chatUserId]: 0 }));
        }
      } else if (newMessage.sender !== currentUserId) {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.sender]: (prev[newMessage.sender] || 0) + 1,
        }));
      }
    };

    const handleMessageDeleted = (deletedMsg) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === deletedMsg._id ? deletedMsg : msg))
      );
      setMessageCache((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((userId) => {
          if (updated[userId]) {
            updated[userId] = updated[userId].map((msg) =>
              msg._id === deletedMsg._id ? deletedMsg : msg
            );
          }
        });
        return updated;
      });
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [socket, authUser, axios, getUsers]);

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
    } else {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    if (authUser) {
      getUsers();
    }
  }, [authUser, getUsers]);

  useEffect(() => {
    const handleClearCache = () => {
      setMessageCache({});
      setMessages([]);
      setSelectedUser(null);
      setUsers([]);
      setUnseenMessages({});
    };
    window.addEventListener("clearChatCache", handleClearCache);
    return () => window.removeEventListener("clearChatCache", handleClearCache);
  }, []);

  const deleteMessage = useCallback(
    async (messageId) => {
      if (!selectedUser) return;
      const messageToDelete = messages.find((msg) => msg._id === messageId);
      if (!messageToDelete || messageToDelete.sender !== authUser._id) {
        toast.error("You can only delete your own messages");
        return;
      }
      const updatedMessage = {
        ...messageToDelete,
        text: "This message was deleted",
        deleted: true,
        image: "",
      };
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? updatedMessage : msg))
      );
      setMessageCache((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((userId) => {
          if (updated[userId]) {
            updated[userId] = updated[userId].map((msg) =>
              msg._id === messageId ? updatedMessage : msg
            );
          }
        });
        return updated;
      });
      try {
        await axios.delete(`/api/messages/${messageId}`);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete message"
        );
      }
    },
    [axios, selectedUser, messages, authUser]
  );

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    deleteMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
