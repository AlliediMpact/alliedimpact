import { db } from './firebase';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { generatePDF } from './pdf-generator';
import { notificationService } from './notification-service';

interface Receipt {
  id: string;
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  date: Date;
  description: string;
  status: 'paid' | 'pending' | 'failed';
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  metadata?: Record<string, any>;
  pdfUrl?: string;
}

interface ReceiptGenerationOptions {
  sendNotification?: boolean;
  generatePdf?: boolean;
  includeMetadata?: boolean;
}

class ReceiptService {
  /**
   * Generate a receipt for a payment transaction
   * Can be called with either a paymentId or payment data object
   */
  async generateReceipt(
    paymentIdOrData: string | {
      userId: string;
      type?: string;
      amount: number;
      currency: string;
      reference: string;
      description: string;
      paymentMethod?: string;
      customerInfo?: { name: string; email: string; phone?: string };
      transactionDate?: Date;
      [key: string]: any;
    },
    options?: ReceiptGenerationOptions
  ): Promise<Receipt> {
    try {
      let receiptData: Omit<Receipt, 'id'>;
      const defaultOptions: ReceiptGenerationOptions = {
        sendNotification: true,
        generatePdf: true,
        includeMetadata: true,
        ...options
      };

      // Handle both string (paymentId) and object (payment data) inputs
      if (typeof paymentIdOrData === 'string') {
        // Original logic: fetch from database
        const paymentDoc = await getDoc(doc(db, 'payments', paymentIdOrData));
        
        if (!paymentDoc.exists()) {
          throw new Error(`Payment ${paymentIdOrData} not found`);
        }
        
        const paymentData = paymentDoc.data();
        const userId = paymentData.userId;
        
        if (!userId) {
          throw new Error('Payment does not have a user ID');
        }
        
        receiptData = {
          paymentId: paymentIdOrData,
          userId,
          amount: paymentData.amount,
          currency: paymentData.currency || 'ZAR',
          date: new Date(),
          description: paymentData.description || 'Payment for CoinBox services',
          status: paymentData.status === 'success' ? 'paid' : 
                  paymentData.status === 'failed' ? 'failed' : 'pending',
          items: [
            {
              description: 'CoinBox Membership Fee',
              quantity: 1,
              unitPrice: paymentData.amount,
              totalPrice: paymentData.amount
            }
          ],
          metadata: defaultOptions.includeMetadata ? paymentData.metadata : undefined
        };
      } else {
        // New logic: use provided payment data
        const paymentData = paymentIdOrData;
        receiptData = {
          paymentId: paymentData.reference || `ref_${Date.now()}`,
          userId: paymentData.userId,
          amount: paymentData.amount,
          currency: paymentData.currency || 'ZAR',
          date: paymentData.transactionDate || new Date(),
          description: paymentData.description || 'Payment for CoinBox services',
          status: 'paid', // Assuming passed data is successful
          items: [
            {
              description: paymentData.type || 'CoinBox Payment',
              quantity: 1,
              unitPrice: paymentData.amount,
              totalPrice: paymentData.amount
            }
          ],
          metadata: defaultOptions.includeMetadata ? { ...paymentData } : undefined
        };
      }
      
      // Save receipt to database
      const receiptRef = await addDoc(collection(db, 'receipts'), {
        ...receiptData,
        createdAt: serverTimestamp()
      });
      
      // Generate PDF if requested
      let pdfUrl = undefined;
      if (options.generatePdf) {
        pdfUrl = await generatePDF({
          title: 'Payment Receipt',
          receiptId: receiptRef.id,
          paymentId: receiptData.paymentId,
          userId: receiptData.userId,
          amount: receiptData.amount,
          currency: receiptData.currency,
          date: receiptData.date,
          status: receiptData.status,
          items: receiptData.items,
          customerName: 'Valued Customer',
          customerEmail: 'customer@example.com',
          companyInfo: {
            name: 'CoinBox Connect',
            address: '123 Financial Avenue, Cape Town, South Africa',
            email: 'support@coinboxconnect.com',
            phone: '+27 123 456 789'
          }
        });
        
        // Update receipt with PDF URL
        await updateDoc(receiptRef, { pdfUrl });
      }
      
      // Send notification if requested
      if (options.sendNotification) {
        await notificationService.create({
          userId: receiptData.userId,
          type: 'system',
          title: 'Payment Receipt Available',
          message: `Your payment receipt for R${receiptData.amount} is now available for viewing and download.`,
          priority: 'low',
          metadata: {
            receiptUrl: pdfUrl,
            paymentId: receiptData.paymentId,
            amount: receiptData.amount
          }
        });
      }
      
      // Return receipt data with ID
      return {
        ...receiptData,
        id: receiptRef.id,
        pdfUrl
      };
    } catch (error) {
      console.error('Failed to generate receipt:', error);
      throw new Error('Receipt generation failed');
    }
  }
  
  /**
   * Get a receipt by ID
   */
  async getReceipt(receiptId: string): Promise<Receipt | null> {
    try {
      const receiptDoc = await getDoc(doc(db, 'receipts', receiptId));
      
      if (!receiptDoc.exists()) {
        return null;
      }
      
      return {
        id: receiptDoc.id,
        ...receiptDoc.data()
      } as Receipt;
    } catch (error) {
      console.error('Failed to get receipt:', error);
      return null;
    }
  }
  
  /**
   * List all receipts for a user
   */
  async listUserReceipts(userId: string): Promise<Receipt[]> {
    try {
      const q = query(
        collection(db, 'receipts'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const receiptsSnapshot = await getDocs(q);
      
      return receiptsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Receipt[];
    } catch (error) {
      console.error('Failed to list user receipts:', error);
      return [];
    }
  }
}

export const receiptService = new ReceiptService();
