import { render, screen } from '@testing-library/react';
import { EmptyStates } from '../../components/EmptyStates';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  FolderPlus: () => <div data-testid="folder-plus-icon" />,
  Target: () => <div data-testid="target-icon" />,
  FileUp: () => <div data-testid="file-up-icon" />,
  MessageSquarePlus: () => <div data-testid="message-square-plus-icon" />,
  UserPlus: () => <div data-testid="user-plus-icon" />,
  SearchX: () => <div data-testid="search-x-icon" />,
}));

describe('EmptyStates', () => {
  describe('NoProjectsEmpty', () => {
    it('should render empty state with correct heading', () => {
      render(<EmptyStates.NoProjectsEmpty />);
      expect(screen.getByText('No projects yet')).toBeInTheDocument();
    });

    it('should render getting started steps', () => {
      render(<EmptyStates.NoProjectsEmpty />);
      expect(screen.getByText(/create your first project/i)).toBeInTheDocument();
    });

    it('should render create button', () => {
      const onCreateMock = jest.fn();
      render(<EmptyStates.NoProjectsEmpty onCreate={onCreateMock} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<EmptyStates.NoProjectsEmpty />);
      expect(screen.getByTestId('folder-plus-icon')).toBeInTheDocument();
    });
  });

  describe('NoMilestonesEmpty', () => {
    it('should render empty state with correct heading', () => {
      render(<EmptyStates.NoMilestonesEmpty />);
      expect(screen.getByText('No milestones yet')).toBeInTheDocument();
    });

    it('should render getting started steps', () => {
      render(<EmptyStates.NoMilestonesEmpty />);
      expect(screen.getByText(/add your first milestone/i)).toBeInTheDocument();
    });

    it('should render create button when onCreate provided', () => {
      const onCreateMock = jest.fn();
      render(<EmptyStates.NoMilestonesEmpty onCreate={onCreateMock} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<EmptyStates.NoMilestonesEmpty />);
      expect(screen.getByTestId('target-icon')).toBeInTheDocument();
    });
  });

  describe('NoDeliverablesEmpty', () => {
    it('should render empty state with correct heading', () => {
      render(<EmptyStates.NoDeliverablesEmpty />);
      expect(screen.getByText('No deliverables yet')).toBeInTheDocument();
    });

    it('should render getting started steps', () => {
      render(<EmptyStates.NoDeliverablesEmpty />);
      expect(screen.getByText(/upload your first deliverable/i)).toBeInTheDocument();
    });

    it('should render create button when onCreate provided', () => {
      const onCreateMock = jest.fn();
      render(<EmptyStates.NoDeliverablesEmpty onCreate={onCreateMock} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<EmptyStates.NoDeliverablesEmpty />);
      expect(screen.getByTestId('file-up-icon')).toBeInTheDocument();
    });
  });

  describe('NoTicketsEmpty', () => {
    it('should render empty state with correct heading', () => {
      render(<EmptyStates.NoTicketsEmpty />);
      expect(screen.getByText('No tickets yet')).toBeInTheDocument();
    });

    it('should render getting started steps', () => {
      render(<EmptyStates.NoTicketsEmpty />);
      expect(screen.getByText(/create your first ticket/i)).toBeInTheDocument();
    });

    it('should render create button when onCreate provided', () => {
      const onCreateMock = jest.fn();
      render(<EmptyStates.NoTicketsEmpty onCreate={onCreateMock} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<EmptyStates.NoTicketsEmpty />);
      expect(screen.getByTestId('message-square-plus-icon')).toBeInTheDocument();
    });
  });

  describe('NoTeamMembersEmpty', () => {
    it('should render empty state with correct heading', () => {
      render(<EmptyStates.NoTeamMembersEmpty />);
      expect(screen.getByText('No team members yet')).toBeInTheDocument();
    });

    it('should render getting started steps', () => {
      render(<EmptyStates.NoTeamMembersEmpty />);
      expect(screen.getByText(/invite your first team member/i)).toBeInTheDocument();
    });

    it('should render create button when onCreate provided', () => {
      const onCreateMock = jest.fn();
      render(<EmptyStates.NoTeamMembersEmpty onCreate={onCreateMock} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<EmptyStates.NoTeamMembersEmpty />);
      expect(screen.getByTestId('user-plus-icon')).toBeInTheDocument();
    });
  });

  describe('NoSearchResultsEmpty', () => {
    it('should render empty state with correct heading', () => {
      render(<EmptyStates.NoSearchResultsEmpty />);
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('should render clear filters button when onClear provided', () => {
      const onClearMock = jest.fn();
      render(<EmptyStates.NoSearchResultsEmpty onClear={onClearMock} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<EmptyStates.NoSearchResultsEmpty />);
      expect(screen.getByTestId('search-x-icon')).toBeInTheDocument();
    });
  });

  describe('Common behavior', () => {
    it('should not render button when onCreate/onClear not provided', () => {
      const { container } = render(<EmptyStates.NoProjectsEmpty />);
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(0);
    });
  });
});
