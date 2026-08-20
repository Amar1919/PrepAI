function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-base-800 flex items-center justify-center text-slate-500 mb-3">
          <Icon size={20} />
        </div>
      )}
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {description && <p className="text-xs text-slate-500 mt-1 max-w-xs">{description}</p>}
    </div>
  );
}

export default EmptyState;
