import * as dotenv from 'dotenv';
import * as path from 'path';
import { prisma } from './src/prisma';
import * as readline from 'readline';

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askConfirmation(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function resetDatabase() {
  try {
    const confirmed = await askConfirmation('⚠️  Are you sure you want to delete ALL database data? (yes/no): ');
    
    if (!confirmed) {
      console.log('❌ Database reset cancelled.');
      process.exit(0);
    }

    console.log('🗑️  Deleting all data...');
    
    await prisma.watchlist.deleteMany({});
    console.log('✓ Watchlist cleared');
    
    await prisma.account.deleteMany({});
    console.log('✓ Accounts cleared');
    
    await prisma.session.deleteMany({});
    console.log('✓ Sessions cleared');
    
    await prisma.verification.deleteMany({});
    console.log('✓ Verifications cleared');
    
    await prisma.user.deleteMany({});
    console.log('✓ Users cleared');
    
    console.log('✅ Database data cleared! Schema preserved.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();
