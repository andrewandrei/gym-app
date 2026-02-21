function ProgressBar({ value, max }: { value: number; max: number }) {
  const percentage = (value / max) * 100

  return (
    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-neutral-700 rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
