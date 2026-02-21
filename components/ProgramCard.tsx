function ProgramCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-neutral-200">
      
      {/* Image */}
      <div className="relative h-44">
        <img
          src="https://images.unsplash.com/photo-1599058917212-d750089bc07c"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <h2 className="absolute bottom-4 left-4 text-white text-xl font-semibold">
          Strength Foundations
        </h2>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <p className="text-sm text-neutral-500">
          Intermediate • Gym
        </p>

        <ProgressBar value={3} max={21} />

        <div>
          <p className="text-sm font-medium text-neutral-900">
            3 of 21 workouts completed
          </p>
          <p className="text-sm text-neutral-500">
            You're on Workout 4
          </p>
        </div>

        <PrimaryButton>
          Continue Next Workout
        </PrimaryButton>

        <p className="text-xs text-neutral-500 text-center">
          Next up: Workout 4 · Hypertrophy Focus
        </p>
      </div>
    </div>
  )
}
