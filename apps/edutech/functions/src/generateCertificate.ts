import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as QRCode from 'qrcode';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface CertificateData {
  certificateId: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  completedAt: admin.firestore.Timestamp;
  verificationCode: string;
  instructorName?: string;
  courseDuration?: string;
}

/**
 * Cloud Function: Generate Certificate on Course Completion
 * Triggered when enrollment status changes to 'completed'
 */
export const onCourseComplete = functions.firestore
  .document('edutech_users/{userId}/edutech_enrollments/{enrollmentId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Only trigger if status changed to 'completed'
    if (before.status !== 'completed' && after.status === 'completed') {
      const { userId } = context.params;
      const enrollmentId = context.params.enrollmentId;

      try {
        // Get user data
        const userDoc = await db.collection('edutech_users').doc(userId).get();
        if (!userDoc.exists) {
          throw new Error(`User ${userId} not found`);
        }
        const userData = userDoc.data();

        // Get course data
        const courseDoc = await db.collection('edutech_courses').doc(after.courseId).get();
        if (!courseDoc.exists) {
          throw new Error(`Course ${after.courseId} not found`);
        }
        const courseData = courseDoc.data();

        // Generate verification code
        const verificationCode = generateVerificationCode();

        // Create certificate document
        const certificateRef = db.collection('edutech_certificates').doc();
        const certificateData: CertificateData = {
          certificateId: certificateRef.id,
          userId,
          userName: userData?.displayName || 'Learner',
          courseId: after.courseId,
          courseTitle: courseData?.title || 'Course',
          completedAt: after.completedAt || admin.firestore.Timestamp.now(),
          verificationCode,
          instructorName: courseData?.instructorName,
          courseDuration: courseData?.estimatedHours
            ? `${courseData.estimatedHours} hours`
            : undefined,
        };

        await certificateRef.set(certificateData);

        // Generate PDF certificate
        const pdfBuffer = await generateCertificatePDF(certificateData);

        // Upload to Firebase Storage
        const bucket = admin.storage().bucket();
        const fileName = `certificates/${userId}/${certificateRef.id}.pdf`;
        const file = bucket.file(fileName);

        await file.save(pdfBuffer, {
          metadata: {
            contentType: 'application/pdf',
            metadata: {
              certificateId: certificateRef.id,
              userId,
              courseId: after.courseId,
            },
          },
        });

        // Make file publicly readable (for download)
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        // Update certificate with PDF URL
        await certificateRef.update({
          pdfUrl: publicUrl,
        });

        // Send congratulations email
        await sendCongratulationsEmail(certificateData, publicUrl);

        functions.logger.info(
          `Certificate ${certificateRef.id} generated for user ${userId}`
        );
      } catch (error) {
        functions.logger.error('Error generating certificate:', error);
        throw error;
      }
    }
  });

/**
 * Generate a unique verification code
 */
