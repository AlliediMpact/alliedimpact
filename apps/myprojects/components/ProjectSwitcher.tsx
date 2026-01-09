'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Search, Star, Clock, Briefcase, TrendingUp } from 'lucide-react';
import { getClientProjects, Project } from '@allied-impact/projects';

interface ProjectSwitcherProps {
  currentProject: Project | null;
  onProjectChange: (project: Project) => void;
}

export default function ProjectSwitcher({ currentProject, onProjectChange }: ProjectSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProjects();
    loadFavorites();
  }, []);

  const loadProjects = async () => {
    try {
      const { getAuthInstance } = await import('@allied-impact/auth');
      const auth = getAuthInstance();
      
      if (auth.currentUser) {
        const allProjects = await getClientProjects(auth.currentUser.uid);
        setProjects(allProjects);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('favoriteProjects');
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  };

  const toggleFavorite = (projectId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(projectId)) {
      newFavorites.delete(projectId);
    } else {
      newFavorites.add(projectId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoriteProjects', JSON.stringify([...newFavorites]));
  };

  const handleProjectSelect = (project: Project) => {
    onProjectChange(project);
    setIsOpen(false);
    setSearchQuery('');
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteProjects = filteredProjects.filter(p => favorites.has(p.id));
  const recentProjects = filteredProjects.filter(p => !favorites.has(p.id)).slice(0, 5);
  const otherProjects = filteredProjects.filter(p => 
    !favorites.has(p.id) && !recentProjects.includes(p)
  );

  const getProjectStats = (project: Project) => {
    // These would come from actual data in production
    return {
      progress: project.progress || 0,
      milestonesActive: project.activeMilestones || 0,
      ticketsOpen: project.openTickets || 0
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 bg-green-50';
      case 'Planning':
        return 'text-blue-600 bg-blue-50';
      case 'On Hold':
        return 'text-yellow-600 bg-yellow-50';
      case 'Completed':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 rounded-lg animate-pulse">
        <Briefcase className="h-5 w-5 text-muted-foreground" />
        <div className="h-4 w-32 bg-muted rounded"></div>
      </div>
    );
  }

  if (!currentProject && projects.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Current Project Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-accent/5 hover:bg-accent/10 rounded-lg transition-colors border border-transparent hover:border-accent/20"
      >
        <Briefcase className="h-5 w-5 text-primary" />
        <div className="text-left">
          <div className="font-medium text-sm">
            {currentProject?.name || 'Select Project'}
          </div>
          {currentProject && (
            <div className="text-xs text-muted-foreground">
              {currentProject.status}
            </div>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute left-0 mt-2 w-96 bg-background border rounded-lg shadow-lg z-50 max-h-[600px] flex flex-col">
            {/* Search Bar */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Projects List */}
            <div className="overflow-y-auto flex-1">
              {/* Favorites */}
              {favoriteProjects.length > 0 && (
                <div className="border-b">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Favorites
                  </div>
                  {favoriteProjects.map(project => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isCurrent={currentProject?.id === project.id}
                      isFavorite={true}
                      stats={getProjectStats(project)}
                      statusColor={getStatusColor(project.status)}
                      onSelect={handleProjectSelect}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}

              {/* Recent Projects */}
              {recentProjects.length > 0 && (
                <div className="border-b">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Recent
                  </div>
                  {recentProjects.map(project => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isCurrent={currentProject?.id === project.id}
                      isFavorite={favorites.has(project.id)}
                      stats={getProjectStats(project)}
                      statusColor={getStatusColor(project.status)}
                      onSelect={handleProjectSelect}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}

              {/* All Other Projects */}
              {otherProjects.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    All Projects
                  </div>
                  {otherProjects.map(project => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isCurrent={currentProject?.id === project.id}
                      isFavorite={favorites.has(project.id)}
                      stats={getProjectStats(project)}
                      statusColor={getStatusColor(project.status)}
                      onSelect={handleProjectSelect}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}

              {/* No Results */}
              {filteredProjects.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No projects found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t bg-accent/5">
              <button
                onClick={() => {
                  router.push('/projects/new');
                  setIsOpen(false);
                }}
                className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                + Create New Project
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface ProjectItemProps {
  project: Project;
  isCurrent: boolean;
  isFavorite: boolean;
  stats: { progress: number; milestonesActive: number; ticketsOpen: number };
  statusColor: string;
  onSelect: (project: Project) => void;
  onToggleFavorite: (projectId: string) => void;
}

function ProjectItem({ 
  project, 
  isCurrent, 
  isFavorite, 
  stats, 
  statusColor, 
  onSelect, 
  onToggleFavorite 
}: ProjectItemProps) {
  return (
    <div
      className={`group px-3 py-2 hover:bg-accent/5 cursor-pointer transition-colors ${
        isCurrent ? 'bg-accent/10' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0" onClick={() => onSelect(project)}>
          <div className="flex items-center gap-2 mb-1">
            <div className="font-medium text-sm truncate">{project.name}</div>
            <span className={`px-1.5 py-0.5 text-xs rounded ${statusColor}`}>
              {project.status}
            </span>
          </div>
          
          {project.description && (
            <p className="text-xs text-muted-foreground truncate mb-2">
              {project.description}
            </p>
          )}

          {/* Project Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{stats.progress}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{stats.milestonesActive}</span>
              <span>milestones</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{stats.ticketsOpen}</span>
              <span>tickets</span>
            </div>
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(project.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Star 
            className={`h-4 w-4 ${
              isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
