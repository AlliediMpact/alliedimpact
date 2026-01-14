import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            DriveMaster
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* Footer Disclaimer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p className="mb-2">
            <strong>Disclaimer:</strong> DriveMaster is not affiliated with the South African government.
          </p>
          <p>
            This platform provides preparation only. You must pass the official K53 test at a recognized testing center.
          </p>
        </div>
      </footer>
    </div>
  );
}
