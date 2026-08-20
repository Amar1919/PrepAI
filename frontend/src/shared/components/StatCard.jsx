function StatCard({ icon: Icon, label, value, accent = "text-accent-400" }) {
  return (
    <div className="card p-4 flex items-center gap-3.5">
      <div className={`w-10 h-10 rounded-xl bg-base-800 flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-slate-100 leading-tight">{value}</p>
        <p className="text-xs text-slate-500 truncate">{label}</p>
      </div>
    </div>
  );
}

export default StatCard;
