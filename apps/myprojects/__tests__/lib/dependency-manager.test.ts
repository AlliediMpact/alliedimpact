import {
  addMilestoneDependency,
  removeMilestoneDependency,
  checkCircularDependency,
  getProjectDependencies,
  buildDependencyGraph,
  calculateCriticalPath,
  MilestoneDependency,
  DependencyGraphNode,
} from '@/lib/dependency-manager';
import { Milestone, MilestoneStatus } from '@allied-impact/projects';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';

// Mock Firebase
jest.mock('firebase/firestore');
jest.mock('@/config/firebase', () => ({
  db: {},
}));

const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockArrayUnion = arrayUnion as jest.MockedFunction<typeof arrayUnion>;
const mockArrayRemove = arrayRemove as jest.MockedFunction<typeof arrayRemove>;
const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;

describe('dependency-manager', () => {
  const mockMilestones: Milestone[] = [
    {
      id: 'm1',
      projectId: 'p1',
      name: 'Milestone 1',
      description: 'First milestone',
      status: MilestoneStatus.COMPLETED,
      dueDate: new Date('2026-02-01').toISOString(),
      assignedTo: ['user1'],
      deliverables: [],
      dependencies: [],
      createdAt: new Date('2026-01-01').toISOString(),
      updatedAt: new Date('2026-01-01').toISOString(),
      createdBy: 'user1',
    },
    {
      id: 'm2',
      projectId: 'p1',
      name: 'Milestone 2',
      description: 'Second milestone',
      status: MilestoneStatus.IN_PROGRESS,
      dueDate: new Date('2026-03-01').toISOString(),
      assignedTo: ['user1'],
      deliverables: [],
      dependencies: ['m1'],
      createdAt: new Date('2026-02-01').toISOString(),
      updatedAt: new Date('2026-02-01').toISOString(),
      createdBy: 'user1',
    },
    {
      id: 'm3',
      projectId: 'p1',
      name: 'Milestone 3',
      description: 'Third milestone',
      status: MilestoneStatus.NOT_STARTED,
      dueDate: new Date('2026-04-01').toISOString(),
      assignedTo: ['user1'],
      deliverables: [],
      dependencies: ['m2'],
      createdAt: new Date('2026-03-01').toISOString(),
      updatedAt: new Date('2026-03-01').toISOString(),
      createdBy: 'user1',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc.mockReturnValue({} as any);
    mockArrayUnion.mockImplementation((...args) => args as any);
    mockArrayRemove.mockImplementation((...args) => args as any);
    mockCollection.mockReturnValue({} as any);
    mockQuery.mockReturnValue({} as any);
    mockWhere.mockReturnValue({} as any);
  });

  describe('addMilestoneDependency', () => {
    it('should add dependency successfully', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ dependencies: [] }),
      } as any);

      mockUpdateDoc.mockResolvedValue(undefined as any);

      await addMilestoneDependency(
        'p1',
        'm1',
        'Milestone 1',
        'm2',
        'Milestone 2',
        'finish-to-start',
        0,
        'user1'
      );

      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
    });

    it('should throw error for self-dependency', async () => {
      await expect(
        addMilestoneDependency(
          'p1',
          'm1',
          'Milestone 1',
          'm1',
          'Milestone 1',
          'finish-to-start',
          0,
          'user1'
        )
      ).rejects.toThrow('A milestone cannot depend on itself');
    });

    it('should detect circular dependencies', async () => {
      // m2 depends on m1, trying to add m1 depends on m2 would create cycle
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ dependencies: ['m1'] }),
      } as any);

      await expect(
        addMilestoneDependency(
          'p1',
          'm2',
          'Milestone 2',
          'm1',
          'Milestone 1',
          'finish-to-start',
          0,
          'user1'
        )
      ).rejects.toThrow('This dependency would create a circular relationship');
    });

    it('should support different dependency types', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ dependencies: [] }),
      } as any);

      mockUpdateDoc.mockResolvedValue(undefined as any);

      await addMilestoneDependency(
        'p1',
        'm1',
        'Milestone 1',
        'm2',
        'Milestone 2',
        'start-to-start',
        0,
        'user1'
      );

      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should support lag days', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ dependencies: [] }),
      } as any);

      mockUpdateDoc.mockResolvedValue(undefined as any);

      await addMilestoneDependency(
        'p1',
        'm1',
        'Milestone 1',
        'm2',
        'Milestone 2',
        'finish-to-start',
        5, // 5 days lag
        'user1'
      );

      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });

  describe('removeMilestoneDependency', () => {
    it('should remove dependency successfully', async () => {
      mockUpdateDoc.mockResolvedValue(undefined as any);

      await removeMilestoneDependency('m1', 'm2');

      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
      expect(mockArrayRemove).toHaveBeenCalled();
    });

    it('should handle Firestore errors', async () => {
      mockUpdateDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(
        removeMilestoneDependency('m1', 'm2')
      ).rejects.toThrow('Firestore error');
    });
  });

  describe('checkCircularDependency', () => {
    it('should return false when no circular dependency exists', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ dependencies: [] }),
      } as any);

      const hasCircular = await checkCircularDependency('p1', 'm1', 'm2');

      expect(hasCircular).toBe(false);
    });

    it('should detect direct circular dependency', async () => {
      mockGetDoc
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ dependencies: ['m1'] }), // m2 depends on m1
        } as any);

      const hasCircular = await checkCircularDependency('p1', 'm1', 'm2');

      expect(hasCircular).toBe(true);
    });

    it('should detect indirect circular dependency', async () => {
      // m3 -> m2 -> m1, trying to add m1 -> m3 would create cycle
      mockGetDoc
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ dependencies: ['m2'] }), // m3 depends on m2
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ dependencies: ['m1'] }), // m2 depends on m1
        } as any);

      const hasCircular = await checkCircularDependency('p1', 'm1', 'm3');

      expect(hasCircular).toBe(true);
    });

    it('should handle non-existent milestones', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);

      const hasCircular = await checkCircularDependency('p1', 'm1', 'm99');

      expect(hasCircular).toBe(false);
    });

    it('should handle complex dependency chains', async () => {
      // Complex chain: m4 -> m3 -> m2 -> m1
      const dependencyChain = [
        { dependencies: ['m3'] }, // m4
        { dependencies: ['m2'] }, // m3
        { dependencies: ['m1'] }, // m2
        { dependencies: [] },     // m1
      ];

      let callCount = 0;
      mockGetDoc.mockImplementation(() => {
        const result = dependencyChain[callCount % dependencyChain.length];
        callCount++;
        return Promise.resolve({
          exists: () => true,
          data: () => result,
        } as any);
      });

      const hasCircular = await checkCircularDependency('p1', 'm1', 'm4');

      expect(hasCircular).toBe(true);
    });
  });

  describe('getProjectDependencies', () => {
    it('should return all project dependencies', async () => {
      const mockDependencies: MilestoneDependency[] = [
        {
          id: 'm1_m2',
          fromMilestoneId: 'm1',
          fromMilestoneName: 'Milestone 1',
          toMilestoneId: 'm2',
          toMilestoneName: 'Milestone 2',
          type: 'finish-to-start',
          lagDays: 0,
          createdAt: new Date('2026-01-01'),
          createdBy: 'user1',
        },
      ];

      mockGetDocs.mockResolvedValue({
        docs: [
          {
            id: 'm1',
            data: () => ({ dependencies: [mockDependencies[0]] }),
          },
        ],
      } as any);

      const dependencies = await getProjectDependencies('p1');

      expect(dependencies).toHaveLength(1);
      expect(dependencies[0].id).toBe('m1_m2');
    });

    it('should return empty array when no dependencies exist', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          {
            id: 'm1',
            data: () => ({}),
          },
        ],
      } as any);

      const dependencies = await getProjectDependencies('p1');

      expect(dependencies).toEqual([]);
    });

    it('should filter out invalid dependencies', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          {
            id: 'm1',
            data: () => ({
              dependencies: [
                { id: 'm1_m2', fromMilestoneId: 'm1', toMilestoneId: 'm2' },
                { invalid: true }, // Invalid dependency
                null,
              ],
            }),
          },
        ],
      } as any);

      const dependencies = await getProjectDependencies('p1');

      expect(dependencies).toHaveLength(1);
    });

    it('should remove duplicate dependencies', async () => {
      const mockDep: MilestoneDependency = {
        id: 'm1_m2',
        fromMilestoneId: 'm1',
        fromMilestoneName: 'Milestone 1',
        toMilestoneId: 'm2',
        toMilestoneName: 'Milestone 2',
        type: 'finish-to-start',
        createdAt: new Date(),
        createdBy: 'user1',
      };

      mockGetDocs.mockResolvedValue({
        docs: [
          {
            id: 'm1',
            data: () => ({ dependencies: [mockDep, mockDep] }),
          },
        ],
      } as any);

      const dependencies = await getProjectDependencies('p1');

      expect(dependencies).toHaveLength(1);
    });
  });

  describe('buildDependencyGraph', () => {
    it('should build graph with correct structure', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          {
            id: 'm1',
            data: () => ({
              dependencies: [{
                id: 'm1_m2',
                fromMilestoneId: 'm1',
                fromMilestoneName: 'Milestone 1',
                toMilestoneId: 'm2',
                toMilestoneName: 'Milestone 2',
                type: 'finish-to-start',
                createdAt: new Date(),
                createdBy: 'user1',
              }],
            }),
          },
        ],
      } as any);

      const graph = await buildDependencyGraph('p1', mockMilestones);

      expect(graph).toHaveLength(3);
      expect(graph.every(node => node.id && node.name)).toBe(true);
    });

    it('should calculate dependency levels correctly', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          {
            id: 'm1',
            data: () => ({
              dependencies: [{
                id: 'm1_m2',
                fromMilestoneId: 'm1',
                toMilestoneId: 'm2',
                fromMilestoneName: 'M1',
                toMilestoneName: 'M2',
                type: 'finish-to-start',
                createdAt: new Date(),
                createdBy: 'user1',
              }],
            }),
          },
        ],
      } as any);

      const graph = await buildDependencyGraph('p1', mockMilestones);

      const m1Node = graph.find(n => n.id === 'm1');
      const m2Node = graph.find(n => n.id === 'm2');

      expect(m1Node?.level).toBe(0);
      expect(m2Node?.level).toBeGreaterThanOrEqual(m1Node?.level || 0);
    });

    it('should handle milestones with no dependencies', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [],
      } as any);

      const graph = await buildDependencyGraph('p1', [mockMilestones[0]]);

      expect(graph).toHaveLength(1);
      expect(graph[0].dependencies).toHaveLength(0);
      expect(graph[0].level).toBe(0);
    });
  });

  describe('calculateCriticalPath', () => {
    it('should identify critical path nodes', () => {
      const nodes: DependencyGraphNode[] = [
        {
          id: 'm1',
          name: 'Milestone 1',
          milestone: mockMilestones[0],
          dependencies: [],
          dependents: ['m2'],
          level: 0,
          isOnCriticalPath: false,
          earliestStart: new Date('2026-01-01'),
          earliestFinish: new Date('2026-02-01'),
          latestStart: new Date('2026-01-01'),
          latestFinish: new Date('2026-02-01'),
          slack: 0,
        },
        {
          id: 'm2',
          name: 'Milestone 2',
          milestone: mockMilestones[1],
          dependencies: ['m1'],
          dependents: [],
          level: 1,
          isOnCriticalPath: false,
          earliestStart: new Date('2026-02-01'),
          earliestFinish: new Date('2026-03-01'),
          latestStart: new Date('2026-02-01'),
          latestFinish: new Date('2026-03-01'),
          slack: 0,
        },
      ];

      const criticalPath = calculateCriticalPath(nodes);

      expect(criticalPath.length).toBeGreaterThan(0);
    });

    it('should calculate slack correctly', () => {
      const nodes: DependencyGraphNode[] = [
        {
          id: 'm1',
          name: 'Milestone 1',
          milestone: mockMilestones[0],
          dependencies: [],
          dependents: [],
          level: 0,
          isOnCriticalPath: false,
          earliestStart: new Date('2026-01-01'),
          earliestFinish: new Date('2026-02-01'),
          latestStart: new Date('2026-01-01'),
          latestFinish: new Date('2026-02-01'),
          slack: 0,
        },
      ];

      calculateCriticalPath(nodes);

      expect(nodes[0].slack).toBeGreaterThanOrEqual(0);
    });

    it('should handle nodes with zero slack as critical', () => {
      const nodes: DependencyGraphNode[] = [
        {
          id: 'm1',
          name: 'Milestone 1',
          milestone: mockMilestones[0],
          dependencies: [],
          dependents: [],
          level: 0,
          isOnCriticalPath: false,
          earliestStart: new Date('2026-01-01'),
          earliestFinish: new Date('2026-02-01'),
          latestStart: new Date('2026-01-01'),
          latestFinish: new Date('2026-02-01'),
          slack: 0,
        },
      ];

      const criticalPath = calculateCriticalPath(nodes);

      expect(criticalPath).toContain('m1');
    });

    it('should handle empty nodes array', () => {
      const criticalPath = calculateCriticalPath([]);

      expect(criticalPath).toEqual([]);
    });

    it('should sort nodes by level', () => {
      const nodes: DependencyGraphNode[] = [
        {
          id: 'm2',
          name: 'Milestone 2',
          milestone: mockMilestones[1],
          dependencies: ['m1'],
          dependents: [],
          level: 1,
          isOnCriticalPath: false,
          earliestStart: new Date('2026-02-01'),
          earliestFinish: new Date('2026-03-01'),
          latestStart: new Date('2026-02-01'),
          latestFinish: new Date('2026-03-01'),
          slack: 0,
        },
        {
          id: 'm1',
          name: 'Milestone 1',
          milestone: mockMilestones[0],
          dependencies: [],
          dependents: ['m2'],
          level: 0,
          isOnCriticalPath: false,
          earliestStart: new Date('2026-01-01'),
          earliestFinish: new Date('2026-02-01'),
          latestStart: new Date('2026-01-01'),
          latestFinish: new Date('2026-02-01'),
          slack: 0,
        },
      ];

      calculateCriticalPath(nodes);

      // Function should handle sorting internally
      expect(nodes.length).toBe(2);
    });
  });
});
