/**
 * Seed Script: Create CupFinal Project in Firestore
 * 
 * Run this once to initialize the CupFinal project in SportsHub
 * 
 * Usage:
 * 1. Make sure Firebase is configured
 * 2. Run: node seed-cupfinal-project.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedCupFinalProject() {
  try {
    console.log('🌱 Seeding CupFinal project...');

    const projectData = {
      id: 'cupfinal',
      name: 'CupFinal',
      slug: 'cupfinal',
      type: 'voting_tournament',
      description: 'Participatory football tournament voting platform. Have your say in South African football!',
      status: 'published',
      
      // Configuration
      config: {
        requiresWallet: true,
        votingPrice: 200, // R2.00 in cents
        votingEnabled: true,
      },
      
      // Branding (optional - uses SportsHub branding by default)
      logo: null,
      banner: null,
      
      // Metadata
      createdBy: 'system', // Replace with your admin UID
      createdAt: new Date(),
      publishedAt: new Date(),
      archivedAt: null,
      
      // Metrics (initialized)
      participantCount: 0,
      revenueInCents: 0,
    };

    // Create project document
    const projectRef = doc(db, 'sportshub_projects', 'cupfinal');
    await setDoc(projectRef, projectData);

    console.log('✅ CupFinal project created successfully!');
    console.log('📊 Project Details:', {
      id: projectData.id,
      name: projectData.name,
      votingPrice: `R${(projectData.config.votingPrice / 100).toFixed(2)}`,
      status: projectData.status,
    });

    console.log('\n📝 Next Steps:');
    console.log('1. Go to /admin/tournaments to create your first tournament');
    console.log('2. Add voting items (teams, venues, formats)');
    console.log('3. Publish the tournament');
    console.log('4. Users can vote at /tournaments');

  } catch (error) {
    console.error('❌ Error seeding project:', error);
  }
}

// Run the seed function
seedCupFinalProject();
