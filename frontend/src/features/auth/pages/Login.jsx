import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiZap, FiMail, FiLock, FiArrowRight, FiLoader } from "react-icons/fi";
import { getErrorMessage } from "../../../shared/services/api";
import { useAuth } from "../../../shared/context/AuthContext";
import { useToast } from "../../../shared/context/ToastContext";
import { login as loginRequest } from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginRequest(email, password);
      login(response.data.token, response.data.user);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 bg-grid-fade px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500 to-violet-glow flex items-center justify-center mb-3">
            <FiZap className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold text-white">Welcome back to PrepAI</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to continue your prep</p>
        </div>

        <form onSubmit={handleLogin} className="card p-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? <FiLoader className="animate-spin" size={16} /> : <>Sign In <FiArrowRight size={16} /></>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-accent-400 hover:text-accent-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
