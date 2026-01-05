'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  TrendingUp,
  FileText,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import {
  Project,
  ProjectStatus,
  Milestone,
  Deliverable,
  Ticket,
  getClientProjects,
  getProjectMilestones,
  getProjectDeliverables,
  getProjectTickets,
  getProjectHealthStatus,
} from '@allied-impact/projects';

export default function MyProjectsDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectDetails();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const clientProjects = await getClientProjects(user!.uid);
      setProjects(clientProjects);
      
      if (clientProjects.length > 0 && !selectedProject) {
        setSelectedProject(clientProjects[0]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async () => {
    if (!selectedProject) return;

    try {
      const [projectMilestones, projectDeliverables, projectTickets] = await Promise.all([
        getProjectMilestones(selectedProject.id),
        getProjectDeliverables(selectedProject.id),
        getProjectTickets(selectedProject.id),
      ]);

      setMilestones(projectMilestones);
      setDeliverables(projectDeliverables);
      setTickets(projectTickets);
    } catch (error) {
      console.error('Failed to load project details:', error);
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    const colors = {
      [ProjectStatus.DISCOVERY]: 'text-blue-600 bg-blue-100',
      [ProjectStatus.PLANNING]: 'text-purple-600 bg-purple-100',
      [ProjectStatus.IN_PROGRESS]: 'text-green-600 bg-green-100',
      [ProjectStatus.REVIEW]: 'text-yellow-600 bg-yellow-100',
      [ProjectStatus.COMPLETED]: 'text-gray-600 bg-gray-100',
      [ProjectStatus.ON_HOLD]: 'text-orange-600 bg-orange-100',
      [ProjectStatus.CANCELLED]: 'text-red-600 bg-red-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getHealthIcon = (health: 'on-track' | 'at-risk' | 'delayed') => {
    if (health === 'on-track') return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (health === 'at-risk') return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
            <p className="text-gray-600 text-center mb-6">
              You don't have any projects yet. Contact us to get started on your custom development project.
            </p>
            <Button>Contact Sales</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeProjects = projects.filter(p => 
    p.status === ProjectStatus.IN_PROGRESS || 
    p.status === ProjectStatus.PLANNING || 
    p.status === ProjectStatus.DISCOVERY
  );
  
  const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED);
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your custom development projects</p>
        </div>
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          Contact Support
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              {projects.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              {Math.round((completedProjects.length / projects.length) * 100)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              {tickets.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(activeProjects.reduce((sum, p) => sum + p.progress, 0) / (activeProjects.length || 1))}%
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Across active projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Selector */}
      {projects.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {projects.map(project => (
                <Button
                  key={project.id}
                  variant={selectedProject?.id === project.id ? 'default' : 'outline'}
                  onClick={() => setSelectedProject(project)}
                >
                  {project.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Project Details */}
      {selectedProject && (
        <>
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedProject.name}</CardTitle>
                  <CardDescription className="mt-2">{selectedProject.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getHealthIcon(getProjectHealthStatus(selectedProject))}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}>
                    {selectedProject.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Progress</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${selectedProject.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{selectedProject.progress}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Timeline</p>
                  <p className="text-sm font-medium">
                    {new Date(selectedProject.startDate).toLocaleDateString()} - {' '}
                    {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : 'Ongoing'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Budget</p>
                  <p className="text-sm font-medium">
                    {selectedProject.estimatedBudget 
                      ? `${selectedProject.currency} ${selectedProject.estimatedBudget.toLocaleString()}`
                      : 'Not specified'}
                  </p>
                </div>
              </div>

              {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map(tech => (
                      <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                {selectedProject.githubRepo && (
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Repository
                  </Button>
                )}
                {selectedProject.stagingUrl && (
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Staging Environment
                  </Button>
                )}
                {selectedProject.productionUrl && (
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Production
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
              <CardDescription>Track project milestones and deliverables</CardDescription>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No milestones yet</p>
              ) : (
                <div className="space-y-4">
                  {milestones.map(milestone => (
                    <div key={milestone.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{milestone.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                          milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          milestone.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {milestone.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mt-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${milestone.progress}%` }}
                            />
                          </div>
                          <span className="text-xs">{milestone.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Deliverables</CardTitle>
            </CardHeader>
            <CardContent>
              {deliverables.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No deliverables yet</p>
              ) : (
                <div className="space-y-3">
                  {deliverables.slice(0, 5).map(deliverable => (
                    <div key={deliverable.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{deliverable.name}</p>
                          <p className="text-sm text-gray-600">Due: {new Date(deliverable.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        deliverable.status === 'approved' ? 'bg-green-100 text-green-700' :
                        deliverable.status === 'delivered' ? 'bg-blue-100 text-blue-700' :
                        deliverable.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {deliverable.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Support Tickets */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Support Tickets</CardTitle>
                  <CardDescription>Recent tickets and issues</CardDescription>
                </div>
                <Button size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No tickets yet</p>
              ) : (
                <div className="space-y-3">
                  {tickets.slice(0, 5).map(ticket => (
                    <div key={ticket.id} className="flex items-start justify-between py-3 border-b last:border-b-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-600">{ticket.type.toUpperCase()}</span>
                        </div>
                        <p className="font-medium">{ticket.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Created {new Date(ticket.createdAt).toLocaleDateString()} • {ticket.comments.length} comments
                        </p>
                      </div>
                      <span className={`ml-4 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                        ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
