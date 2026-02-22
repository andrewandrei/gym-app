function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="w-full py-4 rounded-2xl bg-neutral-900 text-white text-sm font-medium">
      {children}
    </button>
  );
}
