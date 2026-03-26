interface StatusFilterProps {
  label: string
  value: string
  onChange: (status: string) => void
}

export default function StatusFilter({ label, value, onChange }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="font-medium text-slate-700 text-sm whitespace-nowrap">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm font-medium transition-all hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-maroon-600/20 focus:border-maroon-600"
      >
        <option value="all">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="on-hold">On Hold</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  )
}
