import 'dotenv/config';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seedData.js';

async function seed() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== 'true') {
    console.error('Refusing to seed: NODE_ENV=production. Set ALLOW_SEED=true only if you intend to wipe data.');
    process.exit(1);
  }

  await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hustlelane');
  await seedDatabase({ wipe: true });

  console.log('\nHustleLane seed complete.\n');
  console.log('Demo logins (password: demo1234):');
  console.log('  seeker  nomsa@hustlelane.dev');
  console.log('  poster  kagiso@hustlelane.dev');
  console.log('  poster  farah@hustlelane.dev\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
