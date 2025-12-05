// Script to promote a user to admin
// Run with: node scripts/make-admin.mjs your@email.com

import mongoose from 'mongoose'

const MONGODB_URI = 'mongodb://localhost:27017/anvima'

const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('Usage: node scripts/make-admin.mjs your@email.com')
  process.exit(1)
}

async function makeAdmin() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not established')
    }

    const result = await db.collection('users').updateOne(
      { email: email.toLowerCase() },
      { $set: { role: 'admin' } }
    )

    if (result.matchedCount === 0) {
      console.error(`❌ User with email "${email}" not found`)
      console.log('\nRegistered users:')
      const users = await db.collection('users').find({}, { projection: { email: 1, role: 1 } }).toArray()
      users.forEach(u => console.log(`  - ${u.email} (${u.role})`))
    } else if (result.modifiedCount === 0) {
      console.log(`ℹ️  User "${email}" is already an admin`)
    } else {
      console.log(`✅ User "${email}" is now an admin!`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

makeAdmin()
