export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🚗 DriveMaster
        </h1>
        <p className="text-xl text-center mb-12">
          South African Learner License & Driver Education Platform
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">📚 Theory</h2>
            <p>Master the learner license theory with interactive lessons</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">✅ Practice Tests</h2>
            <p>Test your knowledge with realistic practice exams</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">🎓 Driving Schools</h2>
            <p>Connect with certified driving schools in your area</p>
          </div>
        </div>
      </div>
    </main>
  )
}
