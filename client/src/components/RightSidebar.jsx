import React, { useContext, useMemo } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);

  const msgImages = useMemo(() => {
    return messages
      .filter((msg) => msg.image && !msg.deleted)
      .map((msg) => msg.image);
  }, [messages]);

  if (!selectedUser) return null;

  return (
    <div className="bg-[#8185B2]/10 text-white w-full h-full flex flex-col max-md:hidden">
      {/* Profile Section */}
      <div className="pt-12 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt=""
          className="w-20 aspect-[1/1] rounded-full"
        />
        <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
          {onlineUsers.includes(selectedUser._id) && (
            <p className="w-2 h-2 rounded-full bg-green-500"></p>
          )}
          {selectedUser.fullName}
        </h1>
        <p className="px-10 mx-auto">{selectedUser.bio}</p>
      </div>

      <hr className="border-[#ffffff50] my-4" />

      {/* Media Section */}
      <div className="px-5 text-xs flex-1 overflow-y-auto">
        <p>Media</p>
        <div className="mt-2 max-h-[200px] overflow-y-auto grid grid-cols-2 gap-4 opacity-80">
          {msgImages.map((url, index) => (
            <div
              key={index}
              onClick={() => window.open(url, "_blank")}
              className="cursor-pointer rounded"
            >
              <img
                src={url}
                alt=""
                className="w-full h-20 object-cover rounded-md"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full p-4">
        <button
          onClick={logout}
          className="w-full bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-4 rounded-full cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;
