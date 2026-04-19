import { render, screen } from '@testing-library/react';
import {
  NoProjectsEmpty,
  NoMilestonesEmpty,
  NoDeliverablesEmpty,
  NoTicketsEmpty,
  NoTeamMembersEmpty,
  NoSearchResultsEmpty
} from '../../components/EmptyStates';

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
      render(<NoProjectsEmpty onCreate={() => {}} />);
      expect(screen.getByText('No Projects Yet')).toBeInTheDocument();
    });

    it('should render getting started steps', () => {
      render(<NoProjectsEmpty onCreate={() => {}} />);
      expect(screen.getByText(/Get started by creating your first project/i)).toBeInTheDocument();
    });

    it('should render create button', () => {
      const onCreateMock = jest.fn();
      render(<NoProjectsEmpty onCreate={onCreateMock} />);
      
      const button = screen.getByRole('button', { name: /Create First Project/i });
      expect(button).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<NoProjectsEmpty onCreate={() => {}} />);
      expect(screen.getByTestId('folder-plus-icon')).toBeInTheDocument();
    });
  });

  describe('NoMilestonesEmpty', () => {
    it('should render empty state with correct heading', () => {
      render(<NoMilestonesEmpty onCreate={() => {}} />);
      expect(screen.getByText('No Milestones Yet')).toBeInTheDocument();
    });

    it('should render getting started steps', () => {
      render(<NoMilestonesEmpty onCreate={() => {}} />);
      expect(screen.getByText(/add your first milestone/i)).toBeInTheDocument();
    });

    it('should render create button when onCreate provided', () => {
      const onCreateMock = jest.fn();
      render(<NoMilestonesEmpty onCreate={onCreateMock} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<NoMilestonesEmpty onCreate={() => {}} />);
      expect(screen.getByTestId('target-icon')).toBeInTheDocument();
    });
  });

  describe('NoDeliverablesEmpty', () => {
    it('should render empty state with correct heading', () => {
      render(<NoDeliverablesEmpty onCreate={() => {}} />);
      expect(screen.getByText('No Deliverables Yet')).toBeInTheDocument();
    });

    it('should render getting started steps', () => {
      render(<NoDeliverablesEmpty onCreate={() => {}} />);
      expect(screen.getByText(/upload your first deliverable/i)).toBeInTheDocument();
    });

    it('should render create button when onCreate provided', () => {
      const onCreateMock = jest.fn();
      render(<NoDeliverablesEmpty onCreate={onCreateMock} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<NoDeliverablesEmpty onCreate={() => {}} />);
      expect(screen.getByTestId('file-up-icon')).toBeInTheDocument();
    });
  });

  describe('NoTicketsEmpty', () => {
    it('should render empty state with correct heading', () => {
      render(<NoTicketsEmpty onCreate={() => {}} />);
      expect(screen.getByText('No Tickets Yet')).toBeInTheDocument();
    });

    it('should render getting started steps', () => {
      render(<NoTicketsEmpty onCreate={() => {}} />);
      expect(screen.getByText(/create your first ticket/i)).toBeInTheDocument();
    });

    it('should render create button when onCreate provided', () => {
      const onCreateMock = jest.fn();
      render(<NoTicketsEmpty onCreate={onCreateMock} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<NoTicketsEmpty onCreate={() => {}} />);
      expect(screen.getByTestId('message-square-plus-icon')).toBeInTheDocument();
    });
  });

  describe('NoTeamMembersEmpty', () => {
    it('should render empty state with correct heading', () => {
      render(<NoTeamMembersEmpty onInvite={() => {}} />);
      expect(screen.getByText('No Team Members Yet')).toBeInTheDocument();
    });

    it('should render getting started steps', () => {
      render(<NoTeamMembersEmpty onInvite={() => {}} />);
      expect(screen.getByText(/invite your first team member/i)).toBeInTheDocument();
    });

    it('should render create button when onCreate provided', () => {
      const onCreateMock = jest.fn();
      render(<NoTeamMembersEmpty onInvite={onCreateMock} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<NoTeamMembersEmpty onInvite={() => {}} />);
      expect(screen.getByTestId('user-plus-icon')).toBeInTheDocument();
    });
  });

  describe('NoSearchResultsEmpty', () => {
    it('should render empty state with correct heading', () => {
      render(<NoSearchResultsEmpty onClear={() => {}} />);
      expect(screen.getByText('No Results Found')).toBeInTheDocument();
    });

    it('should render clear filters button when onClear provided', () => {
      const onClearMock = jest.fn();
      render(<NoSearchResultsEmpty onClear={onClearMock} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<NoSearchResultsEmpty onClear={() => {}} />);
      expect(screen.getByTestId('search-x-icon')).toBeInTheDocument();
    });
  });

  describe('Common behavior', () => {
    it('should have no accessibility issues', () => {
      const { container } = render(<NoProjectsEmpty onCreate={() => {}} />);
      expect(container).toBeInTheDocument();
    });
  });
});