function generateVerificationCode(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomStr}`.toUpperCase();
}

/**
 * Generate PDF certificate using pdf-lib
 */
async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape

  // Load fonts
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();

  // Draw border
  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: rgb(0.1, 0.2, 0.5), // Allied iMpact blue
    borderWidth: 3,
  });

  page.drawRectangle({
    x: 40,
    y: 40,
    width: width - 80,
    height: height - 80,
    borderColor: rgb(0.1, 0.2, 0.5),
    borderWidth: 1,
  });

  // Title
  page.drawText('CERTIFICATE OF COMPLETION', {
    x: width / 2 - 250,
    y: height - 100,
    size: 36,
    font: timesRomanBold,
    color: rgb(0.1, 0.2, 0.5),
  });

  // Subtitle
  page.drawText('This certifies that', {
    x: width / 2 - 70,
    y: height - 160,
    size: 16,
    font: timesRoman,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Learner name
  page.drawText(data.userName, {
    x: width / 2 - (data.userName.length * 12),
    y: height - 210,
    size: 32,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });

  // Name underline
  page.drawLine({
    start: { x: 150, y: height - 220 },
    end: { x: width - 150, y: height - 220 },
    thickness: 2,
    color: rgb(0.1, 0.2, 0.5),
  });

  // Completion text
  page.drawText('has successfully completed the course', {
    x: width / 2 - 145,
    y: height - 260,
    size: 16,
    font: timesRoman,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Course title
  const courseTitle = data.courseTitle;
  const courseTitleWidth = courseTitle.length * 10;
  page.drawText(courseTitle, {
    x: width / 2 - courseTitleWidth / 2,
    y: height - 300,
    size: 24,
    font: timesRomanBold,
    color: rgb(0.1, 0.2, 0.5),
  });

  // Course duration (if available)
  if (data.courseDuration) {
    page.drawText(`Duration: ${data.courseDuration}`, {
      x: width / 2 - 60,
      y: height - 330,
      size: 12,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  // Date
  const completedDate = data.completedAt.toDate().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  page.drawText(`Completed on: ${completedDate}`, {
    x: width / 2 - 80,
    y: height - 380,
    size: 14,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Instructor signature (if available)
  if (data.instructorName) {
    page.drawText(data.instructorName, {
      x: 150,
      y: 120,
      size: 14,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    page.drawLine({
      start: { x: 150, y: 115 },
      end: { x: 300, y: 115 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    page.drawText('Course Instructor', {
      x: 150,
      y: 100,
      size: 10,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // Company signature
  page.drawText('Allied iMpact', {
    x: width - 300,
    y: 120,
    size: 14,
    font: timesRomanBold,
    color: rgb(0.1, 0.2, 0.5),
  });
  page.drawLine({
    start: { x: width - 300, y: 115 },
    end: { x: width - 150, y: 115 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawText('Education Platform', {
    x: width - 300,
    y: 100,
    size: 10,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Generate QR code for verification
  const verificationUrl = `https://edutech.alliedimpact.com/verify/${data.verificationCode}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 80,
    margin: 1,
  });

  // Embed QR code (base64 to PNG)
  const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);
  page.drawImage(qrCodeImage, {
    x: width / 2 - 40,
    y: 80,
    width: 80,
    height: 80,
  });

  // Verification code text
  page.drawText(`Verification Code: ${data.verificationCode}`, {
    x: width / 2 - 100,
    y: 60,
    size: 8,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText('Scan QR code to verify authenticity', {
    x: width / 2 - 85,
    y: 45,
    size: 8,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Send congratulations email
 */
async function sendCongratulationsEmail(
  data: CertificateData,
  pdfUrl: string
): Promise<void> {
  // TODO: Integrate with @allied-impact/notifications or SendGrid
  functions.logger.info(
    `Would send congratulations email to user ${data.userId} for course ${data.courseTitle}`
  );

  // Email template would include:
  // - Congratulations message
  // - Course details
  // - Certificate download link
  // - Next steps (explore more courses, share on LinkedIn, etc.)
  // - CTA to view certificate online

  // Example implementation:
  /*
  await sendEmail({
    to: userEmail,
    subject: `Congratulations! You've completed ${data.courseTitle}`,
    html: `
      <h1>Congratulations, ${data.userName}!</h1>
      <p>You've successfully completed ${data.courseTitle}.</p>
      <p>Your certificate is ready!</p>
      <a href="${pdfUrl}">Download Certificate</a>
      <a href="https://edutech.alliedimpact.com/certificates/${data.certificateId}">View Online</a>
    `,
  });
  */
}

/**
 * HTTP Function: Verify Certificate
 * GET /verifyCertificate?code=XXXXX
 */
export const verifyCertificate = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const verificationCode = req.query.code as string;

  if (!verificationCode) {
    res.status(400).json({ error: 'Verification code is required' });
    return;
  }

  try {
    const certificatesRef = db.collection('edutech_certificates');
    const snapshot = await certificatesRef
      .where('verificationCode', '==', verificationCode.toUpperCase())
      .limit(1)
      .get();

    if (snapshot.empty) {
      res.status(404).json({ valid: false, error: 'Certificate not found' });
      return;
    }

    const certificateDoc = snapshot.docs[0];
    const certificateData = certificateDoc.data();

    res.status(200).json({
      valid: true,
      certificate: {
        certificateId: certificateDoc.id,
        userName: certificateData.userName,
        courseTitle: certificateData.courseTitle,
        completedAt: certificateData.completedAt.toDate().toISOString(),
        verificationCode: certificateData.verificationCode,
      },
    });
  } catch (error) {
    functions.logger.error('Error verifying certificate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * HTTP Function: Regenerate Certificate PDF
 * POST /regenerateCertificate
 * Body: { certificateId: string }
 */
export const regenerateCertificate = functions.https.onCall(
  async (data, context) => {
    // Require authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { certificateId } = data;

    if (!certificateId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Certificate ID is required'
      );
    }

    try {
      const certificateDoc = await db
        .collection('edutech_certificates')
        .doc(certificateId)
        .get();

      if (!certificateDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Certificate not found');
      }

      const certificateData = certificateDoc.data() as CertificateData;

      // Verify user owns this certificate
      if (certificateData.userId !== context.auth.uid) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'You do not own this certificate'
        );
      }

      // Regenerate PDF
      const pdfBuffer = await generateCertificatePDF(certificateData);

      // Upload to Storage
      const bucket = admin.storage().bucket();
      const fileName = `certificates/${certificateData.userId}/${certificateId}.pdf`;
      const file = bucket.file(fileName);

      await file.save(pdfBuffer, {
        metadata: {
          contentType: 'application/pdf',
        },
      });

      await file.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      // Update certificate
      await certificateDoc.ref.update({ pdfUrl: publicUrl });

      return { success: true, pdfUrl: publicUrl };
    } catch (error) {
      functions.logger.error('Error regenerating certificate:', error);
      throw new functions.https.HttpsError('internal', 'Failed to regenerate certificate');
    }
  }
);
