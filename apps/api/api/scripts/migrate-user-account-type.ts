import * as path from 'node:path';
import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/barber-reservation';

async function migrate() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const usersCollection = db.collection('users');
    const membershipsCollection = db.collection('memberships');

    const users = await usersCollection.find({}).toArray();
    console.log(`Found ${users.length} users`);

    let updatedCount = 0;
    let skippedExistingCount = 0;
    let skippedNoMembershipCount = 0;

    for (const user of users) {
      if (user.accountType) {
        skippedExistingCount += 1;
        console.log(`Skipping ${user.email}: already has accountType=${user.accountType}`);
        continue;
      }

      const membershipsCount = await membershipsCollection.countDocuments({
        userId: user._id.toString(),
      });

      if (membershipsCount > 0) {
        await usersCollection.updateOne({ _id: user._id }, { $set: { accountType: 'internal' } });

        updatedCount += 1;
        console.log(`Updated ${user.email}: set accountType=internal`);
      } else {
        skippedNoMembershipCount += 1;
        console.log(`Skipping ${user.email}: no memberships found`);
      }
    }

    console.log('Migration completed successfully');
    console.log(`Updated users: ${updatedCount}`);
    console.log(`Skipped existing: ${skippedExistingCount}`);
    console.log(`Skipped without memberships: ${skippedNoMembershipCount}`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

void migrate();
