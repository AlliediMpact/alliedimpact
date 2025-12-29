/**
 * Bulk Export Service
 * Handles bulk data exports for various collections
 */

import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export interface ExportRequest {
  userId: string;
  exportType: 'loans' | 'investments' | 'transactions' | 'crypto_orders' | 'users';
  format: 'csv' | 'json' | 'excel';
  filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
    tier?: string;
  };
  includeFields?: string[];
  maxRecords?: number;
}

export interface ExportResult {
  exportId: string;
  recordCount: number;
  fileSize: number;
  downloadUrl: string;
  expiresAt: Date;
  format: string;
}

interface ExportLog {
  exportId: string;
  userId: string;
  exportType: string;
  format: string;
  recordCount: number;
  fileSize: number;
  filters?: any;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  expiresAt?: Timestamp;
}

/**
 * Export loans data
 */
export async function exportLoans(request: ExportRequest): Promise<ExportResult> {
  const { userId, format, filters, includeFields, maxRecords = 10000 } = request;

  try {
    // Build query
    let query = db.collection('loanTickets').where('borrowerId', '==', userId);

    if (filters?.startDate) {
      query = query.where('createdAt', '>=', Timestamp.fromDate(filters.startDate));
    }

    if (filters?.endDate) {
      query = query.where('createdAt', '<=', Timestamp.fromDate(filters.endDate));
    }

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    query = query.limit(maxRecords);

    // Fetch data
    const snapshot = await query.get();
    const loans = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Filter fields if specified
      if (includeFields && includeFields.length > 0) {
        const filteredData: any = { id: doc.id };
        includeFields.forEach(field => {
          if (data[field] !== undefined) {
            filteredData[field] = data[field];
          }
        });
        return filteredData;
      }
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt,
      };
    });

    // Generate export
    const exportData = await formatExportData(loans, format);
    const exportId = `export_loans_${Date.now()}_${userId.substring(0, 8)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Log export
    await logExport({
      exportId,
      userId,
      exportType: 'loans',
      format,
      recordCount: loans.length,
      fileSize: exportData.size,
      filters,
      status: 'completed',
      createdAt: Timestamp.now(),
      completedAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });

    return {
      exportId,
      recordCount: loans.length,
      fileSize: exportData.size,
      downloadUrl: exportData.url,
      expiresAt,
      format,
    };
  } catch (error: any) {
    const exportId = `export_loans_${Date.now()}_${userId.substring(0, 8)}`;
    await logExport({
      exportId,
      userId,
      exportType: 'loans',
      format,
      recordCount: 0,
      fileSize: 0,
      status: 'failed',
      error: error.message,
      createdAt: Timestamp.now(),
    });
    throw error;
  }
}

/**
 * Export investments data
 */
export async function exportInvestments(request: ExportRequest): Promise<ExportResult> {
  const { userId, format, filters, includeFields, maxRecords = 10000 } = request;

  try {
    let query = db.collection('investments').where('investorId', '==', userId);

    if (filters?.startDate) {
      query = query.where('createdAt', '>=', Timestamp.fromDate(filters.startDate));
    }

    if (filters?.endDate) {
      query = query.where('createdAt', '<=', Timestamp.fromDate(filters.endDate));
    }

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    query = query.limit(maxRecords);

    const snapshot = await query.get();
    const investments = snapshot.docs.map(doc => {
      const data = doc.data();
      
      if (includeFields && includeFields.length > 0) {
        const filteredData: any = { id: doc.id };
        includeFields.forEach(field => {
          if (data[field] !== undefined) {
            filteredData[field] = data[field];
          }
        });
        return filteredData;
      }
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      };
    });

    const exportData = await formatExportData(investments, format);
    const exportId = `export_investments_${Date.now()}_${userId.substring(0, 8)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await logExport({
      exportId,
      userId,
      exportType: 'investments',
      format,
      recordCount: investments.length,
      fileSize: exportData.size,
      filters,
      status: 'completed',
      createdAt: Timestamp.now(),
      completedAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });

    return {
      exportId,
      recordCount: investments.length,
      fileSize: exportData.size,
      downloadUrl: exportData.url,
      expiresAt,
      format,
    };
  } catch (error: any) {
    const exportId = `export_investments_${Date.now()}_${userId.substring(0, 8)}`;
    await logExport({
      exportId,
      userId,
      exportType: 'investments',
      format,
      recordCount: 0,
      fileSize: 0,
      status: 'failed',
      error: error.message,
      createdAt: Timestamp.now(),
    });
    throw error;
  }
}

/**
 * Export transactions data
 */
