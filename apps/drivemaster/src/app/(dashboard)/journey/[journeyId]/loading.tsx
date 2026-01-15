export default function JourneyLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block relative">
          {/* Spinning car icon */}
          <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">
            🚗
          </div>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-white">Loading Journey...</h2>
        <p className="mt-2 text-white/70">Preparing your questions</p>
      </div>
    </div>
  );
}
