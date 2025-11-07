import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { authUser, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="relative">
          <div className="flex space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-5 h-5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: "1.6s",
                  boxShadow: "0 0 10px rgba(56, 189, 248, 0.5)",
                }}
              ></div>
            ))}
          </div>

          <div className="absolute inset-0 flex space-x-2 opacity-30">
            {[...Array(5)].map((_, i) => (
              <div
                key={`glow-${i}`}
                className="w-5 h-5 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full"
                style={{
                  animation: `pulse 2s infinite ${i * 0.15}s`,
                  filter: "blur(8px)",
                }}
              ></div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <h3 className="text-white text-xl font-bold mb-2 animate-pulse">
              Loading...
            </h3>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full overflow-hidden">
              <div className="h-full bg-white animate-progress w-1/3"></div>
            </div>
          </div>

          <style jsx>{`
            @keyframes bounce {
              0%,
              80%,
              100% {
                transform: translateY(0);
                animation-timing-function: cubic-bezier(0.2, 0.8, 0.6, 1);
              }
              40% {
                transform: translateY(-25px);
                animation-timing-function: cubic-bezier(0.2, 0.8, 0.6, 1);
              }
            }
            @keyframes pulse {
              0%,
              100% {
                opacity: 0.3;
              }
              50% {
                opacity: 0.8;
              }
            }
            @keyframes progress {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(200%);
              }
            }
            .animate-progress {
              animation: progress 2s infinite linear;
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { authUser, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="relative">
          <div className="flex space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-5 h-5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: "1.6s",
                  boxShadow: "0 0 10px rgba(56, 189, 248, 0.5)",
                }}
              ></div>
            ))}
          </div>

          <div className="absolute inset-0 flex space-x-2 opacity-30">
            {[...Array(5)].map((_, i) => (
              <div
                key={`glow-${i}`}
                className="w-5 h-5 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full"
                style={{
                  animation: `pulse 2s infinite ${i * 0.15}s`,
                  filter: "blur(8px)",
                }}
              ></div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <h3 className="text-white text-xl font-bold mb-2 animate-pulse">
              Loading...
            </h3>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full overflow-hidden">
              <div className="h-full bg-white animate-progress w-1/3"></div>
            </div>
          </div>

          <style jsx>{`
            @keyframes bounce {
              0%,
              80%,
              100% {
                transform: translateY(0);
                animation-timing-function: cubic-bezier(0.2, 0.8, 0.6, 1);
              }
              40% {
                transform: translateY(-25px);
                animation-timing-function: cubic-bezier(0.2, 0.8, 0.6, 1);
              }
            }
            @keyframes pulse {
              0%,
              100% {
                opacity: 0.3;
              }
              50% {
                opacity: 0.8;
              }
            }
            @keyframes progress {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(200%);
              }
            }
            .animate-progress {
              animation: progress 2s infinite linear;
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (authUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <div className="bg-[url('/bgImage.svg')] bg-contain min-h-screen">
      <Toaster />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
