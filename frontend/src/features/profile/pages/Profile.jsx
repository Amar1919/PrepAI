import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSave, FiLoader, FiAward, FiZap, FiAlertTriangle, FiTrash2, FiLock } from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { getErrorMessage } from "../../../shared/services/api";
import { updateProfile as updateProfileRequest, deleteAccount } from "../services/profileService";
import { useAuth } from "../../../shared/context/AuthContext";
import { useToast } from "../../../shared/context/ToastContext";

function Profile() {
  const { user, patchUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [targetRole, setTargetRole] = useState(user?.targetRole || "");
  const [saving, setSaving] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfileRequest({ name, targetRole });
      patchUser(res.data.user);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      toast.error("Enter your password to confirm");
      return;
    }

    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      toast.success("Account deleted. Sorry to see you go.");
      logout();
      navigate("/");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="card p-6 flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
          style={{ background: user?.avatarColor || "#6366f1" }}
        >
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-100">{user?.name}</h1>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <FaFire className="mx-auto text-orange-400 mb-1.5" size={20} />
          <p className="text-lg font-bold text-white">{user?.streak?.current ?? 0}</p>
          <p className="text-xs text-slate-500">Day Streak</p>
        </div>
        <div className="card p-4 text-center">
          <FiZap className="mx-auto text-accent-400 mb-1.5" size={20} />
          <p className="text-lg font-bold text-white">{user?.xp ?? 0}</p>
          <p className="text-xs text-slate-500">Total XP</p>
        </div>
        <div className="card p-4 text-center">
          <FiAward className="mx-auto text-amber-400 mb-1.5" size={20} />
          <p className="text-lg font-bold text-white">{user?.badges?.length ?? 0}</p>
          <p className="text-xs text-slate-500">Badges</p>
        </div>
      </div>

      {user?.badges?.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-3">Your Badges</h2>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {user.badges.map((b) => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-base-800 border border-base-700">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-100">{b.name}</p>
                  <p className="text-xs text-slate-500">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="card p-5 space-y-4">
        <h2 className="section-title">Edit Profile</h2>
        <div>
          <label className="label">Full Name</label>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Target Role</label>
          <input
            className="input-field"
            placeholder="e.g. Frontend Developer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <FiLoader className="animate-spin" size={16} /> : <><FiSave size={15} /> Save Changes</>}
        </button>
      </form>

      <div className="card p-5 border-rose-500/20">
        <div className="flex items-center gap-2 mb-3">
          <FiAlertTriangle className="text-rose-400" size={16} />
          <h2 className="section-title text-rose-400">Danger Zone</h2>
        </div>

        {!confirmingDelete ? (
          <>
            <p className="text-sm text-slate-500 mb-3">
              Permanently delete your account and all data - interviews, resume analyses, DSA
              submissions, and chat history. This can't be undone.
            </p>
            <button
              onClick={() => setConfirmingDelete(true)}
              className="btn-secondary border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
            >
              <FiTrash2 size={15} /> Delete Account
            </button>
          </>
        ) : (
          <form onSubmit={handleDeleteAccount} className="space-y-3">
            <p className="text-sm text-rose-300">
              This is permanent. Enter your password to confirm you want to delete your account.
            </p>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="password"
                required
                placeholder="Your password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="input-field pl-10"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={deleting}
                className="btn-primary bg-rose-500 hover:bg-rose-600 shadow-none"
              >
                {deleting ? <FiLoader className="animate-spin" size={16} /> : "Yes, Delete My Account"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmingDelete(false);
                  setDeletePassword("");
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;