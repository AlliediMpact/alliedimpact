'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  ExternalLink,
  Plus
} from 'lucide-react';
import {
  Project,
  ProjectStatus,
  Milestone,
  Deliverable,
  Ticket,
  MilestoneStatus,
  DeliverableStatus,
  TicketStatus,
  getClientProjects,
  getProjectMilestones,
  getProjectDeliverables,
  getProjectTickets,
  getProjectHealthStatus,
  updateMilestone,
} from '@allied-impact/projects';
import { MilestoneModal, MilestoneCard } from '@/components/MilestoneManager';
import { DeliverableModal, DeliverableCard } from '@/components/DeliverableManager';
import { TicketModal, TicketDetailModal, TicketCard } from '@/components/TicketManager';

export default function MyProjectsDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Modal states
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | undefined>();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>();

  useEffect(() => {
    // Check authentication and set up real-time listeners
    const checkAuth = async () => {
      try {
        const { getAuth } = await import('@allied-impact/auth');
        const auth = getAuth();
        
        if (!auth.currentUser) {
          router.push('/login');
          return;
        }
        
        setUser(auth.currentUser);
        setupProjectsListener(auth.currentUser.uid);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (selectedProject) {
      setupProjectDetailsListeners();
    }
    
    // Cleanup listeners on unmount or when project changes
    return () => {
      // Listeners will be cleaned up automatically
    };
  }, [selectedProject]);

  const setupProjectsListener = async (userId: string) => {
    try {
      setLoading(true);
      const { getFirestore, collection, query, where, orderBy, onSnapshot } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      
      const db = getFirestore(getApp());
      const projectsQuery = query(
        collection(db, 'projects'),
        where('clientId', '==', userId),
        orderBy('lastActivityAt', 'desc')
      );

      // Real-time listener for projects
      const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
        const clientProjects = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            lastActivityAt: data.lastActivityAt.toDate(),
            startDate: data.startDate.toDate(),
            endDate: data.endDate ? data.endDate.toDate() : undefined,
          } as Project;
        });

        setProjects(clientProjects);
        
        if (clientProjects.length > 0 && !selectedProject) {
          setSelectedProject(clientProjects[0]);
        }
        
        setLoading(false);
      }, (error) => {
        console.error('Projects listener error:', error);
        setLoading(false);
      });

      // Store unsubscribe function for cleanup
      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to set up projects listener:', error);
      setLoading(false);
    }
  };

  const setupProjectDetailsListeners = async () => {
    if (!selectedProject) return;

    try {
      const { getFirestore, collection, query, where, orderBy, onSnapshot } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      
      const db = getFirestore(getApp());

      // Real-time listener for milestones
      const milestonesQuery = query(
        collection(db, 'milestones'),
        where('projectId', '==', selectedProject.id),
        orderBy('dueDate', 'asc')
      );

      const unsubscribeMilestones = onSnapshot(milestonesQuery, (snapshot) => {
        const projectMilestones = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            dueDate: data.dueDate.toDate(),
            completedDate: data.completedDate ? data.completedDate.toDate() : undefined,
          } as Milestone;
        });
        setMilestones(projectMilestones);
      });

      // Real-time listener for deliverables
      const deliverablesQuery = query(
        collection(db, 'deliverables'),
        where('projectId', '==', selectedProject.id),
        orderBy('dueDate', 'asc')
      );

      const unsubscribeDeliverables = onSnapshot(deliverablesQuery, (snapshot) => {
        const projectDeliverables = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            dueDate: data.dueDate.toDate(),
            deliveredDate: data.deliveredDate ? data.deliveredDate.toDate() : undefined,
            approvedDate: data.approvedDate ? data.approvedDate.toDate() : undefined,
          } as Deliverable;
        });
        setDeliverables(projectDeliverables);
      });

      // Real-time listener for tickets
      const ticketsQuery = query(
        collection(db, 'tickets'),
        where('projectId', '==', selectedProject.id),
        orderBy('createdAt', 'desc')
      );

      const unsubscribeTickets = onSnapshot(ticketsQuery, (snapshot) => {
        const projectTickets = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            resolvedAt: data.resolvedAt ? data.resolvedAt.toDate() : undefined,
            comments: data.comments.map((c: any) => ({
              ...c,
              createdAt: c.createdAt.toDate(),
            })),
          } as Ticket;
        });
        setTickets(projectTickets);
      });

      // Return cleanup function
      return () => {
        unsubscribeMilestones();
        unsubscribeDeliverables();
        unsubscribeTickets();
      };
    } catch (error) {
      console.error('Failed to set up project details listeners:', error);
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

  // Handler functions for modals
  const handleMilestoneEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setShowMilestoneModal(true);
  };

  const handleMilestoneModalClose = () => {
    setShowMilestoneModal(false);
    setEditingMilestone(undefined);
  };

  const handleDeliverableStatusUpdate = async (id: string, status: DeliverableStatus) => {
    try {
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      const db = getFirestore(getApp());
      
      await updateDoc(doc(db, 'deliverables', id), {
        status,
        updatedAt: new Date(),
        ...(status === DeliverableStatus.APPROVED && { approvedDate: new Date() })
      });
    } catch (error) {
      console.error('Failed to update deliverable:', error);
      alert('Failed to update deliverable status');
    }
  };

  const handleTicketStatusUpdate = async (ticketId: string, status: TicketStatus) => {
    try {
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      const db = getFirestore(getApp());
      
      await updateDoc(doc(db, 'tickets', ticketId), {
        status,
        updatedAt: new Date(),
        ...(status === TicketStatus.RESOLVED && { resolvedAt: new Date() })
      });
    } catch (error) {
      console.error('Failed to update ticket:', error);
      alert('Failed to update ticket status');
    }
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
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
            <Button onClick={() => window.open(process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://alliedimpact.com', '_blank')}>
              Contact Sales
            </Button>
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
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-gray-600 mt-1">Track your custom development projects</p>
        </div>
        <Button onClick={() => router.push('/tickets')}>
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
                  <Button variant="outline" size="sm" onClick={() => window.open(selectedProject.githubRepo, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Repository
                  </Button>
                )}
                {selectedProject.stagingUrl && (
                  <Button variant="outline" size="sm" onClick={() => window.open(selectedProject.stagingUrl, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Staging Environment
                  </Button>
                )}
                {selectedProject.productionUrl && (
                  <Button variant="outline" size="sm" onClick={() => window.open(selectedProject.productionUrl, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Production
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Milestones</CardTitle>
                <CardDescription>Track project milestones and progress</CardDescription>
              </div>
              <Button onClick={() => setShowMilestoneModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No milestones yet</p>
                  <p className="text-sm text-gray-500 mt-1">Add your first milestone to track progress</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {milestones.map(milestone => (
                    <MilestoneCard
                      key={milestone.id}
                      milestone={milestone}
                      onEdit={handleMilestoneEdit}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Deliverables</CardTitle>
                <CardDescription>Project deliverables and files</CardDescription>
              </div>
              <Button onClick={() => setShowDeliverableModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Deliverable
              </Button>
            </CardHeader>
            <CardContent>
              {deliverables.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No deliverables yet</p>
                  <p className="text-sm text-gray-500 mt-1">Deliverables will appear here as they're added</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {deliverables.map(deliverable => (
                    <DeliverableCard
                      key={deliverable.id}
                      deliverable={deliverable}
                      onStatusUpdate={handleDeliverableStatusUpdate}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Support Tickets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Questions, issues, and feedback</CardDescription>
              </div>
              <Button onClick={() => setShowTicketModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No tickets yet</p>
                  <p className="text-sm text-gray-500 mt-1">Create a ticket to get support from the team</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {tickets.map(ticket => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onClick={handleTicketClick}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Modals */}
      {showMilestoneModal && selectedProject && (
        <MilestoneModal
          projectId={selectedProject.id}
          milestone={editingMilestone}
          onClose={handleMilestoneModalClose}
          onSuccess={() => {
            // Real-time listener will update automatically
          }}
        />
      )}

      {showDeliverableModal && selectedProject && (
        <DeliverableModal
          projectId={selectedProject.id}
          onClose={() => setShowDeliverableModal(false)}
          onSuccess={() => {
            // Real-time listener will update automatically
          }}
        />
      )}

      {showTicketModal && selectedProject && user && (
        <TicketModal
          projectId={selectedProject.id}
          userId={user.uid}
          userName={user.displayName || user.email}
          onClose={() => setShowTicketModal(false)}
          onSuccess={() => {
            // Real-time listener will update automatically
          }}
        />
      )}

      {selectedTicket && user && (
        <TicketDetailModal
          ticket={selectedTicket}
          userId={user.uid}
          userName={user.displayName || user.email}
          onClose={() => setSelectedTicket(undefined)}
          onStatusUpdate={handleTicketStatusUpdate}
        />
      )}
    </div>
  );
}
