import { Role, PostType, MessageStatus } from '@prisma/client';
import { prisma } from '../src/lib/prisma';
import { universities, mockUsers, mockFeed } from '../src/data/mockData';

function extractProjectRef(databaseUrl?: string): string | null {
  if (!databaseUrl) return null;
  try {
    const parsed = new URL(databaseUrl);
    if (parsed.username && parsed.username.startsWith('postgres.')) {
      return parsed.username.split('.')[1] || null;
    }
  } catch {
    // fallback regex
  }
  const match = databaseUrl.match(/postgres\.([a-zA-Z0-9_-]+):/);
  return match ? match[1] : null;
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ SEED ABORTED: Cannot run database seed script in production environment!');
    process.exit(1);
  }

  if (process.env.ALLOW_SEED !== 'true') {
    console.error('❌ SEED ABORTED: ALLOW_SEED=true is required to run the seed script.');
    console.error('To seed your development database, run: ALLOW_SEED=true npm run db:seed');
    process.exit(1);
  }

  const allowedProjectRef = process.env.SEED_ALLOWED_PROJECT_REF;
  if (!allowedProjectRef) {
    console.error('❌ SEED ABORTED: SEED_ALLOWED_PROJECT_REF is required in .env.local to prevent seeding the wrong database.');
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;
  const dbProjectRef = extractProjectRef(dbUrl);

  if (!dbProjectRef || dbProjectRef !== allowedProjectRef) {
    console.error('❌ SEED ABORTED: Project ref in DATABASE_URL does not match SEED_ALLOWED_PROJECT_REF.');
    console.error(`   Allowed ref: ${allowedProjectRef}`);
    console.error(`   Detected ref: ${dbProjectRef ?? 'unknown'}`);
    process.exit(1);
  }

  console.log(`✅ Seed guard verified for project ref: [${dbProjectRef}]`);
  console.log('Clearing database...');
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.savedListing.deleteMany();
  await prisma.post.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();
  await prisma.university.deleteMany();

  console.log('Seeding universities...');
  for (const uni of universities) {
    await prisma.university.create({
      data: {
        id: uni.id,
        name: uni.name,
        shortName: uni.shortName,
        state: uni.state,
        areas: uni.areas,
        lat: uni.lat,
        lng: uni.lng,
      },
    });
  }

  console.log('Seeding users...');
  for (const user of mockUsers) {
    const isLandlord = user.role === 'landlord';
    await prisma.user.create({
      data: {
        id: user.id,
        email: `${user.id}@campusnest.com`,
        name: user.name,
        avatarUrl: user.avatar,
        role: isLandlord ? Role.LANDLORD : Role.STUDENT,
        verified: user.isVerified,
        joinedDate: user.joinedDate,
        bio: user.bio,
        responseTime: user.responseTime || null,
        universityId: user.universityId || null,
      },
    });
  }

  // Get list of seeded users to resolve names to IDs
  const dbUsers = await prisma.user.findMany();
  const getUserByName = (name: string): string => {
    const found = dbUsers.find((u) => u.name.toLowerCase().includes(name.toLowerCase()));
    return found ? found.id : 's1'; // Fallback to Chioma ('s1')
  };

  console.log('Seeding listings and reviews...');
  const listingsFromFeed = mockFeed.filter((item) => item.type === 'listing');

  for (const listing of listingsFromFeed) {
    // 1. Create listing
    const createdListing = await prisma.listing.create({
      data: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        priceLabel: listing.priceLabel,
        roomType: listing.roomType,
        lat: listing.lat,
        lng: listing.lng,
        area: listing.area,
        distance: listing.distance,
        distanceKm: listing.distanceKm,
        amenities: listing.amenities,
        houseRules: listing.houseRules,
        images: listing.images,
        videoUrl: listing.videoUrl || null,
        landlordId: listing.landlord.id,
        universityId: listing.university.id,
      },
    });

    // 2. Insert reviews for this listing
    if (listing.reviews && listing.reviews.length > 0) {
      for (const rev of listing.reviews) {
        await prisma.review.create({
          data: {
            listingId: createdListing.id,
            authorId: getUserByName(rev.authorName),
            rating: rev.rating,
            comment: rev.comment,
            verifiedTenant: rev.verifiedTenant,
            createdAt: new Date(rev.date),
          },
        });
      }
    }
  }

  console.log('Seeding saved listings relationships...');
  for (const user of mockUsers) {
    if (user.savedListingIds && user.savedListingIds.length > 0) {
      for (const listingId of user.savedListingIds) {
        // Double check listing exists in database before linking
        const listingExists = await prisma.listing.findUnique({
          where: { id: listingId },
        });
        if (listingExists) {
          await prisma.savedListing.create({
            data: {
              userId: user.id,
              listingId: listingId,
            },
          });
        }
      }
    }
  }

  console.log('Seeding roommate posts and review posts...');
  const roommateRequests = mockFeed.filter((item) => item.type === 'roommate-request');
  const reviewPosts = mockFeed.filter((item) => item.type === 'review');

  for (const post of roommateRequests) {
    await prisma.post.create({
      data: {
        id: post.id,
        type: PostType.ROOMMATE_REQUEST,
        authorId: getUserByName(post.author.name),
        text: post.description || post.title || '',
        title: post.title,
        universityId: post.university.id,
        area: post.area,
        budget: post.budget,
      },
    });
  }

  for (const r of reviewPosts) {
    await prisma.post.create({
      data: {
        id: r.id,
        type: PostType.REVIEW,
        authorId: getUserByName(r.author.name),
        text: r.content || '',
        title: r.title || 'Landlord Review',
        universityId: r.university.id,
        area: r.area,
        rating: r.rating,
        landlordName: r.landlordName,
        images: r.images,
      },
    });
  }

  console.log('Seeding conversation messages...');
  // Seed the c1 conversation (Chioma Nwosu s1 & Chief Adebayo l1)
  const conv1 = await prisma.conversation.create({
    data: {
      id: 'c1',
      participantAId: 's1',
      participantBId: 'l1',
      listingId: 'listing-1',
      lastMessageAt: new Date(Date.now() - 3600000 * 2),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        id: 'm1',
        conversationId: conv1.id,
        senderId: 's1',
        text: 'Hello Chief Adebayo, is the room at Yaba still available?',
        createdAt: new Date(Date.now() - 3600000 * 2.5),
        status: MessageStatus.READ,
      },
      {
        id: 'm2',
        conversationId: conv1.id,
        senderId: 'l1',
        text: 'Yes Chioma, the Self-Contain is still available. When would you like to inspect it?',
        createdAt: new Date(Date.now() - 3600000 * 2),
        status: MessageStatus.READ,
      },
    ],
  });

  // Seed c2 conversation (Chioma Nwosu s1 & Mrs Okonkwo l2)
  const conv2 = await prisma.conversation.create({
    data: {
      id: 'c2',
      participantAId: 's1',
      participantBId: 'l2',
      listingId: 'listing-2',
      lastMessageAt: new Date(Date.now() - 3600000 * 24),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        id: 'm3',
        conversationId: conv2.id,
        senderId: 's1',
        text: 'Good day Mrs. Okonkwo, I saw your listing near UI.',
        createdAt: new Date(Date.now() - 3600000 * 25),
        status: MessageStatus.READ,
      },
      {
        id: 'm4',
        conversationId: conv2.id,
        senderId: 'l2',
        text: 'Hello! Yes, that flat is highly sought after. We can schedule a tour tomorrow.',
        createdAt: new Date(Date.now() - 3600000 * 24),
        status: MessageStatus.READ,
      },
    ],
  });

  console.log('Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
