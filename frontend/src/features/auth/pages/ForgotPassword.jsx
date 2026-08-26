import { useState } from "react";
import { Link } from "react-router-dom";
import { FiZap, FiMail, FiArrowRight, FiLoader, FiCheckCircle } from "react-icons/fi";
import { getErrorMessage } from "../../../shared/services/api";
import { forgotPassword } from "../services/authService";
import { useToast } from "../../../shared/context/ToastContext";

function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
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
          <h1 className="text-xl font-bold text-white">Reset your password</h1>
          <p className="text-sm text-slate-500 mt-1 text-center">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {sent ? (
          <div className="card p-6 text-center space-y-3">
            <FiCheckCircle className="text-emerald-400 mx-auto" size={28} />
            <p className="text-sm text-slate-300">
              If an account exists for <span className="text-slate-100 font-medium">{email}</span>,
              a reset link is on its way. Check your inbox (and spam folder).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
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

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? <FiLoader className="animate-spin" size={16} /> : <>Send Reset Link <FiArrowRight size={16} /></>}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 mt-5">
          <Link to="/login" className="text-accent-400 hover:text-accent-300 font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;