export async function exportTransactions(request: ExportRequest): Promise<ExportResult> {
  const { userId, format, filters, includeFields, maxRecords = 10000 } = request;

  try {
    let query = db.collection('transactions').where('userId', '==', userId);

    if (filters?.startDate) {
      query = query.where('createdAt', '>=', Timestamp.fromDate(filters.startDate));
    }

    if (filters?.endDate) {
      query = query.where('createdAt', '<=', Timestamp.fromDate(filters.endDate));
    }

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    query = query.orderBy('createdAt', 'desc').limit(maxRecords);

    const snapshot = await query.get();
    const transactions = snapshot.docs.map(doc => {
      const data = doc.data();
      
      if (includeFields && includeFields.length > 0) {
        const filteredData: any = { id: doc.id };
        includeFields.forEach(field => {
          if (data[field] !== undefined) {
            filteredData[field] = data[field];
          }
        });
        return filteredData;
      }
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      };
    });

    const exportData = await formatExportData(transactions, format);
    const exportId = `export_transactions_${Date.now()}_${userId.substring(0, 8)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await logExport({
      exportId,
      userId,
      exportType: 'transactions',
      format,
      recordCount: transactions.length,
      fileSize: exportData.size,
      filters,
      status: 'completed',
      createdAt: Timestamp.now(),
      completedAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });

    return {
      exportId,
      recordCount: transactions.length,
      fileSize: exportData.size,
      downloadUrl: exportData.url,
      expiresAt,
      format,
    };
  } catch (error: any) {
    const exportId = `export_transactions_${Date.now()}_${userId.substring(0, 8)}`;
    await logExport({
      exportId,
      userId,
      exportType: 'transactions',
      format,
      recordCount: 0,
      fileSize: 0,
      status: 'failed',
      error: error.message,
      createdAt: Timestamp.now(),
    });
    throw error;
  }
}

/**
 * Export crypto orders data
 */
export async function exportCryptoOrders(request: ExportRequest): Promise<ExportResult> {
  const { userId, format, filters, includeFields, maxRecords = 10000 } = request;

  try {
    let query = db.collection('cryptoOrders').where('userId', '==', userId);

    if (filters?.startDate) {
      query = query.where('createdAt', '>=', Timestamp.fromDate(filters.startDate));
    }

    if (filters?.endDate) {
      query = query.where('createdAt', '<=', Timestamp.fromDate(filters.endDate));
    }

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    query = query.orderBy('createdAt', 'desc').limit(maxRecords);

    const snapshot = await query.get();
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      
      if (includeFields && includeFields.length > 0) {
        const filteredData: any = { id: doc.id };
        includeFields.forEach(field => {
          if (data[field] !== undefined) {
            filteredData[field] = data[field];
          }
        });
        return filteredData;
      }
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      };
    });

    const exportData = await formatExportData(orders, format);
    const exportId = `export_crypto_orders_${Date.now()}_${userId.substring(0, 8)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await logExport({
      exportId,
      userId,
      exportType: 'crypto_orders',
      format,
      recordCount: orders.length,
      fileSize: exportData.size,
      filters,
      status: 'completed',
      createdAt: Timestamp.now(),
      completedAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });

    return {
      exportId,
      recordCount: orders.length,
      fileSize: exportData.size,
      downloadUrl: exportData.url,
      expiresAt,
      format,
    };
  } catch (error: any) {
    const exportId = `export_crypto_orders_${Date.now()}_${userId.substring(0, 8)}`;
    await logExport({
      exportId,
      userId,
      exportType: 'crypto_orders',
      format,
      recordCount: 0,
      fileSize: 0,
      status: 'failed',
      error: error.message,
      createdAt: Timestamp.now(),
    });
    throw error;
  }
}

/**
 * Format data for export
 */
async function formatExportData(
  data: any[],
  format: 'csv' | 'json' | 'excel'
): Promise<{ url: string; size: number }> {
  let content: string;
  let mimeType: string;
  let extension: string;

  switch (format) {
    case 'csv':
      content = convertToCSV(data);
      mimeType = 'text/csv';
      extension = 'csv';
      break;
    
    case 'json':
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      extension = 'json';
      break;
    
    case 'excel':
      // For Excel, we'll use CSV for now
      // In production, use a library like exceljs
      content = convertToCSV(data);
      mimeType = 'application/vnd.ms-excel';
      extension = 'xls';
      break;
    
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  // In production, upload to Cloud Storage and return signed URL
  // For now, return base64 data URL
  const base64 = Buffer.from(content).toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  return {
    url: dataUrl,
    size: Buffer.byteLength(content, 'utf8'),
  };
}

/**
 * Convert data to CSV format
 */
function convertToCSV(data: any[]): string {
  if (data.length === 0) {
    return '';
  }

  // Get all unique keys
  const keys = Array.from(
    new Set(data.flatMap(obj => Object.keys(obj)))
  );

  // Create header row
  const header = keys.join(',');

  // Create data rows
  const rows = data.map(obj => {
    return keys.map(key => {
      const value = obj[key];
      
      // Handle different value types
      if (value === null || value === undefined) {
        return '';
      }
      
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      
      const stringValue = String(value);
      
      // Escape quotes and wrap in quotes if contains comma, newline, or quote
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    }).join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Log export operation
 */
async function logExport(log: ExportLog): Promise<void> {
  await db.collection('exportLogs').doc(log.exportId).set(log);
}

/**
 * Get export history for a user
 */
export async function getExportHistory(
  userId: string,
  limit: number = 50
): Promise<ExportLog[]> {
  const snapshot = await db
    .collection('exportLogs')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => doc.data() as ExportLog);
}

/**
 * Get export by ID
 */
export async function getExport(exportId: string): Promise<ExportLog | null> {
  const doc = await db.collection('exportLogs').doc(exportId).get();
  
  if (!doc.exists) {
    return null;
  }
  
  return doc.data() as ExportLog;
}

/**
 * Delete expired exports (cleanup job)
 */
export async function cleanupExpiredExports(): Promise<number> {
  const now = Timestamp.now();
  
  const snapshot = await db
    .collection('exportLogs')
    .where('expiresAt', '<=', now)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  
  return snapshot.size;
}
