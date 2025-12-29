'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Table, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportButtonProps {
  data: any[];
  filename: string;
  title?: string;
  columns?: { header: string; key: string }[];
  disabled?: boolean;
}

export function ExportButton({
  data,
  filename,
  title = 'Analytics Export',
  columns,
  disabled = false,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    try {
      setExporting(true);

      if (!data || data.length === 0) {
        toast.error('No data available to export');
        return;
      }

      // Get headers from columns or first data object
      const headers = columns
        ? columns.map(col => col.header)
        : Object.keys(data[0]);

      const keys = columns
        ? columns.map(col => col.key)
        : Object.keys(data[0]);

      // Create CSV content
      const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
          keys.map(key => {
            const value = row[key];
            // Handle values with commas, quotes, or newlines
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? '';
          }).join(',')
        )
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = () => {
    try {
      setExporting(true);

      if (!data || data.length === 0) {
        toast.error('No data available to export');
        return;
      }

      // Get headers
      const headers = columns
        ? columns.map(col => col.header)
        : Object.keys(data[0]);

      const keys = columns
        ? columns.map(col => col.key)
        : Object.keys(data[0]);

      // Create HTML table
      const table = document.createElement('table');
      
      // Header row
      const thead = table.createTHead();
      const headerRow = thead.insertRow();
      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
      });

      // Data rows
      const tbody = table.createTBody();
      data.forEach(row => {
        const tr = tbody.insertRow();
        keys.forEach(key => {
          const td = tr.insertCell();
          td.textContent = row[key] ?? '';
        });
      });

      // Convert to Excel format (HTML table)
      const html = table.outerHTML;
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xls`;
      link.click();

      toast.success('Excel file exported successfully');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('Failed to export Excel file');
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = () => {
    try {
      setExporting(true);

      if (!data || data.length === 0) {
        toast.error('No data available to export');
        return;
      }

      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text(title, 14, 22);

      // Add date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

      // Prepare table data
      const headers = columns
        ? columns.map(col => col.header)
        : Object.keys(data[0]);

      const keys = columns
        ? columns.map(col => col.key)
        : Object.keys(data[0]);

      const tableData = data.map(row =>
        keys.map(key => {
          const value = row[key];
          if (value === null || value === undefined) return '';
          if (typeof value === 'number') return value.toFixed(2);
          return String(value);
        })
      );

      // Add table
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 35,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [25, 50, 129], // Brand color
          textColor: 255,
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
      });

      // Save PDF
      doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);

      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const exportToJSON = () => {
    try {
      setExporting(true);

      if (!data || data.length === 0) {
        toast.error('No data available to export');
        return;
      }

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      toast.success('JSON exported successfully');
    } catch (error) {
      console.error('JSON export error:', error);
      toast.error('Failed to export JSON');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || exporting}>
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToCSV}>
          <Table className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileText className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Quick export buttons for common formats
export function QuickExportButtons({
  data,
  filename,
  title,
  columns,
  disabled = false,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: string, exportFn: () => void) => {
    setExporting(format);
    await exportFn();
    setExporting(null);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || exporting !== null}
        onClick={() => handleExport('csv', () => ExportButton({ data, filename, title, columns }).props)}
      >
        {exporting === 'csv' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Table className="mr-2 h-4 w-4" />
            CSV
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || exporting !== null}
        onClick={() => handleExport('pdf', () => {})}
      >
        {exporting === 'pdf' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </>
        )}
      </Button>
    </div>
  );
}
