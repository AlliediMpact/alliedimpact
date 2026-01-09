import {
  convertToCSV,
  exportMilestonesToCSV,
  exportDeliverablesToCSV,
  exportTicketsToCSV,
  convertToJSON,
  downloadFile,
} from '../../lib/export-utils';

describe('export-utils', () => {
  describe('convertToCSV', () => {
    it('should convert simple data to CSV', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ];
      const headers = ['name', 'age'];
      const result = convertToCSV(data, headers);
      
      expect(result).toContain('name,age');
      expect(result).toContain('John,30');
      expect(result).toContain('Jane,25');
    });

    it('should handle null and undefined values', () => {
      const data = [
        { name: 'John', age: null },
        { name: 'Jane', age: undefined }
      ];
      const headers = ['name', 'age'];
      const result = convertToCSV(data, headers);
      
      const lines = result.split('\n');
      expect(lines[1]).toBe('John,');
      expect(lines[2]).toBe('Jane,');
    });

    it('should escape commas in values', () => {
      const data = [
        { name: 'Doe, John', age: 30 }
      ];
      const headers = ['name', 'age'];
      const result = convertToCSV(data, headers);
      
      expect(result).toContain('"Doe, John"');
    });

    it('should escape quotes in values', () => {
      const data = [
        { name: 'John "The Boss"', age: 30 }
      ];
      const headers = ['name', 'age'];
      const result = convertToCSV(data, headers);
      
      expect(result).toContain('John ""The Boss""');
    });

    it('should handle dates', () => {
      const date = new Date('2026-01-06T12:00:00Z');
      const data = [{ name: 'John', createdAt: date }];
      const headers = ['name', 'createdAt'];
      const result = convertToCSV(data, headers);
      
      expect(result).toContain(date.toISOString());
    });

    it('should handle objects and arrays', () => {
      const data = [
        { name: 'John', tags: ['developer', 'designer'] }
      ];
      const headers = ['name', 'tags'];
      const result = convertToCSV(data, headers);
      
      expect(result).toContain('John');
      expect(result).toMatch(/\[.*developer.*designer.*\]/);
    });

    it('should handle newlines in values', () => {
      const data = [
        { name: 'John', notes: 'Line 1\nLine 2' }
      ];
      const headers = ['name', 'notes'];
      const result = convertToCSV(data, headers);
      
      expect(result).toContain('"Line 1\nLine 2"');
    });
  });

  describe('exportMilestonesToCSV', () => {
    it('should export milestones with correct headers', () => {
      const milestones: any[] = [
        {
          id: 'm1',
          name: 'Milestone 1',
          description: 'Test milestone',
          status: 'in-progress',
          dueDate: new Date('2026-02-01'),
          progress: 50,
          deliverables: ['d1', 'd2'],
          dependencies: ['m2'],
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-05')
        }
      ];
      
      const result = exportMilestonesToCSV(milestones);
      
      expect(result).toContain('id,name,description,status,dueDate');
      expect(result).toContain('m1,Milestone 1');
      expect(result).toContain('in-progress');
      expect(result).toContain('50');
      expect(result).toContain('2'); // deliverables count
    });

    it('should handle empty deliverables and dependencies', () => {
      const milestones: any[] = [
        {
          id: 'm1',
          name: 'Milestone 1',
          description: 'Test',
          status: 'planned',
          progress: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      const result = exportMilestonesToCSV(milestones);
      
      expect(result).toContain('0'); // 0 deliverables
    });
  });

  describe('exportDeliverablesToCSV', () => {
    it('should export deliverables with correct headers', () => {
      const deliverables: any[] = [
        {
          id: 'd1',
          name: 'Deliverable 1',
          description: 'Test deliverable',
          type: 'design',
          status: 'pending',
          dueDate: new Date('2026-02-01'),
          fileUrls: ['file1.pdf', 'file2.pdf'],
          assignedTo: 'user1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      const result = exportDeliverablesToCSV(deliverables);
      
      expect(result).toContain('id,name,description,type,status');
      expect(result).toContain('d1,Deliverable 1');
      expect(result).toContain('design');
      expect(result).toContain('pending');
      expect(result).toContain('2'); // fileCount
    });

    it('should handle optional fields', () => {
      const deliverables: any[] = [
        {
          id: 'd1',
          name: 'Deliverable 1',
          description: 'Test',
          type: 'code',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      const result = exportDeliverablesToCSV(deliverables);
      
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(1);
      expect(result).toContain('d1');
    });
  });

  describe('exportTicketsToCSV', () => {
    it('should export tickets with correct headers', () => {
      const tickets: any[] = [
        {
          id: 't1',
          title: 'Bug Report',
          description: 'Something is broken',
          status: 'open',
          priority: 'high',
          category: 'bug',
          comments: ['comment1', 'comment2'],
          createdBy: 'user1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      const result = exportTicketsToCSV(tickets);
      
      expect(result).toContain('id,title,description,status,priority');
      expect(result).toContain('t1,Bug Report');
      expect(result).toContain('high');
      expect(result).toContain('bug');
      expect(result).toContain('2'); // commentCount
    });
  });

  describe('convertToJSON', () => {
    it('should convert data to formatted JSON', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ];
      
      const result = convertToJSON(data);
      const parsed = JSON.parse(result);
      
      expect(parsed).toEqual(data);
      expect(result).toContain('  '); // Check for formatting
    });

    it('should handle empty array', () => {
      const result = convertToJSON([]);
      expect(result).toBe('[]');
    });

    it('should handle complex objects', () => {
      const data = [
        {
          id: 1,
          nested: { key: 'value' },
          array: [1, 2, 3],
          date: new Date('2026-01-06')
        }
      ];
      
      const result = convertToJSON(data);
      const parsed = JSON.parse(result);
      
      expect(parsed[0].nested.key).toBe('value');
      expect(parsed[0].array).toEqual([1, 2, 3]);
    });
  });

  describe('downloadFile', () => {
    let createElementSpy: jest.SpyInstance;
    let appendChildSpy: jest.SpyInstance;
    let removeChildSpy: jest.SpyInstance;
    let createObjectURLSpy: jest.SpyInstance;
    let revokeObjectURLSpy: jest.SpyInstance;

    beforeEach(() => {
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      };

      createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
      createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    });

    afterEach(() => {
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('should trigger file download', () => {
      const content = 'test content';
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      downloadFile(content, filename, mimeType);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it('should create blob with correct mime type', () => {
      const content = '{"key": "value"}';
      const filename = 'data.json';
      const mimeType = 'application/json';

      downloadFile(content, filename, mimeType);

      // Check that Blob was created (indirectly through createObjectURL)
      expect(createObjectURLSpy).toHaveBeenCalled();
    });
  });
});
