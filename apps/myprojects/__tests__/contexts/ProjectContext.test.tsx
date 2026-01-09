import React from 'react';
import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProjectProvider, useProject } from '@/contexts/ProjectContext';
import { Project } from '@allied-impact/projects';

// Mock @allied-impact/projects
const mockGetClientProjects = jest.fn();
jest.mock('@allied-impact/projects', () => ({
  getClientProjects: (...args: any[]) => mockGetClientProjects(...args),
}));

// Mock @allied-impact/auth
const mockAuth = {
  currentUser: { uid: 'user123', email: 'test@example.com' }
};

jest.mock('@allied-impact/auth', () => ({
  getAuthInstance: jest.fn(() => mockAuth),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ProjectContext', () => {
  const mockProjects: Project[] = [
    {
      id: 'p1',
      name: 'Project 1',
      description: 'First project',
      clientId: 'client1',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user123',
    },
    {
      id: 'p2',
      name: 'Project 2',
      description: 'Second project',
      clientId: 'client1',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user123',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockGetClientProjects.mockResolvedValue(mockProjects);
  });

  describe('ProjectProvider', () => {
    it('should render children', () => {
      render(
        <ProjectProvider>
          <div>Test Child</div>
        </ProjectProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should load projects on mount', async () => {
      renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      await waitFor(() => {
        expect(mockGetClientProjects).toHaveBeenCalledWith('user123');
      });
    });

    it('should set loading to true initially', () => {
      const { result } = renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      expect(result.current.loading).toBe(true);
    });

    it('should set loading to false after loading', async () => {
      const { result } = renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should populate projects array', async () => {
      const { result } = renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      await waitFor(() => {
        expect(result.current.projects).toHaveLength(2);
        expect(result.current.projects[0].id).toBe('p1');
        expect(result.current.projects[1].id).toBe('p2');
      });
    });

    it('should auto-select first project when none selected', async () => {
      const { result } = renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      await waitFor(() => {
        expect(result.current.selectedProject).not.toBeNull();
        expect(result.current.selectedProject?.id).toBe('p1');
      });
    });

    it('should restore last selected project from localStorage', async () => {
      localStorageMock.setItem('lastSelectedProjectId', 'p2');

      const { result } = renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      await waitFor(() => {
        expect(result.current.selectedProject?.id).toBe('p2');
      });
    });

    it('should handle loading errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockGetClientProjects.mockRejectedValue(new Error('Failed to load'));

      const { result } = renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(consoleError).toHaveBeenCalledWith(
          'Failed to load projects:',
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });

    it('should not load projects when user not authenticated', async () => {
      mockAuth.currentUser = null as any;

      renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      await waitFor(() => {
        expect(mockGetClientProjects).not.toHaveBeenCalled();
      });

      mockAuth.currentUser = { uid: 'user123', email: 'test@example.com' } as any;
    });
  });

  describe('useProject hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useProject());
      }).toThrow('useProject must be used within a ProjectProvider');

      consoleError.mockRestore();
    });

    it('should return context value', async () => {
      const { result } = renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      await waitFor(() => {
        expect(result.current).toHaveProperty('projects');
        expect(result.current).toHaveProperty('selectedProject');
        expect(result.current).toHaveProperty('loading');
        expect(result.current).toHaveProperty('setSelectedProject');
        expect(result.current).toHaveProperty('refreshProjects');
      });
    });
  });

  describe('setSelectedProject', () => {
    it('should update selected project', async () => {
      const { result } = renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSelectedProject(mockProjects[1]);
      });

      expect(result.current.selectedProject?.id).toBe('p2');
    });

    it('should save selected project to localStorage', async () => {
      const { result } = renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSelectedProject(mockProjects[1]);
      });

      await waitFor(() => {
        expect(localStorageMock.getItem('lastSelectedProjectId')).toBe('p2');
      });
    });

    it('should allow setting project to null', async () => {
      const { result } = renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSelectedProject(null);
      });

      expect(result.current.selectedProject).toBeNull();
    });
  });

  describe('refreshProjects', () => {
    it('should reload projects', async () => {
      const { result } = renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      mockGetClientProjects.mockClear();
      mockGetClientProjects.mockResolvedValue([
        ...mockProjects,
        {
          id: 'p3',
          name: 'Project 3',
          description: 'Third project',
          clientId: 'client1',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user123',
        },
      ]);

      await act(async () => {
        await result.current.refreshProjects();
      });

      expect(mockGetClientProjects).toHaveBeenCalled();
      expect(result.current.projects).toHaveLength(3);
    });

    it('should handle refresh errors', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      mockGetClientProjects.mockRejectedValue(new Error('Refresh failed'));

      await act(async () => {
        await result.current.refreshProjects();
      });

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('should maintain selected project after refresh', async () => {
      const { result } = renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSelectedProject(mockProjects[1]);
      });

      const selectedId = result.current.selectedProject?.id;

      await act(async () => {
        await result.current.refreshProjects();
      });

      // Selected project should be preserved from localStorage
      await waitFor(() => {
        expect(result.current.selectedProject?.id).toBe(selectedId);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty projects array', async () => {
      mockGetClientProjects.mockResolvedValue([]);

      const { result } = renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      await waitFor(() => {
        expect(result.current.projects).toHaveLength(0);
        expect(result.current.selectedProject).toBeNull();
      });
    });

    it('should handle invalid lastSelectedProjectId in localStorage', async () => {
      localStorageMock.setItem('lastSelectedProjectId', 'invalid-id');

      const { result } = renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      await waitFor(() => {
        // Should fall back to first project
        expect(result.current.selectedProject?.id).toBe('p1');
      });
    });

    it('should not throw when localStorage is unavailable', async () => {
      const originalLocalStorage = window.localStorage;
      delete (window as any).localStorage;

      const { result } = renderHook(() => useProject(), {
        wrapper: ProjectProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      (window as any).localStorage = originalLocalStorage;
    });
  });
});
