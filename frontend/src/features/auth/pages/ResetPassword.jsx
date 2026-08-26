import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiZap, FiLock, FiArrowRight, FiLoader, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { getErrorMessage } from "../../../shared/services/api";
import { resetPassword } from "../services/authService";
import { useToast } from "../../../shared/context/ToastContext";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      toast.success("Password reset - you can log in now");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-950 bg-grid-fade px-4">
        <div className="card p-6 text-center max-w-sm">
          <FiAlertTriangle className="text-amber-400 mx-auto mb-3" size={26} />
          <p className="text-sm text-slate-300">This reset link is missing a token.</p>
          <Link to="/forgot-password" className="text-accent-400 hover:text-accent-300 text-sm font-medium mt-3 inline-block">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 bg-grid-fade px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500 to-violet-glow flex items-center justify-center mb-3">
            <FiZap className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold text-white">Choose a new password</h1>
        </div>

        {done ? (
          <div className="card p-6 text-center space-y-3">
            <FiCheckCircle className="text-emerald-400 mx-auto" size={28} />
            <p className="text-sm text-slate-300">Password updated. Redirecting you to log in...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? <FiLoader className="animate-spin" size={16} /> : <>Reset Password <FiArrowRight size={16} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;