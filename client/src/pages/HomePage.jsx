import { useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-full grid grid-cols-1 relative
          ${
            selectedUser
              ? "fixed inset-0 sm:static sm:rounded-2xl sm:h-full"
              : "h-full"
          }
          ${
            selectedUser
              ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
              : "md:grid-cols-2"
          }`}
      >
        <div
          className={`${
            selectedUser ? "hidden sm:block" : ""
          } h-full overflow-hidden border-r border-gray-600`}
        >
          <Sidebar />
        </div>

        <div className="h-full overflow-hidden">
          <ChatContainer />
        </div>

        {selectedUser && (
          <div className="hidden sm:block h-full overflow-hidden border-l border-gray-600">
            <RightSidebar />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
