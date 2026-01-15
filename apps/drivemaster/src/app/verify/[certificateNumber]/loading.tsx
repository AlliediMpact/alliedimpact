export default function CertificateVerificationLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-pulse">
        {/* Logo skeleton */}
        <div className="h-12 bg-gray-200 rounded w-48 mx-auto mb-8"></div>

        {/* Title skeleton */}
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>

        {/* Subtitle skeleton */}
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>

        {/* Certificate box skeleton */}
        <div className="bg-gray-100 rounded-xl p-8 mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>

        <p className="text-gray-500">Verifying certificate...</p>
      </div>
    </div>
  );
}
