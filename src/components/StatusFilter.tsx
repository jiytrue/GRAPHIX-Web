interface StatusFilterProps {
  label?: string
  value: string
  onChange: (value: string) => void
}

export default function StatusFilter({ label = 'Status:', value, onChange }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-2 w-full md:w-auto">
      <label className="font-medium text-slate-700 text-sm whitespace-nowrap">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 md:flex-initial px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm"
      >
        <option value="all">All Status</option>
        <option value="diagnosing">Diagnosing</option>
        <option value="repairing">Repairing</option>
        <option value="repaired">Repaired</option>
        <option value="received">Received</option>
        <option value="returned">Returned / Refund</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  )
}
