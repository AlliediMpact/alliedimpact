'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { DrivingSchoolService, DrivingSchool } from '@/lib/services/DrivingSchoolService';
import { Button } from '@allied-impact/ui';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { debounce } from '@/lib/utils/rateLimiting';

export default function SchoolsDiscoveryPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [schools, setSchools] = useState<DrivingSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadSchools();
  }, [selectedRegion]);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const drivingSchoolService = new DrivingSchoolService();
      const fetchedSchools = await drivingSchoolService.getActiveSchools(
        selectedRegion === 'all' ? undefined : selectedRegion
      );
      setSchools(fetchedSchools);
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const regions = [
    'All Regions',
    'Western Cape',
    'Eastern Cape',
    'Northern Cape',
    'Free State',
    'KwaZulu-Natal',
    'North West',
    'Gauteng',
    'Mpumalanga',
    'Limpopo',
  ];

  // Filter schools based on search query
  const filteredSchools = useMemo(() => {
    if (!searchQuery.trim()) return schools;
    
    const query = searchQuery.toLowerCase();
    return schools.filter((school) => 
      school.name.toLowerCase().includes(query) ||
      school.description.toLowerCase().includes(query) ||
      school.regions.some(region => region.toLowerCase().includes(query)) ||
      school.contactEmail.toLowerCase().includes(query)
    );
  }, [schools, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Find a Driving School</h1>
              <p className="text-sm text-gray-600">Connect with accredited driving schools</p>
            </div>
            <Link href="/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search schools by name, region, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              Found {filteredSchools.length} school{filteredSchools.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Region Filter */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region === 'All Regions' ? 'all' : region)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  (region === 'All Regions' && selectedRegion === 'all') ||
                  region === selectedRegion
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Schools Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredSchools.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏫</div>
            <h2 className="text-2xl font-bold mb-2">No Schools Found</h2>
            <p className="text-gray-600">
              {searchQuery 
                ? `No schools match "${searchQuery}"` 
                : selectedRegion === 'all'
                ? 'No driving schools available yet.'
                : `No driving schools found in ${selectedRegion}.`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map((school) => (
              <SchoolCard key={school.schoolId} school={school} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function SchoolCard({ school }: { school: DrivingSchool }) {
  const router = useRouter();
  const { user } = useAuth();

  const handleContact = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    router.push(`/schools/${school.schoolId}/contact`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Cover Image */}
      {school.coverImageUrl ? (
        <div
          className="h-40 bg-cover bg-center"
          style={{ backgroundImage: `url(${school.coverImageUrl})` }}
        />
      ) : (
        <div className="h-40 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
          <span className="text-6xl">🏫</span>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Logo and Name */}
        <div className="flex items-center gap-4 mb-4">
          {school.logoUrl ? (
            <img
              src={school.logoUrl}
              alt={school.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
              🚗
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold">{school.name}</h3>
            <div className="text-sm text-gray-600">
              {school.regions.slice(0, 2).join(', ')}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{school.description}</p>

        {/* Contact Info */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <span>📞</span>
            <span>{school.contactPhone}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span>📧</span>
            <span className="truncate">{school.contactEmail}</span>
          </div>
          {school.website && (
            <div className="flex items-center gap-2 text-gray-600">
              <span>🌐</span>
              <a
                href={school.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline truncate"
              >
                {school.website}
              </a>
            </div>
          )}
        </div>

        {/* Contact Button */}
        <Button onClick={handleContact} className="w-full">
          Contact School
        </Button>
      </div>
    </div>
  );
}
