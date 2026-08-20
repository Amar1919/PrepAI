import { FiLoader } from "react-icons/fi";

function Spinner({ size = 18, label }) {
  return (
    <div className="flex items-center gap-2 text-slate-400 text-sm">
      <FiLoader className="animate-spin" size={size} />
      {label && <span>{label}</span>}
    </div>
  );
}

export default Spinner;
