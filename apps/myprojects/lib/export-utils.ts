import { Milestone, Deliverable, Ticket } from '@allied-impact/projects';

/**
 * Export utility functions for bulk export operations
 */

// Convert data to CSV format
export function convertToCSV(data: any[], headers: string[]): string {
  const headerRow = headers.join(',');
  const rows = data.map(item => {
    return headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) return '';
      
      // Handle dates
      if (value instanceof Date) {
        return value.toISOString();
      }
      
      // Handle objects and arrays
      if (typeof value === 'object') {
        return JSON.stringify(value).replace(/"/g, '""');
      }
      
      // Escape commas and quotes
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    }).join(',');
  });
  
  return [headerRow, ...rows].join('\n');
}

// Export milestones to CSV
export function exportMilestonesToCSV(milestones: Milestone[]): string {
  const headers = [
    'id',
    'name',
    'description',
    'status',
    'dueDate',
    'completedDate',
    'progress',
    'deliverables',
    'dependencies',
    'createdAt',
    'updatedAt'
  ];
  
  const data = milestones.map(m => ({
    id: m.id,
    name: m.name,
    description: m.description,
    status: m.status,
    dueDate: m.dueDate,
    completedDate: m.completedDate || '',
    progress: m.progress,
    deliverables: m.deliverables?.length || 0,
    dependencies: m.dependencies?.length || 0,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt
  }));
  
  return convertToCSV(data, headers);
}

// Export deliverables to CSV
export function exportDeliverablesToCSV(deliverables: Deliverable[]): string {
  const headers = [
    'id',
    'name',
    'description',
    'type',
    'status',
    'dueDate',
    'deliveredDate',
    'approvedDate',
    'notes',
    'fileCount',
    'assignedTo',
    'createdAt',
    'updatedAt'
  ];
  
  const data = deliverables.map(d => ({
    id: d.id,
    name: d.name,
    description: d.description,
    type: d.type,
    status: d.status,
    dueDate: d.dueDate,
    deliveredDate: d.deliveredDate || '',
    approvedDate: d.approvedDate || '',
    notes: d.notes || '',
    fileCount: d.fileUrls?.length || 0,
    assignedTo: d.assignedTo || '',
    createdAt: d.createdAt,
    updatedAt: d.updatedAt
  }));
  
  return convertToCSV(data, headers);
}

// Export tickets to CSV
export function exportTicketsToCSV(tickets: Ticket[]): string {
  const headers = [
    'id',
    'title',
    'description',
    'status',
    'priority',
    'category',
    'assignedTo',
    'commentCount',
    'createdBy',
    'createdAt',
    'updatedAt',
    'resolvedAt'
  ];
  
  const data = tickets.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    category: t.category,
    assignedTo: t.assignedTo || '',
    commentCount: t.comments?.length || 0,
    createdBy: t.createdBy,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    resolvedAt: t.resolvedAt || ''
  }));
  
  return convertToCSV(data, headers);
}

// Convert data to JSON format
export function convertToJSON(data: any[]): string {
  return JSON.stringify(data, null, 2);
}

// Download file to user's computer
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export milestones with download
export function downloadMilestonesCSV(milestones: Milestone[], projectName: string): void {
  const csv = exportMilestonesToCSV(milestones);
  const filename = `${projectName.replace(/\s+/g, '_')}_milestones_${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, filename, 'text/csv');
}

// Export milestones as JSON
export function downloadMilestonesJSON(milestones: Milestone[], projectName: string): void {
  const json = convertToJSON(milestones);
  const filename = `${projectName.replace(/\s+/g, '_')}_milestones_${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(json, filename, 'application/json');
}

// Export deliverables with download
export function downloadDeliverablesCSV(deliverables: Deliverable[], projectName: string): void {
  const csv = exportDeliverablesToCSV(deliverables);
  const filename = `${projectName.replace(/\s+/g, '_')}_deliverables_${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, filename, 'text/csv');
}

// Export deliverables as JSON
export function downloadDeliverablesJSON(deliverables: Deliverable[], projectName: string): void {
  const json = convertToJSON(deliverables);
  const filename = `${projectName.replace(/\s+/g, '_')}_deliverables_${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(json, filename, 'application/json');
}

// Export tickets with download
export function downloadTicketsCSV(tickets: Ticket[], projectName: string): void {
  const csv = exportTicketsToCSV(tickets);
  const filename = `${projectName.replace(/\s+/g, '_')}_tickets_${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, filename, 'text/csv');
}

// Export tickets as JSON
export function downloadTicketsJSON(tickets: Ticket[], projectName: string): void {
  const json = convertToJSON(tickets);
  const filename = `${projectName.replace(/\s+/g, '_')}_tickets_${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(json, filename, 'application/json');
}

// Export multiple types at once
export interface BulkExportOptions {
  milestones?: Milestone[];
  deliverables?: Deliverable[];
  tickets?: Ticket[];
  projectName: string;
  format: 'csv' | 'json';
}

export function bulkExport(options: BulkExportOptions): void {
  const { milestones, deliverables, tickets, projectName, format } = options;
  
  if (format === 'csv') {
    if (milestones && milestones.length > 0) {
      downloadMilestonesCSV(milestones, projectName);
    }
    if (deliverables && deliverables.length > 0) {
      downloadDeliverablesCSV(deliverables, projectName);
    }
    if (tickets && tickets.length > 0) {
      downloadTicketsCSV(tickets, projectName);
    }
  } else {
    if (milestones && milestones.length > 0) {
      downloadMilestonesJSON(milestones, projectName);
    }
    if (deliverables && deliverables.length > 0) {
      downloadDeliverablesJSON(deliverables, projectName);
    }
    if (tickets && tickets.length > 0) {
      downloadTicketsJSON(tickets, projectName);
    }
  }
}
