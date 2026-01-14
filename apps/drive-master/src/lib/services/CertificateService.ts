import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  Timestamp,
  increment,
  runTransaction,
  Transaction,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export interface Certificate {
  certificateNumber: string;
  userId: string;
  userName: string;
  stage: 'beginner' | 'intermediate' | 'advanced' | 'k53';
  score: number;
  completionDate: Date;
  pdfUrl: string;
  verificationUrl: string;
  createdAt: Date;
}

const DISCLAIMERS = [
  '1. This certificate is for educational purposes only and does not replace official K53 learner\'s or driver\'s license testing.',
  '2. DriveMaster is a learning platform and is not affiliated with or endorsed by any official licensing authority.',
  '3. Passing all stages on DriveMaster does not guarantee passing the official license test.',
  '4. Users must still complete all legal requirements to obtain an official driver\'s license in South Africa.',
];

export class CertificateService {
  /**
   * Generate unique certificate number
   */
  private async generateCertificateNumber(): Promise<string> {
    const counterRef = doc(db, 'drivemaster_system', 'certificate_counter');
    
    let certificateNumber = '';
    
    await runTransaction(db, async (transaction: Transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let nextNumber = 1;
      if (counterDoc.exists()) {
        nextNumber = (counterDoc.data().count || 0) + 1;
      }
      
      transaction.set(counterRef, { count: nextNumber }, { merge: true });
      
      const year = new Date().getFullYear();
      const paddedNumber = String(nextNumber).padStart(5, '0');
      certificateNumber = `DM-${year}-${paddedNumber}`;
    });
    
    return certificateNumber;
  }

  /**
   * Generate PDF certificate
   */
  private async generatePDF(data: {
    certificateNumber: string;
    userName: string;
    stage: string;
    score: number;
    completionDate: Date;
    verificationUrl: string;
  }): Promise<Blob> {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Border
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Inner border
    doc.setDrawColor(147, 197, 253);
    doc.setLineWidth(0.5);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // Header
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('DriveMaster', pageWidth / 2, 35, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Certificate of Completion', pageWidth / 2, 45, { align: 'center' });

    // Certificate Number
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Certificate No: ${data.certificateNumber}`, pageWidth / 2, 55, { align: 'center' });

    // Decorative line
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(1);
    doc.line(60, 60, pageWidth - 60, 60);

    // Main Content
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('This is to certify that', pageWidth / 2, 75, { align: 'center' });

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(data.userName, pageWidth / 2, 88, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text('has successfully completed', pageWidth / 2, 100, { align: 'center' });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    const stageText = data.stage.charAt(0).toUpperCase() + data.stage.slice(1) + ' Stage';
    doc.text(stageText, pageWidth / 2, 112, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(`with a score of ${data.score}%`, pageWidth / 2, 122, { align: 'center' });

    doc.text(
      `Completion Date: ${data.completionDate.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`,
      pageWidth / 2,
      132,
      { align: 'center' }
    );

    // QR Code
    const qrDataUrl = await QRCode.toDataURL(data.verificationUrl, {
      width: 200,
      margin: 1,
    });
    doc.addImage(qrDataUrl, 'PNG', pageWidth - 45, pageHeight - 55, 30, 30);

    doc.setFontSize(8);
    doc.text('Scan to verify', pageWidth - 30, pageHeight - 20, { align: 'center' });

    // Disclaimers
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    
    let yPosition = pageHeight - 50;
    DISCLAIMERS.forEach((disclaimer, index) => {
      const lines = doc.splitTextToSize(disclaimer, pageWidth - 100);
      doc.text(lines, 25, yPosition);
      yPosition += 6;
    });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('© 2026 DriveMaster. All rights reserved.', pageWidth / 2, pageHeight - 8, {
      align: 'center',
    });

    return doc.output('blob');
  }

  /**
   * Issue a certificate
   */
  async issueCertificate(
    userId: string,
    userName: string,
    stage: 'beginner' | 'intermediate' | 'advanced' | 'k53',
    score: number
  ): Promise<Certificate> {
    // Check if certificate already exists for this stage
    const existingCert = await this.getUserCertificate(userId, stage);
    if (existingCert) {
      return existingCert;
    }

    // Generate certificate number
    const certificateNumber = await this.generateCertificateNumber();
    const completionDate = new Date();
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://drivemaster.co.za'}/verify/${certificateNumber}`;

    // Generate PDF
    const pdfBlob = await this.generatePDF({
      certificateNumber,
      userName,
      stage,
      score,
      completionDate,
      verificationUrl,
    });

    // Upload to Firebase Storage
    const storageRef = ref(storage, `certificates/${userId}/${certificateNumber}.pdf`);
    await uploadBytes(storageRef, pdfBlob);
    const pdfUrl = await getDownloadURL(storageRef);

    // Store certificate metadata
    const certificate: Certificate = {
      certificateNumber,
      userId,
      userName,
      stage,
      score,
      completionDate,
      pdfUrl,
      verificationUrl,
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'drivemaster_certificates', certificateNumber), {
      ...certificate,
      completionDate: Timestamp.fromDate(completionDate),
      createdAt: Timestamp.fromDate(new Date()),
    });

    return certificate;
  }

  /**
   * Get certificate by number
   */
  async getCertificate(certificateNumber: string): Promise<Certificate | null> {
    const certRef = doc(db, 'drivemaster_certificates', certificateNumber);
    const certDoc = await getDoc(certRef);

    if (!certDoc.exists()) {
      return null;
    }

    const data = certDoc.data();
    return {
      ...data,
      completionDate: data.completionDate?.toDate(),
      createdAt: data.createdAt?.toDate(),
    } as Certificate;
  }

  /**
   * Get user's certificate for a specific stage
   */
  async getUserCertificate(
    userId: string,
    stage: string
  ): Promise<Certificate | null> {
    const certificatesRef = collection(db, 'drivemaster_certificates');
    const q = query(
      certificatesRef,
      where('userId', '==', userId),
      where('stage', '==', stage)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs[0].data();
    return {
      ...data,
      completionDate: data.completionDate?.toDate(),
      createdAt: data.createdAt?.toDate(),
    } as Certificate;
  }

  /**
   * Get all certificates for a user
   */
  async getUserCertificates(userId: string): Promise<Certificate[]> {
    const certificatesRef = collection(db, 'drivemaster_certificates');
    const q = query(certificatesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      return {
        ...data,
        completionDate: data.completionDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
      } as Certificate;
    });
  }

  /**
   * Verify certificate
   */
  async verifyCertificate(certificateNumber: string): Promise<{
    valid: boolean;
    certificate: Certificate | null;
  }> {
    const certificate = await this.getCertificate(certificateNumber);

    return {
      valid: certificate !== null,
      certificate,
    };
  }
}
