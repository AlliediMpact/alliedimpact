'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DrivingSchoolService, DrivingSchool } from '@/lib/services/DrivingSchoolService';
import { Button } from '@allied-impact/ui';

export function SchoolAdCarousel() {
  const router = useRouter();
  const [schools, setSchools] = useState<DrivingSchool[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    if (schools.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % schools.length);
      }, 5000); // Auto-advance every 5 seconds

      return () => clearInterval(interval);
    }
  }, [schools.length]);

  const loadSchools = async () => {
    try {
      const drivingSchoolService = new DrivingSchoolService();
      const fetchedSchools = await drivingSchoolService.getActiveSchools();
      // Randomly shuffle schools for variety
      const shuffled = fetchedSchools.sort(() => Math.random() - 0.5);
      setSchools(shuffled.slice(0, 5)); // Show max 5 schools in carousel
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + schools.length) % schools.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % schools.length);
  };

  const handleViewSchool = (schoolId: string) => {
    router.push(`/schools/${schoolId}/contact`);
  };

  if (schools.length === 0) {
    return null;
  }

  const currentSchool = schools[currentIndex];

  return (
    <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-semibold text-primary-600 mb-1">SPONSORED</div>
          <h3 className="text-lg font-bold">Featured Driving Schools</h3>
        </div>
        <Button variant="secondary" onClick={() => router.push('/schools')}>
          View All Schools
        </Button>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Cover Image */}
          {currentSchool.coverImageUrl ? (
            <div
              className="h-48 bg-cover bg-center"
              style={{ backgroundImage: `url(${currentSchool.coverImageUrl})` }}
            />
          ) : (
            <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-8xl">🏫</span>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              {currentSchool.logoUrl ? (
                <img
                  src={currentSchool.logoUrl}
                  alt={currentSchool.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                  🚗
                </div>
              )}
              <div>
                <h4 className="text-xl font-bold">{currentSchool.name}</h4>
                <p className="text-sm text-gray-600">
                  {currentSchool.regions.slice(0, 2).join(', ')}
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-2">{currentSchool.description}</p>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                📞 {currentSchool.contactPhone}
              </div>
              <Button onClick={() => handleViewSchool(currentSchool.schoolId)}>
                Contact School
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        {schools.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
            >
              →
            </button>
          </>
        )}

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {schools.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-primary-600' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
