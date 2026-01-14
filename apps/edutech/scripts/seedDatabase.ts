/**
 * Firestore Database Seeding Script
 * 
 * Run this script to populate Firestore with initial course data.
 * Usage: node scripts/seedDatabase.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { computerSkillsCourses } from '../src/data/seedCourses';
import { codingCourses } from '../src/data/seedCoursesCoding';

// Firebase configuration - update with your project credentials
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Generate unique course ID from title
 */
function generateCourseId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

/**
 * Seed courses to Firestore
 */
async function seedCourses() {
  console.log('🌱 Starting database seeding...\n');

  const allCourses = [...computerSkillsCourses, ...codingCourses];
  const timestamp = new Date();

  let successCount = 0;
  let errorCount = 0;

  for (const courseData of allCourses) {
    try {
      const courseId = generateCourseId(courseData.title);
      
      const course = {
        ...courseData,
        courseId,
        createdAt: timestamp,
        updatedAt: timestamp,
        publishedAt: timestamp,
      };

      await setDoc(doc(db, 'edutech_courses', courseId), course);
      
      console.log(`✅ Created: ${course.title} (${courseId})`);
      successCount++;
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Failed to create ${courseData.title}:`, error);
      errorCount++;
    }
  }

  console.log(`\n📊 Seeding completed!`);
  console.log(`   ✅ Success: ${successCount} courses`);
  console.log(`   ❌ Failed: ${errorCount} courses`);
  console.log(`   📚 Total: ${allCourses.length} courses\n`);
}

/**
 * Create first system admin user
 * Run this after creating your first user via Firebase Auth
 */
async function createFirstAdmin(userId: string, email: string, displayName: string) {
  console.log('👤 Creating system admin user...\n');

  try {
    const adminUser = {
      userId,
      email,
      displayName,
      role: 'system_admin',
      productAccess: ['edutech'],
      products: {
        edutech: {
          role: 'system_admin',
          tier: 'PREMIUM',
          active: true,
          grantedAt: new Date(),
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'edutech_users', userId), adminUser);
    console.log(`✅ System admin created: ${displayName} (${email})`);
  } catch (error) {
    console.error(`❌ Failed to create admin:`, error);
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'seed-courses':
      await seedCourses();
      break;
    
    case 'create-admin':
      const [userId, email, displayName] = args.slice(1);
      if (!userId || !email || !displayName) {
        console.error('❌ Usage: node seedDatabase.js create-admin <userId> <email> <displayName>');
        process.exit(1);
      }
      await createFirstAdmin(userId, email, displayName);
      break;
    
    case 'seed-all':
      await seedCourses();
      console.log('\n⚠️  Remember to create admin user manually:');
      console.log('   node seedDatabase.js create-admin <userId> <email> <name>\n');
      break;
    
    default:
      console.log(`
EduTech Database Seeding Script
================================

Commands:
  seed-courses              Seed all course data
  create-admin <id> <email> <name>  Create first system admin
  seed-all                  Seed everything

Examples:
  node seedDatabase.js seed-courses
  node seedDatabase.js create-admin abc123 admin@example.com "John Doe"
  node seedDatabase.js seed-all
      `);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
