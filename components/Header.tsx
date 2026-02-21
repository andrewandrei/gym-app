function Header() {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          0 of 3 workouts completed this week
        </p>
      </div>

      <button className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center">
        🌙
      </button>
    </div>
  )
}
