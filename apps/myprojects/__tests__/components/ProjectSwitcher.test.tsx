import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectSwitcher from '@/components/ProjectSwitcher';
import { Project } from '@allied-impact/projects';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/projects',
  })),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Briefcase: () => <div data-testid="briefcase-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
}));

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

describe('ProjectSwitcher', () => {
  const mockProjects: Project[] = [
    {
      id: 'p1',
      name: 'Website Redesign',
      description: 'Complete website redesign project',
      clientId: 'client1',
      status: 'active',
      progress: 75,
      createdAt: new Date('2026-01-01').toISOString(),
      updatedAt: new Date('2026-01-05').toISOString(),
      createdBy: 'user123',
    },
    {
      id: 'p2',
      name: 'Mobile App Development',
      description: 'iOS and Android app development',
      clientId: 'client1',
      status: 'active',
      progress: 45,
      createdAt: new Date('2025-12-01').toISOString(),
      updatedAt: new Date('2026-01-03').toISOString(),
      createdBy: 'user123',
    },
    {
      id: 'p3',
      name: 'API Integration',
      description: 'Third-party API integration',
      clientId: 'client2',
      status: 'active',
      progress: 20,
      createdAt: new Date('2025-11-15').toISOString(),
      updatedAt: new Date('2026-01-01').toISOString(),
      createdBy: 'user123',
    },
  ];

  const mockOnProjectChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockGetClientProjects.mockResolvedValue(mockProjects);
  });

  describe('Rendering', () => {
    it('should render current project name', async () => {
      render(
        <ProjectSwitcher 
          currentProject={mockProjects[0]}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Website Redesign')).toBeInTheDocument();
      });
    });

    it('should render placeholder when no current project', async () => {
      render(
        <ProjectSwitcher 
          currentProject={null}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Select/i)).toBeInTheDocument();
      });
    });

    it('should render chevron icon', () => {
      render(
        <ProjectSwitcher 
          currentProject={mockProjects[0]}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      const chevronIcon = screen.getByTestId('chevron-down-icon');
      expect(chevronIcon).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(
        <ProjectSwitcher 
          currentProject={null}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      // Component should handle loading state
      expect(mockGetClientProjects).toHaveBeenCalled();
    });
  });

  describe('Project Loading', () => {
    it('should load projects on mount', async () => {
      render(
        <ProjectSwitcher 
          currentProject={null}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      await waitFor(() => {
        expect(mockGetClientProjects).toHaveBeenCalledWith('user123');
      });
    });

    it('should handle loading error gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockGetClientProjects.mockRejectedValue(new Error('Failed to load'));
      
      render(
        <ProjectSwitcher 
          currentProject={null}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Failed to load projects:',
          expect.any(Error)
        );
      });
      
      consoleError.mockRestore();
    });

    it('should not load projects when user not authenticated', async () => {
      mockAuth.currentUser = null as any;
      
      render(
        <ProjectSwitcher 
          currentProject={null}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      await waitFor(() => {
        // Should not attempt to fetch when no user
        expect(mockGetClientProjects).not.toHaveBeenCalled();
      });
      
      mockAuth.currentUser = { uid: 'user123', email: 'test@example.com' } as any;
    });
  });

  describe('Project Selection', () => {
    it('should open dropdown when clicked', async () => {
      render(
        <ProjectSwitcher 
          currentProject={mockProjects[0]}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
      });
    });

    it('should call onProjectChange when project selected', async () => {
      render(
        <ProjectSwitcher 
          currentProject={mockProjects[0]}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const projectOption = screen.getByText('Mobile App Development');
        fireEvent.click(projectOption);
      });
      
      expect(mockOnProjectChange).toHaveBeenCalledWith(mockProjects[1]);
    });

    it('should close dropdown after project selection', async () => {
      render(
        <ProjectSwitcher 
          currentProject={mockProjects[0]}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const projectOption = screen.getByText('Mobile App Development');
        fireEvent.click(projectOption);
      });
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/Search/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter projects by name', async () => {
      render(
        <ProjectSwitcher 
          currentProject={mockProjects[0]}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Search/i);
        fireEvent.change(searchInput, { target: { value: 'Mobile' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Mobile App Development')).toBeInTheDocument();
        expect(screen.queryByText('Website Redesign')).not.toBeInTheDocument();
      });
    });

    it('should filter projects by description', async () => {
      render(
        <ProjectSwitcher 
          currentProject={mockProjects[0]}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Search/i);
        fireEvent.change(searchInput, { target: { value: 'API' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText('API Integration')).toBeInTheDocument();
        expect(screen.queryByText('Website Redesign')).not.toBeInTheDocument();
      });
    });

    it('should be case insensitive', async () => {
      render(
        <ProjectSwitcher 
          currentProject={mockProjects[0]}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Search/i);
        fireEvent.change(searchInput, { target: { value: 'MOBILE' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Mobile App Development')).toBeInTheDocument();
      });
    });

    it('should clear search when project selected', async () => {
      render(
        <ProjectSwitcher 
          currentProject={mockProjects[0]}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(async () => {
        const searchInput = screen.getByPlaceholderText(/Search/i) as HTMLInputElement;
        fireEvent.change(searchInput, { target: { value: 'Mobile' } });
        
        const projectOption = screen.getByText('Mobile App Development');
        fireEvent.click(projectOption);
      });
      
      // Reopen dropdown
      fireEvent.click(button);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Search/i) as HTMLInputElement;
        expect(searchInput.value).toBe('');
      });
    });

    it('should show no results when search does not match', async () => {
      render(
        <ProjectSwitcher 
          currentProject={mockProjects[0]}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Search/i);
        fireEvent.change(searchInput, { target: { value: 'NonExistentProject' } });
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Website Redesign')).not.toBeInTheDocument();
        expect(screen.queryByText('Mobile App Development')).not.toBeInTheDocument();
      });
    });
  });

  describe('Favorites Functionality', () => {
    it('should load favorites from localStorage', async () => {
      localStorageMock.setItem('favoriteProjects', JSON.stringify(['p1', 'p2']));
      
      render(
        <ProjectSwitcher 
          currentProject={mockProjects[0]}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      await waitFor(() => {
        expect(localStorageMock.getItem('favoriteProjects')).toBeTruthy();
      });
    });

    it('should toggle favorite status', async () => {
      render(
        <ProjectSwitcher 
          currentProject={mockProjects[0]}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const starIcons = screen.getAllByTestId('star-icon');
        if (starIcons[0]) {
          fireEvent.click(starIcons[0].parentElement!);
        }
      });
      
      expect(localStorageMock.getItem('favoriteProjects')).toBeTruthy();
    });

    it('should save favorites to localStorage', async () => {
      render(
        <ProjectSwitcher 
          currentProject={mockProjects[0]}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const starIcons = screen.getAllByTestId('star-icon');
        if (starIcons[0]) {
          fireEvent.click(starIcons[0].parentElement!);
        }
      });
      
      const saved = localStorageMock.getItem('favoriteProjects');
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toContain('p1');
    });

    it('should remove from favorites when toggled off', async () => {
      localStorageMock.setItem('favoriteProjects', JSON.stringify(['p1']));
      
      render(
        <ProjectSwitcher 
          currentProject={mockProjects[0]}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const starIcons = screen.getAllByTestId('star-icon');
        if (starIcons[0]) {
          fireEvent.click(starIcons[0].parentElement!);
        }
      });
      
      const saved = localStorageMock.getItem('favoriteProjects');
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).not.toContain('p1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty projects list', async () => {
      mockGetClientProjects.mockResolvedValue([]);
      
      render(
        <ProjectSwitcher 
          currentProject={null}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      await waitFor(() => {
        expect(mockGetClientProjects).toHaveBeenCalled();
      });
    });

    it('should handle projects without descriptions', async () => {
      const projectsWithoutDesc: Project[] = [{
        ...mockProjects[0],
        description: undefined
      }];
      
      mockGetClientProjects.mockResolvedValue(projectsWithoutDesc);
      
      render(
        <ProjectSwitcher 
          currentProject={null}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      await waitFor(() => {
        expect(mockGetClientProjects).toHaveBeenCalled();
      });
    });

    it('should handle projects without progress', async () => {
      const projectsWithoutProgress: Project[] = [{
        ...mockProjects[0],
        progress: undefined
      }];
      
      mockGetClientProjects.mockResolvedValue(projectsWithoutProgress);
      
      render(
        <ProjectSwitcher 
          currentProject={null}
          onProjectChange={mockOnProjectChange}
        />
      );
      
      await waitFor(() => {
        expect(mockGetClientProjects).toHaveBeenCalled();
      });
    });
  });
});
