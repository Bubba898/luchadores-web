export default function Loading() {
  return (
    <div className="host-eye-bg flex min-h-screen items-center justify-center text-zinc-900">
      <div className="flex flex-col items-center gap-6">
        <img
          src="/logo.png"
          alt="Los Luchadores"
          className="w-full max-w-xl object-contain"
        />
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/40 border-t-white" />
      </div>
    </div>
  );
}
