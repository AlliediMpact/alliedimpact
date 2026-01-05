'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '../../lib/dashboard-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Target,
  Building2
} from 'lucide-react';

interface Investment {
  id: string;
  companyName: string;
  sector: string;
  investmentAmount: number;
  currentValuation: number;
  equityPercentage: number;
  investmentDate: Date;
  stage: 'seed' | 'series-a' | 'series-b' | 'series-c' | 'growth';
  status: 'active' | 'exited' | 'written-off';
  roi: number;
  lastUpdate: Date;
}

interface PortfolioStats {
  totalInvested: number;
  currentValue: number;
  totalROI: number;
  activeInvestments: number;
  exitedInvestments: number;
  averageROI: number;
}

export default function InvestorDashboard() {
  const { platformUser, loading } = useDashboard();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    totalInvested: 0,
    currentValue: 0,
    totalROI: 0,
    activeInvestments: 0,
    exitedInvestments: 0,
    averageROI: 0,
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (platformUser) {
      loadInvestmentData();
    }
  }, [platformUser]);

  const loadInvestmentData = async () => {
    setLoadingData(true);
    try {
      // TODO: Implement investment management endpoints
      // For now, showing mock data
      const mockInvestments: Investment[] = [
        {
          id: '1',
          companyName: 'TechStart Africa',
          sector: 'FinTech',
          investmentAmount: 500000,
          currentValuation: 750000,
          equityPercentage: 12.5,
          investmentDate: new Date('2024-03-15'),
          stage: 'series-a',
          status: 'active',
          roi: 50,
          lastUpdate: new Date('2026-01-01'),
        },
        {
          id: '2',
          companyName: 'EduLearn Platform',
          sector: 'EdTech',
          investmentAmount: 300000,
          currentValuation: 520000,
          equityPercentage: 8.0,
          investmentDate: new Date('2024-06-20'),
          stage: 'seed',
          status: 'active',
          roi: 73.3,
          lastUpdate: new Date('2025-12-28'),
        },
        {
          id: '3',
          companyName: 'AgriTech Solutions',
          sector: 'AgriTech',
          investmentAmount: 400000,
          currentValuation: 450000,
          equityPercentage: 10.0,
          investmentDate: new Date('2024-09-10'),
          stage: 'seed',
          status: 'active',
          roi: 12.5,
          lastUpdate: new Date('2026-01-03'),
        },
        {
          id: '4',
          companyName: 'HealthPlus Digital',
          sector: 'HealthTech',
          investmentAmount: 250000,
          currentValuation: 800000,
          equityPercentage: 5.0,
          investmentDate: new Date('2023-11-05'),
          stage: 'series-b',
          status: 'exited',
          roi: 220,
          lastUpdate: new Date('2025-10-15'),
        },
      ];

      setInvestments(mockInvestments);
      
      const totalInvested = mockInvestments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
      const currentValue = mockInvestments
        .filter(inv => inv.status === 'active')
        .reduce((sum, inv) => sum + inv.currentValuation, 0);
      const totalROI = ((currentValue - totalInvested) / totalInvested) * 100;
      
      setStats({
        totalInvested,
        currentValue,
        totalROI,
        activeInvestments: mockInvestments.filter(inv => inv.status === 'active').length,
        exitedInvestments: mockInvestments.filter(inv => inv.status === 'exited').length,
        averageROI: mockInvestments.reduce((sum, inv) => sum + inv.roi, 0) / mockInvestments.length,
      });
    } catch (error) {
      console.error('Error loading investment data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (investments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Start Building Your Portfolio</h2>
        <p className="text-muted-foreground mb-6">
          You haven't made any investments yet. Explore opportunities to begin.
        </p>
        <Button>
          <TrendingUp className="h-4 w-4 mr-2" />
          Browse Opportunities
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Investment Portfolio</h1>
          <p className="text-muted-foreground">
            Track your investments and portfolio performance
          </p>
        </div>
        <Button>
          <TrendingUp className="h-4 w-4 mr-2" />
          New Investment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R {stats.totalInvested.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {stats.activeInvestments} companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R {stats.currentValue.toLocaleString()}
            </div>
            <p className={`text-xs mt-1 flex items-center ${stats.totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.totalROI >= 0 ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {Math.abs(stats.totalROI).toFixed(1)}% ROI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeInvestments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.exitedInvestments} exited
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageROI.toFixed(1)}%</div>
            <p className="text-xs text-green-600 mt-1">
              Strong performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Allocation</CardTitle>
          <CardDescription>Investment distribution by sector</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(
              investments
                .filter(inv => inv.status === 'active')
                .reduce((acc, inv) => {
                  acc[inv.sector] = (acc[inv.sector] || 0) + inv.currentValuation;
                  return acc;
                }, {} as Record<string, number>)
            ).map(([sector, value]) => {
              const percentage = (value / stats.currentValue) * 100;
              return (
                <div key={sector} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{sector}</span>
                    <span className="text-muted-foreground">
                      R {value.toLocaleString()} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Investments */}
      <Card>
        <CardHeader>
          <CardTitle>Active Investments</CardTitle>
          <CardDescription>Your current portfolio companies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investments
              .filter(inv => inv.status === 'active')
              .sort((a, b) => b.roi - a.roi)
              .map(investment => (
                <div key={investment.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{investment.companyName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {investment.sector} • {investment.stage.replace('-', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      investment.roi >= 50 ? 'bg-green-100 text-green-800' :
                      investment.roi >= 20 ? 'bg-blue-100 text-blue-800' :
                      investment.roi >= 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {investment.roi >= 0 ? '+' : ''}{investment.roi.toFixed(1)}% ROI
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted rounded">
                    <div>
                      <p className="text-xs text-muted-foreground">Invested</p>
                      <p className="font-medium">R {investment.investmentAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Current Value</p>
                      <p className="font-medium">R {investment.currentValuation.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Equity</p>
                      <p className="font-medium">{investment.equityPercentage}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Investment Date</p>
                      <p className="font-medium">{investment.investmentDate.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Last updated {investment.lastUpdate.toLocaleDateString()}
                    </span>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Exited Investments */}
      {stats.exitedInvestments > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Exited Investments</CardTitle>
            <CardDescription>Completed investments and returns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {investments
                .filter(inv => inv.status === 'exited')
                .map(investment => (
                  <div key={investment.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{investment.companyName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {investment.sector} • Exited {investment.lastUpdate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+{investment.roi.toFixed(1)}% ROI</p>
                      <p className="text-xs text-muted-foreground">
                        R {investment.investmentAmount.toLocaleString()} → R {investment.currentValuation.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
