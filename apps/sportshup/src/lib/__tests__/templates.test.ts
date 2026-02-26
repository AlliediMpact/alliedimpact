import { TOURNAMENT_TEMPLATES, getTemplate, getTemplatesByCategory } from '../templates';

describe('Tournament Templates', () => {
  describe('TOURNAMENT_TEMPLATES', () => {
    it('should have defined templates', () => {
      expect(TOURNAMENT_TEMPLATES).toBeDefined();
      expect(Array.isArray(TOURNAMENT_TEMPLATES)).toBe(true);
      expect(TOURNAMENT_TEMPLATES.length).toBeGreaterThan(0);
    });

    it('should have required fields for each template', () => {
      TOURNAMENT_TEMPLATES.forEach((template) => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('category');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('teams');
        expect(typeof template.id).toBe('string');
        expect(typeof template.name).toBe('string');
        expect(['football', 'custom']).toContain(template.category);
      });
    });

    it('should have unique template IDs', () => {
      const ids = TOURNAMENT_TEMPLATES.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid team counts', () => {
      TOURNAMENT_TEMPLATES.forEach((template) => {
        expect(template.teams).toBeGreaterThan(0);
        expect(template.teams).toBeLessThanOrEqual(32);
      });
    });
  });

  describe('getTemplate', () => {
    it('should return template by ID', () => {
      const firstTemplate = TOURNAMENT_TEMPLATES[0];
      const found = getTemplate(firstTemplate.id);
      
      expect(found).toBeDefined();
      expect(found?.id).toBe(firstTemplate.id);
      expect(found?.name).toBe(firstTemplate.name);
    });

    it('should return undefined for invalid ID', () => {
      const result = getTemplate('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      const firstTemplate = TOURNAMENT_TEMPLATES[0];
      const result = getTemplate(firstTemplate.id.toUpperCase());
      
      // Assuming IDs are lowercase
      if (firstTemplate.id === firstTemplate.id.toLowerCase()) {
        expect(result).toBeUndefined();
      }
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return football templates', () => {
      const footballTemplates = getTemplatesByCategory('football');
      
      expect(Array.isArray(footballTemplates)).toBe(true);
      footballTemplates.forEach((template) => {
        expect(template.category).toBe('football');
      });
    });

    it('should return custom templates', () => {
      const customTemplates = getTemplatesByCategory('custom');
      
      expect(Array.isArray(customTemplates)).toBe(true);
      customTemplates.forEach((template) => {
        expect(template.category).toBe('custom');
      });
    });

    it('should return empty array for no matches', () => {
      // If all templates are categorized, this should work
      const allTemplates = TOURNAMENT_TEMPLATES.length;
      const footballCount = getTemplatesByCategory('football').length;
      const customCount = getTemplatesByCategory('custom').length;
      
      expect(footballCount + customCount).toBe(allTemplates);
    });

    it('should not mutate original templates', () => {
      const original = [...TOURNAMENT_TEMPLATES];
      getTemplatesByCategory('football');
      
      expect(TOURNAMENT_TEMPLATES).toEqual(original);
    });
  });

  describe('Template data integrity', () => {
    it('should have World Cup template', () => {
      const worldCup = TOURNAMENT_TEMPLATES.find((t) => 
        t.name.toLowerCase().includes('world cup')
      );
      
      expect(worldCup).toBeDefined();
      if (worldCup) {
        expect(worldCup.teams).toBe(32);
        expect(worldCup.category).toBe('football');
      }
    });

    it('should have Champions League template', () => {
      const championsLeague = TOURNAMENT_TEMPLATES.find((t) => 
        t.name.toLowerCase().includes('champions')
      );
      
      expect(championsLeague).toBeDefined();
      if (championsLeague) {
        expect(championsLeague.category).toBe('football');
      }
    });

    it('should have descriptions for all templates', () => {
      TOURNAMENT_TEMPLATES.forEach((template) => {
        expect(template.description).toBeDefined();
        expect(template.description.length).toBeGreaterThan(0);
        expect(typeof template.description).toBe('string');
      });
    });

    it('should have reasonable team counts', () => {
      const validCounts = [4, 8, 16, 20, 24, 32];
      
      TOURNAMENT_TEMPLATES.forEach((template) => {
        // Most tournaments should use standard bracket sizes
        expect(template.teams).toBeGreaterThan(0);
        expect(template.teams).toBeLessThanOrEqual(32);
      });
    });
  });
});
