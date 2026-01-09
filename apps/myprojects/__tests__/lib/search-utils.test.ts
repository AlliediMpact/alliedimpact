import {
  searchMilestones,
  searchDeliverables,
  searchTickets,
  SearchFilters,
  SearchResult,
} from '@/lib/search-utils';
import { Milestone, Deliverable, Ticket, MilestoneStatus, DeliverableStatus, TicketStatus } from '@allied-impact/projects';

describe('search-utils', () => {
  // Mock data
  const mockMilestones: Milestone[] = [
    {
      id: '1',
      projectId: 'p1',
      name: 'Design Phase Complete',
      description: 'Complete all design mockups and wireframes',
      status: MilestoneStatus.IN_PROGRESS,
      dueDate: new Date('2026-02-01').toISOString(),
      assignedTo: ['user1', 'user2'],
      deliverables: [],
      dependencies: [],
      createdAt: new Date('2026-01-01').toISOString(),
      updatedAt: new Date('2026-01-01').toISOString(),
      createdBy: 'user1',
    },
    {
      id: '2',
      projectId: 'p1',
      name: 'Development Sprint 1',
      description: 'First development sprint for core features',
      status: MilestoneStatus.NOT_STARTED,
      dueDate: new Date('2026-03-01').toISOString(),
      assignedTo: ['user3'],
      deliverables: [],
      dependencies: [],
      createdAt: new Date('2026-01-01').toISOString(),
      updatedAt: new Date('2026-01-01').toISOString(),
      createdBy: 'user1',
    },
    {
      id: '3',
      projectId: 'p1',
      name: 'QA Testing',
      description: 'Quality assurance and testing phase',
      status: MilestoneStatus.COMPLETED,
      dueDate: new Date('2025-12-15').toISOString(),
      assignedTo: ['user1'],
      deliverables: [],
      dependencies: [],
      createdAt: new Date('2025-12-01').toISOString(),
      updatedAt: new Date('2025-12-15').toISOString(),
      createdBy: 'user1',
    },
  ];

  const mockDeliverables: Deliverable[] = [
    {
      id: 'd1',
      projectId: 'p1',
      milestoneId: '1',
      name: 'Design Mockups',
      description: 'High-fidelity design mockups for all screens',
      type: 'design',
      status: DeliverableStatus.DELIVERED,
      dueDate: new Date('2026-01-20').toISOString(),
      assignedTo: 'user1',
      notes: 'Using Figma for all designs',
      fileUrls: [],
      createdAt: new Date('2026-01-01').toISOString(),
      updatedAt: new Date('2026-01-15').toISOString(),
      createdBy: 'user1',
    },
    {
      id: 'd2',
      projectId: 'p1',
      milestoneId: '1',
      name: 'Wireframes',
      description: 'Low-fidelity wireframes for initial review',
      type: 'design',
      status: DeliverableStatus.IN_REVIEW,
      dueDate: new Date('2026-01-15').toISOString(),
      assignedTo: 'user2',
      fileUrls: [],
      createdAt: new Date('2026-01-01').toISOString(),
      updatedAt: new Date('2026-01-10').toISOString(),
      createdBy: 'user2',
    },
    {
      id: 'd3',
      projectId: 'p1',
      milestoneId: '2',
      name: 'API Documentation',
      description: 'Comprehensive API documentation',
      type: 'documentation',
      status: DeliverableStatus.NOT_STARTED,
      dueDate: new Date('2026-02-20').toISOString(),
      assignedTo: 'user3',
      notes: 'Include code examples and authentication flows',
      fileUrls: [],
      createdAt: new Date('2026-01-01').toISOString(),
      updatedAt: new Date('2026-01-01').toISOString(),
      createdBy: 'user3',
    },
  ];

  const mockTickets: Ticket[] = [
    {
      id: 't1',
      projectId: 'p1',
      milestoneId: '1',
      title: 'Fix navigation bug',
      description: 'Navigation menu does not work on mobile devices',
      status: TicketStatus.OPEN,
      priority: 'high',
      category: 'bug',
      assignedTo: 'user1',
      createdBy: 'user2',
      createdAt: new Date('2026-01-05').toISOString(),
      updatedAt: new Date('2026-01-05').toISOString(),
      comments: [
        {
          id: 'c1',
          userId: 'user1',
          userName: 'User One',
          text: 'I can reproduce this on iOS Safari',
          timestamp: new Date('2026-01-05').toISOString(),
        },
      ],
    },
    {
      id: 't2',
      projectId: 'p1',
      milestoneId: '2',
      title: 'Add dark mode support',
      description: 'Implement dark mode theme across the application',
      status: TicketStatus.IN_PROGRESS,
      priority: 'medium',
      category: 'feature',
      assignedTo: 'user3',
      createdBy: 'user1',
      createdAt: new Date('2026-01-03').toISOString(),
      updatedAt: new Date('2026-01-04').toISOString(),
      comments: [],
    },
    {
      id: 't3',
      projectId: 'p1',
      milestoneId: '3',
      title: 'Update user documentation',
      description: 'Refresh user guide with latest screenshots',
      status: TicketStatus.RESOLVED,
      priority: 'low',
      category: 'documentation',
      assignedTo: 'user2',
      createdBy: 'user1',
      createdAt: new Date('2025-12-10').toISOString(),
      updatedAt: new Date('2025-12-14').toISOString(),
      comments: [],
    },
  ];

  describe('searchMilestones', () => {
    it('should return all milestones when no filters provided', () => {
      const results = searchMilestones(mockMilestones, {});
      expect(results).toHaveLength(3);
    });

    it('should filter by text query in name', () => {
      const filters: SearchFilters = { query: 'Design' };
      const results = searchMilestones(mockMilestones, filters);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toContain('Design');
      expect(results[0].score).toBeGreaterThan(0);
      expect(results[0].matches.some(m => m.field === 'name')).toBe(true);
    });

    it('should filter by text query in description', () => {
      const filters: SearchFilters = { query: 'mockups' };
      const results = searchMilestones(mockMilestones, filters);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.description).toContain('mockups');
      expect(results[0].matches.some(m => m.field === 'description')).toBe(true);
    });

    it('should return empty array when query does not match', () => {
      const filters: SearchFilters = { query: 'NonExistentTerm' };
      const results = searchMilestones(mockMilestones, filters);
      
      expect(results).toHaveLength(0);
    });

    it('should filter by status', () => {
      const filters: SearchFilters = { status: [MilestoneStatus.COMPLETED] };
      const results = searchMilestones(mockMilestones, filters);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.status).toBe(MilestoneStatus.COMPLETED);
    });

    it('should filter by multiple statuses', () => {
      const filters: SearchFilters = { 
        status: [MilestoneStatus.IN_PROGRESS, MilestoneStatus.NOT_STARTED] 
      };
      const results = searchMilestones(mockMilestones, filters);
      
      expect(results).toHaveLength(2);
    });

    it('should filter by assigned users', () => {
      const filters: SearchFilters = { assignedTo: ['user1'] };
      const results = searchMilestones(mockMilestones, filters);
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(r => {
        expect(r.item.assignedTo).toContain('user1');
      });
    });

    it('should filter by date range (from)', () => {
      const filters: SearchFilters = { dateFrom: new Date('2026-02-01') };
      const results = searchMilestones(mockMilestones, filters);
      
      results.forEach(r => {
        expect(new Date(r.item.dueDate).getTime()).toBeGreaterThanOrEqual(
          new Date('2026-02-01').getTime()
        );
      });
    });

    it('should filter by date range (to)', () => {
      const filters: SearchFilters = { dateTo: new Date('2026-02-01') };
      const results = searchMilestones(mockMilestones, filters);
      
      results.forEach(r => {
        expect(new Date(r.item.dueDate).getTime()).toBeLessThanOrEqual(
          new Date('2026-02-01').getTime()
        );
      });
    });

    it('should combine multiple filters', () => {
      const filters: SearchFilters = {
        query: 'Design',
        status: [MilestoneStatus.IN_PROGRESS],
        assignedTo: ['user1'],
      };
      const results = searchMilestones(mockMilestones, filters);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.name).toContain('Design');
      expect(results[0].item.status).toBe(MilestoneStatus.IN_PROGRESS);
      expect(results[0].item.assignedTo).toContain('user1');
    });

    it('should sort results by score (highest first)', () => {
      const filters: SearchFilters = { query: 'design' };
      const results = searchMilestones(mockMilestones, filters);
      
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
      }
    });

    it('should include highlighted text in matches', () => {
      const filters: SearchFilters = { query: 'Design' };
      const results = searchMilestones(mockMilestones, filters);
      
      if (results.length > 0 && results[0].matches.length > 0) {
        expect(results[0].matches[0].highlighted).toContain('<mark>');
        expect(results[0].matches[0].highlighted).toContain('</mark>');
      }
    });
  });

  describe('searchDeliverables', () => {
    it('should return all deliverables when no filters provided', () => {
      const results = searchDeliverables(mockDeliverables, {});
      expect(results).toHaveLength(3);
    });

    it('should filter by text query in name', () => {
      const filters: SearchFilters = { query: 'Mockups' };
      const results = searchDeliverables(mockDeliverables, filters);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toContain('Mockups');
      expect(results[0].score).toBeGreaterThan(0);
    });

    it('should filter by text query in description', () => {
      const filters: SearchFilters = { query: 'wireframes' };
      const results = searchDeliverables(mockDeliverables, filters);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.description.toLowerCase()).toContain('wireframes');
    });

    it('should filter by text query in notes', () => {
      const filters: SearchFilters = { query: 'Figma' };
      const results = searchDeliverables(mockDeliverables, filters);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.notes).toContain('Figma');
      expect(results[0].matches.some(m => m.field === 'notes')).toBe(true);
    });

    it('should filter by status', () => {
      const filters: SearchFilters = { status: [DeliverableStatus.DELIVERED] };
      const results = searchDeliverables(mockDeliverables, filters);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.status).toBe(DeliverableStatus.DELIVERED);
    });

    it('should filter by type', () => {
      const filters: SearchFilters = { type: ['design'] };
      const results = searchDeliverables(mockDeliverables, filters);
      
      expect(results).toHaveLength(2);
      results.forEach(r => {
        expect(r.item.type).toBe('design');
      });
    });

    it('should filter by multiple types', () => {
      const filters: SearchFilters = { type: ['design', 'documentation'] };
      const results = searchDeliverables(mockDeliverables, filters);
      
      expect(results).toHaveLength(3);
    });

    it('should filter by assigned user', () => {
      const filters: SearchFilters = { assignedTo: ['user1'] };
      const results = searchDeliverables(mockDeliverables, filters);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.assignedTo).toBe('user1');
    });

    it('should filter by date range', () => {
      const filters: SearchFilters = { 
        dateFrom: new Date('2026-01-15'),
        dateTo: new Date('2026-02-01')
      };
      const results = searchDeliverables(mockDeliverables, filters);
      
      results.forEach(r => {
        const dueDate = new Date(r.item.dueDate).getTime();
        expect(dueDate).toBeGreaterThanOrEqual(new Date('2026-01-15').getTime());
        expect(dueDate).toBeLessThanOrEqual(new Date('2026-02-01').getTime());
      });
    });

    it('should combine multiple filters', () => {
      const filters: SearchFilters = {
        query: 'design',
        type: ['design'],
        status: [DeliverableStatus.DELIVERED],
      };
      const results = searchDeliverables(mockDeliverables, filters);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.type).toBe('design');
      expect(results[0].item.status).toBe(DeliverableStatus.DELIVERED);
    });

    it('should sort results by score', () => {
      const filters: SearchFilters = { query: 'design' };
      const results = searchDeliverables(mockDeliverables, filters);
      
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
      }
    });
  });

  describe('searchTickets', () => {
    it('should return all tickets when no filters provided', () => {
      const results = searchTickets(mockTickets, {});
      expect(results).toHaveLength(3);
    });

    it('should filter by text query in title', () => {
      const filters: SearchFilters = { query: 'navigation' };
      const results = searchTickets(mockTickets, filters);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.title.toLowerCase()).toContain('navigation');
      expect(results[0].score).toBeGreaterThan(0);
    });

    it('should filter by text query in description', () => {
      const filters: SearchFilters = { query: 'mobile' };
      const results = searchTickets(mockTickets, filters);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.description.toLowerCase()).toContain('mobile');
    });

    it('should search in comments', () => {
      const filters: SearchFilters = { query: 'Safari' };
      const results = searchTickets(mockTickets, filters);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.comments?.some(c => c.text.includes('Safari'))).toBe(true);
      expect(results[0].matches.some(m => m.field.startsWith('comment_'))).toBe(true);
    });

    it('should filter by status', () => {
      const filters: SearchFilters = { status: [TicketStatus.OPEN] };
      const results = searchTickets(mockTickets, filters);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.status).toBe(TicketStatus.OPEN);
    });

    it('should filter by priority', () => {
      const filters: SearchFilters = { priority: ['high'] };
      const results = searchTickets(mockTickets, filters);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.priority).toBe('high');
    });

    it('should filter by multiple priorities', () => {
      const filters: SearchFilters = { priority: ['high', 'medium'] };
      const results = searchTickets(mockTickets, filters);
      
      expect(results).toHaveLength(2);
    });

    it('should filter by category', () => {
      const filters: SearchFilters = { category: ['bug'] };
      const results = searchTickets(mockTickets, filters);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.category).toBe('bug');
    });

    it('should filter by assigned user', () => {
      const filters: SearchFilters = { assignedTo: ['user1'] };
      const results = searchTickets(mockTickets, filters);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.assignedTo).toBe('user1');
    });

    it('should filter by date range', () => {
      const filters: SearchFilters = { 
        dateFrom: new Date('2026-01-01'),
      };
      const results = searchTickets(mockTickets, filters);
      
      results.forEach(r => {
        expect(new Date(r.item.createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date('2026-01-01').getTime()
        );
      });
    });

    it('should combine multiple filters', () => {
      const filters: SearchFilters = {
        query: 'bug',
        status: [TicketStatus.OPEN],
        priority: ['high'],
        category: ['bug'],
      };
      const results = searchTickets(mockTickets, filters);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.status).toBe(TicketStatus.OPEN);
      expect(results[0].item.priority).toBe('high');
      expect(results[0].item.category).toBe('bug');
    });

    it('should sort results by score', () => {
      const filters: SearchFilters = { query: 'documentation' };
      const results = searchTickets(mockTickets, filters);
      
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
      }
    });

    it('should return empty array when no matches found', () => {
      const filters: SearchFilters = { 
        query: 'NonExistentTerm',
        status: [TicketStatus.OPEN],
        priority: ['critical'],
      };
      const results = searchTickets(mockTickets, filters);
      
      expect(results).toHaveLength(0);
    });
  });
});
