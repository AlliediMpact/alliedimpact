/**
 * Script to mark test user emails as verified
 * Usage: node scripts/verify-test-users.js <email1> <email2> ...
 * Example: node scripts/verify-test-users.js test@example.com test2@example.com
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../secrets/firebase-admin.json');

if (!admin.apps.length) {
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://coinbox-connect.firebaseio.com'
    });
    console.log('✅ Firebase Admin initialized successfully\n');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    console.error('Make sure firebase-admin.json exists in the secrets/ folder\n');
    process.exit(1);
  }
}

async function verifyUserEmail(email) {
  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    if (userRecord.emailVerified) {
      console.log(`ℹ️  User ${email} is already verified`);
      return { success: true, alreadyVerified: true };
    }

    // Update user to mark email as verified
    await admin.auth().updateUser(userRecord.uid, {
      emailVerified: true
    });

    console.log(`✅ Successfully verified email for: ${email}`);
    console.log(`   UID: ${userRecord.uid}`);
    return { success: true, alreadyVerified: false };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ User not found: ${email}`);
    } else {
      console.error(`❌ Error verifying ${email}:`, error.message);
    }
    return { success: false, error: error.message };
  }
}

async function main() {
  const emails = process.argv.slice(2);

  if (emails.length === 0) {
    console.log('Usage: node scripts/verify-test-users.js <email1> <email2> ...');
    console.log('\nExample:');
    console.log('  node scripts/verify-test-users.js test@example.com test2@example.com\n');
    process.exit(1);
  }

  console.log(`🔍 Processing ${emails.length} email(s)...\n`);

  const results = {
    success: 0,
    alreadyVerified: 0,
    failed: 0
  };

  for (const email of emails) {
    const result = await verifyUserEmail(email);
    if (result.success) {
      if (result.alreadyVerified) {
        results.alreadyVerified++;
      } else {
        results.success++;
      }
    } else {
      results.failed++;
    }
    console.log(''); // Empty line between results
  }

  // Summary
  console.log('━'.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Newly verified: ${results.success}`);
  console.log(`   ℹ️  Already verified: ${results.alreadyVerified}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log('━'.repeat(60) + '\n');

  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
