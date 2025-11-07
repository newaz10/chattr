import { useContext, useState } from "react";
import { toast } from "react-hot-toast";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Login");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { login } = useContext(AuthContext);

  const onSubmitHandler = (e) => {
    e.preventDefault();

    // Validation
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    if (currState === "Sign Up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    login(currState === "Sign Up" ? "signup" : "login", {
      fullName,
      email,
      password,
      bio,
    });
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setBio("");
    setTermsAccepted(false);
    setIsDataSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      <img src={assets.logo_big} alt="logo" className="w-[min(30vw,250px)]" />
      <form
        onSubmit={onSubmitHandler}
        className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg"
      >
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currState}
          {isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt=""
              className="w-5 cursor-pointer"
            />
          )}
        </h2>

        {currState === "Sign Up" && !isDataSubmitted && (
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Full Name"
            required
          />
        )}

        {!isDataSubmitted && (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Email Address"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Password"
              required
            />
          </>
        )}

        {currState === "Sign Up" && isDataSubmitted && (
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Provide a short bio.."
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 opacity-80"
          ></textarea>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <p>I Agree to the terms of use & privacy policy</p>
        </div>

        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer"
        >
          {currState === "Sign Up" ? "Create Account" : "Login"}
        </button>

        <div className="flex flex-col gap-2">
          {currState === "Sign Up" ? (
            <p className="text-sm text-gray-600">
              Already have an account?
              <span
                onClick={() => {
                  setCurrState("Login");
                  resetForm();
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p
              onClick={() => {
                setCurrState("Sign Up");
                resetForm();
              }}
              className="font-medium text-violet-500 cursor-pointer"
            >
              Create an Account
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
