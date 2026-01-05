'use client';

import { useEffect, useState } from 'react';
import { useDashboard } from '../lib/dashboard-context';
import { 
  getUserOrganizations, 
  getOrganizationMembers,
  getOrganizationPrograms,
  type Organization,
  type OrganizationMember,
  type OrganizationProgram,
  OrganizationRole
} from '@allied-impact/organizations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { 
  Users, 
  UserPlus, 
  Settings, 
  BarChart3, 
  Calendar,
  Building2,
  GraduationCap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function OrganizationDashboard() {
  const { platformUser } = useDashboard();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [programs, setPrograms] = useState<OrganizationProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (platformUser) {
      loadOrganizations();
    }
  }, [platformUser]);

  useEffect(() => {
    if (selectedOrg) {
      loadOrganizationData();
    }
  }, [selectedOrg]);

  const loadOrganizations = async () => {
    if (!platformUser) return;
    
    try {
      const orgs = await getUserOrganizations(platformUser.uid);
      setOrganizations(orgs);
      
      if (orgs.length > 0 && !selectedOrg) {
        setSelectedOrg(orgs[0]);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizationData = async () => {
    if (!selectedOrg) return;
    
    try {
      const [membersData, programsData] = await Promise.all([
        getOrganizationMembers(selectedOrg.id),
        getOrganizationPrograms(selectedOrg.id)
      ]);
      
      setMembers(membersData);
      setPrograms(programsData);
    } catch (error) {
      console.error('Error loading organization data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your organization...</p>
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Organization Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Manage your organization, users, and programs
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              No Organization Found
            </CardTitle>
            <CardDescription>
              You don't have any organizations yet. Create one to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg">
              <Building2 className="mr-2 h-5 w-5" />
              Create Organization
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const admins = members.filter(m => m.role === OrganizationRole.ADMIN);
  const managers = members.filter(m => m.role === OrganizationRole.MANAGER);
  const regularMembers = members.filter(m => m.role === OrganizationRole.MEMBER);
  const beneficiaries = members.filter(m => m.role === OrganizationRole.BENEFICIARY);
  const activePrograms = programs.filter(p => p.status === 'active');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            {selectedOrg?.name || 'Organization Dashboard'}
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage users, programs, and track impact
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Organization Selector (if multiple orgs) */}
      {organizations.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Switch Organization</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            {organizations.map(org => (
              <Button
                key={org.id}
                variant={selectedOrg?.id === org.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedOrg(org)}
              >
                <Building2 className="mr-2 h-4 w-4" />
                {org.name}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedOrg?.memberCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {admins.length} admins, {managers.length} managers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficiaries</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedOrg?.beneficiaryCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Program participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePrograms.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {programs.length} total programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground mt-1">
              vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for organization management</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Members
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Create Program
          </Button>
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {members.length} total members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No members yet. Add your first member to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {admins.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Administrators</h3>
                  <div className="space-y-2">
                    {admins.map(member => (
                      <div 
                        key={member.userId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {member.displayName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-medium">{member.displayName || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded">
                            Admin
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {regularMembers.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Members ({regularMembers.length})</h3>
                  <div className="text-sm text-muted-foreground">
                    View full member list →
                  </div>
                </div>
              )}

              {beneficiaries.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Beneficiaries ({beneficiaries.length})</h3>
                  <div className="text-sm text-muted-foreground">
                    Program participants →
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Programs */}
      <Card>
        <CardHeader>
          <CardTitle>Programs</CardTitle>
          <CardDescription>
            {activePrograms.length} active programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {programs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No programs yet. Create your first program to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {activePrograms.map(program => (
                <div 
                  key={program.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div>
                    <h3 className="font-medium">{program.name}</h3>
                    <p className="text-sm text-muted-foreground">{program.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {program.enrolledUsers.length} participants
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details →
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
