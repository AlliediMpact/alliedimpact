/**
 * @jest-environment jsdom
 */
import { AccessibilityChecker } from '@/lib/accessibility';

describe('AccessibilityChecker', () => {
  let checker: AccessibilityChecker;
  let container: HTMLElement;

  beforeEach(() => {
    checker = new AccessibilityChecker();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('checkImageAltText', () => {
    it('should detect images without alt text', () => {
      container.innerHTML = '<img src="test.jpg" />';
      const issues = checker.checkImageAltText(container);
      
      expect(issues.length).toBe(1);
      expect(issues[0].type).toBe('error');
      expect(issues[0].rule).toBe('WCAG 1.1.1');
    });

    it('should not flag images with alt text', () => {
      container.innerHTML = '<img src="test.jpg" alt="Test image" />';
      const issues = checker.checkImageAltText(container);
      
      expect(issues.length).toBe(0);
    });

    it('should detect images with empty alt attribute', () => {
      container.innerHTML = '<img src="test.jpg" alt="" />';
      const issues = checker.checkImageAltText(container);
      
      expect(issues.length).toBe(1);
      expect(issues[0].type).toBe('warning');
    });

    it('should handle multiple images', () => {
      container.innerHTML = `
        <img src="1.jpg" alt="Image 1" />
        <img src="2.jpg" />
        <img src="3.jpg" alt="Image 3" />
      `;
      const issues = checker.checkImageAltText(container);
      
      expect(issues.length).toBe(1);
    });
  });

  describe('checkHeadingHierarchy', () => {
    it('should detect skipped heading levels', () => {
      container.innerHTML = `
        <h1>Title</h1>
        <h3>Skipped H2</h3>
      `;
      const issues = checker.checkHeadingHierarchy(container);
      
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].type).toBe('error');
      expect(issues[0].rule).toBe('WCAG 1.3.1');
    });

    it('should detect multiple h1 elements', () => {
      container.innerHTML = `
        <h1>First H1</h1>
        <h1>Second H1</h1>
      `;
      const issues = checker.checkHeadingHierarchy(container);
      
      expect(issues.length).toBe(1);
      expect(issues[0].message).toContain('Multiple h1');
    });

    it('should accept proper heading hierarchy', () => {
      container.innerHTML = `
        <h1>Title</h1>
        <h2>Subtitle</h2>
        <h3>Section</h3>
      `;
      const issues = checker.checkHeadingHierarchy(container);
      
      expect(issues.filter(i => i.type === 'error').length).toBe(0);
    });
  });

  describe('checkFormLabels', () => {
    it('should detect inputs without labels', () => {
      container.innerHTML = '<input type="text" />';
      const issues = checker.checkFormLabels(container);
      
      expect(issues.length).toBe(1);
      expect(issues[0].type).toBe('error');
    });

    it('should accept inputs with associated labels', () => {
      container.innerHTML = `
        <label for="test-input">Label</label>
        <input type="text" id="test-input" />
      `;
      const issues = checker.checkFormLabels(container);
      
      expect(issues.length).toBe(0);
    });

    it('should accept inputs with aria-label', () => {
      container.innerHTML = '<input type="text" aria-label="Test input" />';
      const issues = checker.checkFormLabels(container);
      
      expect(issues.length).toBe(0);
    });

    it('should accept inputs with aria-labelledby', () => {
      container.innerHTML = `
        <span id="label-text">Label</span>
        <input type="text" aria-labelledby="label-text" />
      `;
      const issues = checker.checkFormLabels(container);
      
      expect(issues.length).toBe(0);
    });

    it('should handle multiple form fields', () => {
      container.innerHTML = `
        <input type="text" aria-label="Field 1" />
        <input type="text" />
        <input type="text" id="field3" />
        <label for="field3">Field 3</label>
      `;
      const issues = checker.checkFormLabels(container);
      
      expect(issues.length).toBe(1);
    });
  });

  describe('checkKeyboardAccessibility', () => {
    it('should detect invalid tabindex values', () => {
      container.innerHTML = '<div tabindex="5">Content</div>';
      const issues = checker.checkKeyboardAccessibility(container);
      
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].type).toBe('warning');
    });

    it('should accept valid tabindex values', () => {
      container.innerHTML = `
        <button tabindex="0">Button</button>
        <div tabindex="-1">Programmatic focus</div>
      `;
      const issues = checker.checkKeyboardAccessibility(container);
      
      const tabindexIssues = issues.filter(i => i.message.includes('tabindex'));
      expect(tabindexIssues.length).toBe(0);
    });

    it('should detect buttons without accessible names', () => {
      container.innerHTML = '<button></button>';
      const issues = checker.checkKeyboardAccessibility(container);
      
      expect(issues.some(i => i.message.includes('accessible name'))).toBe(true);
    });

    it('should accept buttons with text content', () => {
      container.innerHTML = '<button>Click me</button>';
      const issues = checker.checkKeyboardAccessibility(container);
      
      const nameIssues = issues.filter(i => i.message.includes('accessible name'));
      expect(nameIssues.length).toBe(0);
    });
  });

  describe('checkAriaAttributes', () => {
    it('should detect invalid ARIA roles', () => {
      container.innerHTML = '<div role="invalid-role">Content</div>';
      const issues = checker.checkAriaAttributes(container);
      
      expect(issues.length).toBe(1);
      expect(issues[0].type).toBe('error');
    });

    it('should accept valid ARIA roles', () => {
      container.innerHTML = `
        <nav role="navigation">Nav</nav>
        <button role="button">Button</button>
        <div role="alert">Alert</div>
      `;
      const issues = checker.checkAriaAttributes(container);
      
      expect(issues.length).toBe(0);
    });

    it('should handle multiple invalid roles', () => {
      container.innerHTML = `
        <div role="invalid1">Content 1</div>
        <div role="invalid2">Content 2</div>
      `;
      const issues = checker.checkAriaAttributes(container);
      
      expect(issues.length).toBe(2);
    });
  });

  describe('runAllChecks', () => {
    it('should run all accessibility checks', () => {
      container.innerHTML = `
        <img src="test.jpg" />
        <h1>Title</h1>
        <h3>Skipped H2</h3>
        <input type="text" />
        <button></button>
        <div role="invalid">Content</div>
      `;

      const issues = checker.runAllChecks(container);
      
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(i => i.rule === 'WCAG 1.1.1')).toBe(true); // Image alt
      expect(issues.some(i => i.rule === 'WCAG 1.3.1')).toBe(true); // Headings/Forms
      expect(issues.some(i => i.rule === 'WCAG 4.1.2')).toBe(true); // ARIA
    });

    it('should categorize issues by type', () => {
      container.innerHTML = `
        <img src="test.jpg" />
        <img src="test2.jpg" alt="" />
        <div tabindex="5">Content</div>
      `;

      const issues = checker.runAllChecks(container);
      
      const errors = issues.filter(i => i.type === 'error');
      const warnings = issues.filter(i => i.type === 'warning');
      
      expect(errors.length).toBeGreaterThan(0);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('should return empty array for accessible content', () => {
      container.innerHTML = `
        <h1>Title</h1>
        <img src="test.jpg" alt="Test" />
        <label for="input1">Label</label>
        <input type="text" id="input1" />
        <button>Click me</button>
      `;

      const issues = checker.runAllChecks(container);
      const errors = issues.filter(i => i.type === 'error');
      
      expect(errors.length).toBe(0);
    });
  });
});
