export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6 animate-pulse">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-48 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-8 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
