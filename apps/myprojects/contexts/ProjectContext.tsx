'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, getClientProjects } from '@allied-impact/projects';

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  setSelectedProject: (project: Project | null) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      const { getAuthInstance } = await import('@allied-impact/auth');
      const auth = getAuthInstance();
      
      if (auth.currentUser) {
        const userProjects = await getClientProjects(auth.currentUser.uid);
        setProjects(userProjects);
        
        // Auto-select first project if none selected
        if (!selectedProject && userProjects.length > 0) {
          // Check localStorage for last selected project
          const lastSelectedId = localStorage.getItem('lastSelectedProjectId');
          const lastProject = userProjects.find(p => p.id === lastSelectedId);
          setSelectedProject(lastProject || userProjects[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save selected project to localStorage
  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('lastSelectedProjectId', selectedProject.id);
    }
  }, [selectedProject]);

  const value = {
    projects,
    selectedProject,
    loading,
    setSelectedProject,
    refreshProjects: loadProjects,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
