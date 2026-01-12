import * as functions from './generateCertificate';

// Export all Cloud Functions
export const onCourseComplete = functions.onCourseComplete;
export const verifyCertificate = functions.verifyCertificate;
export const regenerateCertificate = functions.regenerateCertificate;
