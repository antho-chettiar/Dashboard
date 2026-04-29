import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // --- Artists ---
  await prisma.artist.createMany({
    data: [
      { id: 'a1', name: 'Arijit Singh', nationality: 'India' },
      { id: 'a2', name: 'Bad Bunny', nationality: 'Puerto Rico' },
      { id: 'a3', name: 'Taylor Swift', nationality: 'USA' },
      { id: 'a4', name: 'Divine', nationality: 'India' },
      { id: 'a5', name: 'Drake', nationality: 'Canada' },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Artists seeded')

  // --- Concerts ---
  await prisma.concert.createMany({
    data: [
      {
        id: 'c1',
        artistId: 'a1',
        concertName: 'Mumbai Live Night',
        concertDate: new Date(),
        city: 'Mumbai',
        state: 'MH',
        country: 'indian',
        venueName: 'Jio World Garden',
        capacity: 10000,
        ticketsSold: 8500,
        avgTicketPrice: 1500,
        totalRevenue: 8500 * 1500,
      },
      {
        id: 'c2',
        artistId: 'a3',
        concertName: 'Eras Tour India',
        concertDate: new Date(),
        city: 'Delhi',
        state: 'DL',
        country: 'international',
        venueName: 'JLN Stadium',
        capacity: 50000,
        ticketsSold: 48000,
        avgTicketPrice: 4000,
        totalRevenue: 48000 * 4000,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Concerts seeded')

  // --- Platform Metrics (THIS FIXES YOUR ERROR) ---
  const platforms = ['INSTAGRAM', 'YOUTUBE', 'SPOTIFY']
  const artistIds = ['a1', 'a2', 'a3', 'a4', 'a5']

  const metricsData = []

  for (let i = 0; i < 6; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)

    for (const artistId of artistIds) {
      for (const platform of platforms) {
        metricsData.push({
          artistId,
          platform, // enum must be uppercase
          metricDate: date,
          followers: BigInt(Math.floor(Math.random() * 1000000 + 50000)),
          streams: BigInt(Math.floor(Math.random() * 5000000)),
        })
      }
    }
  }

  await prisma.platformMetric.createMany({
    data: metricsData,
    skipDuplicates: true,
  })

  console.log('✅ Platform metrics seeded')

  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })