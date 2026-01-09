'use client';

import { useState } from 'react';
import { Wallet, FolderKanban, GraduationCap, Car, Code, Trophy, Search, Filter, ArrowRight, Check, X } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  longDescription: string;
  url: string;
  status: 'active' | 'coming-soon';
  category: 'finance' | 'productivity' | 'education' | 'lifestyle' | 'development';
  features: string[];
  price: string;
  color: string;
}

const products: Product[] = [
  {
    id: 'coinbox',
    name: 'Coin Box',
    icon: Wallet,
    description: 'P2P Financial Platform',
    longDescription: 'Manage your finances with peer-to-peer transactions, savings jars, and smart financial tools.',
    url: '/products/coinbox',
    status: 'active',
    category: 'finance',
    features: ['P2P Transfers', 'Savings Jars', 'Transaction History', 'Financial Analytics'],
    price: 'Free',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'myprojects',
    name: 'My Projects',
    icon: FolderKanban,
    description: 'Project Management',
    longDescription: 'Organize and track your projects with intuitive kanban boards and collaboration tools.',
    url: '/products/myprojects',
    status: 'active',
    category: 'productivity',
    features: ['Kanban Boards', 'Task Management', 'Team Collaboration', 'Progress Tracking'],
    price: 'Free',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'umkhanyakude',
    name: 'uMkhanyakude',
    icon: GraduationCap,
    description: 'Community Education',
    longDescription: 'Access educational content and courses tailored for community development and personal growth.',
    url: '/products/umkhanyakude',
    status: 'active',
    category: 'education',
    features: ['Online Courses', 'Community Resources', 'Progress Tracking', 'Certificates'],
    price: 'Free',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'drivemaster',
    name: 'Drive Master',
    icon: Car,
    description: 'Driver Training Platform',
    longDescription: 'Learn to drive with comprehensive training materials, practice tests, and expert guidance.',
    url: '/products/drive-master',
    status: 'coming-soon',
    category: 'education',
    features: ['Theory Training', 'Practice Tests', 'Road Safety', 'License Preparation'],
    price: 'Coming Soon',
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'codetech',
    name: 'Code Tech',
    icon: Code,
    description: 'Coding Education',
    longDescription: 'Master programming and technology skills with interactive lessons and real-world projects.',
    url: '/products/codetech',
    status: 'coming-soon',
    category: 'education',
    features: ['Coding Tutorials', 'Interactive Lessons', 'Projects', 'Mentorship'],
    price: 'Coming Soon',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    id: 'cupfinal',
    name: 'Cup Final',
    icon: Trophy,
    description: 'Sports Management',
    longDescription: 'Manage sports leagues, tournaments, and teams with comprehensive tracking and analytics.',
    url: '/products/cup-final',
    status: 'coming-soon',
    category: 'lifestyle',
    features: ['League Management', 'Tournament Brackets', 'Team Stats', 'Live Scores'],
    price: 'Coming Soon',
    color: 'from-red-500 to-red-600',
  },
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'finance', label: 'Finance' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'education', label: 'Education' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'development', label: 'Development' },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && product.status === 'active') ||
                         (statusFilter === 'coming-soon' && product.status === 'coming-soon');
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const toggleCompare = (productId: string) => {
    if (compareList.includes(productId)) {
      setCompareList(compareList.filter(id => id !== productId));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, productId]);
    }
  };

  const compareProducts = products.filter(p => compareList.includes(p.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary/30 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">All Products</h1>
          <p className="text-lg text-muted-foreground">
            Explore the full Allied iMpact ecosystem
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-background border-2 border-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-background rounded-xl border-2 border-muted">
            <Filter className="h-5 w-5 text-muted-foreground" />
            
            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setCategoryFilter(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    categoryFilter === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('coming-soon')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'coming-soon'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Coming Soon
              </button>
            </div>

            {/* Compare Mode Toggle */}
            <button
              onClick={() => {
                setCompareMode(!compareMode);
                if (compareMode) setCompareList([]);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                compareMode
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Compare Mode {compareMode && `(${compareList.length}/3)`}
            </button>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-muted-foreground mb-6">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </p>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-background rounded-xl border-2 overflow-hidden transition-all hover:shadow-xl hover:scale-105 ${
                compareList.includes(product.id) ? 'border-primary ring-2 ring-primary' : 'border-muted'
              }`}
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-br ${product.color} p-6 text-white`}>
                <div className="flex items-start justify-between mb-4">
                  <product.icon className="h-12 w-12" />
                  {compareMode && (
                    <button
                      onClick={() => toggleCompare(product.id)}
                      className={`p-2 rounded-full transition-colors ${
                        compareList.includes(product.id)
                          ? 'bg-white text-primary'
                          : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      {compareList.includes(product.id) ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <div className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                <p className="text-white/90">{product.description}</p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <p className="text-muted-foreground mb-4">{product.longDescription}</p>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-sm">Key Features:</h4>
                  <ul className="space-y-1">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Status & Price */}
                <div className="flex items-center justify-between mb-4 pt-4 border-t border-muted">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                    }`}
                  >
                    {product.status === 'active' ? 'Active' : 'Coming Soon'}
                  </span>
                  <span className="font-bold text-lg">{product.price}</span>
                </div>

                {/* Action Button */}
                <Link
                  href={product.url}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-colors ${
                    product.status === 'active'
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                  onClick={(e) => product.status !== 'active' && e.preventDefault()}
                >
                  {product.status === 'active' ? 'Learn More' : 'Coming Soon'}
                  {product.status === 'active' && <ArrowRight className="h-5 w-5" />}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-background rounded-xl border-2 border-muted">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Comparison Panel */}
        {compareMode && compareList.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t-2 border-muted shadow-xl p-6 z-50">
            <div className="container mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">
                  Compare Products ({compareList.length}/3)
                </h3>
                <button
                  onClick={() => {
                    setCompareMode(false);
                    setCompareList([]);
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {compareProducts.map((product) => (
                  <div key={product.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold">{product.name}</h4>
                      <button
                        onClick={() => toggleCompare(product.id)}
                        className="p-1 hover:bg-background rounded transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                    <p className="text-sm font-medium">{product.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
