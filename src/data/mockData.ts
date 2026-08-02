// ============================================
// CampusNest Mock Data
// Nigerian university student housing listings
// ============================================

export interface University {
  id: string;
  name: string;
  shortName: string;
  state: string;
  areas: string[];
  lat: number;
  lng: number;
}

export interface Landlord {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  rating: number;
  totalListings: number;
  responseTime: string;
  joinedDate: string;
}

export interface ListingReview {
  id: string;
  authorName: string;
  authorAvatar: string;
  verifiedTenant: boolean;
  rating: number;
  comment: string;
  date: string;
}

export interface ListingPost {
  id: string;
  type: 'listing';
  landlord: Landlord;
  university: University;
  area: string;
  title: string;
  description: string;
  price: number;
  priceLabel: string;
  roomType: string;
  images: string[];
  amenities: string[];
  likes: number;
  comments: number;
  saves: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  distance: string;
  distanceKm: number;
  lat: number;
  lng: number;
  videoUrl?: string;
  houseRules: string[];
  reviews: ListingReview[];
}

export interface ReviewPost {
  id: string;
  type: 'review';
  author: {
    name: string;
    avatar: string;
    university: string;
  };
  landlordName: string;
  area: string;
  university: University;
  rating: number;
  title: string;
  content: string;
  images: string[];
  likes: number;
  comments: number;
  createdAt: string;
  isLiked: boolean;
  isVerifiedTenant: boolean;
}

export interface RoommatePost {
  id: string;
  type: 'roommate-request';
  author: {
    name: string;
    avatar: string;
    university: string;
    level: string;
    department: string;
  };
  university: University;
  area: string;
  budget: number;
  title: string;
  description: string;
  preferences: string[];
  likes: number;
  comments: number;
  createdAt: string;
  isLiked: boolean;
}

export type FeedPost = ListingPost | ReviewPost | RoommatePost;

// ============================================
// Nigerian Universities
// ============================================
export const universities: University[] = [
  {
    id: 'unilag',
    name: 'University of Lagos',
    shortName: 'UNILAG',
    state: 'Lagos',
    areas: ['Akoka', 'Yaba', 'Bariga', 'Onike', 'Abule-Oja', 'Iwaya'],
    lat: 6.5158,
    lng: 3.3898,
  },
  {
    id: 'ui',
    name: 'University of Ibadan',
    shortName: 'UI',
    state: 'Oyo',
    areas: ['Bodija', 'Mokola', 'Agbowo', 'Sango', 'Ojoo', 'Samonda'],
    lat: 7.4400,
    lng: 3.9000,
  },
  {
    id: 'oau',
    name: 'Obafemi Awolowo University',
    shortName: 'OAU',
    state: 'Osun',
    areas: ['Ile-Ife', 'Mayfair', 'Road 7', 'Opa', 'Modakeke'],
    lat: 7.5200,
    lng: 4.5200,
  },
  {
    id: 'abu',
    name: 'Ahmadu Bello University',
    shortName: 'ABU',
    state: 'Kaduna',
    areas: ['Samaru', 'Zaria', 'Sabon Gari', 'Kongo'],
    lat: 11.1500,
    lng: 7.6500,
  },
  {
    id: 'unn',
    name: 'University of Nigeria',
    shortName: 'UNN',
    state: 'Enugu',
    areas: ['Nsukka', 'Odenigbo', 'Hilltop', 'Onuiyi'],
    lat: 6.8600,
    lng: 7.3900,
  },
  {
    id: 'covenant',
    name: 'Covenant University',
    shortName: 'CU',
    state: 'Ogun',
    areas: ['Canaan Land', 'Ota', 'Sango-Ota'],
    lat: 6.6720,
    lng: 3.1580,
  },
  {
    id: 'lasu',
    name: 'Lagos State University',
    shortName: 'LASU',
    state: 'Lagos',
    areas: ['Ojo', 'Alaba', 'Igando', 'Isheri'],
    lat: 6.4570,
    lng: 3.2010,
  },
  {
    id: 'futa',
    name: 'Federal University of Technology, Akure',
    shortName: 'FUTA',
    state: 'Ondo',
    areas: ['Aule', 'FUTA South Gate', 'Obele', 'Ijapo'],
    lat: 7.3000,
    lng: 5.1350,
  },
  {
    id: 'unilorin',
    name: 'University of Ilorin',
    shortName: 'UNILORIN',
    state: 'Kwara',
    areas: ['Tanke', 'Gate', 'Pipeline', 'Tipper Garage'],
    lat: 8.4800,
    lng: 4.5400,
  },
  {
    id: 'uniben',
    name: 'University of Benin',
    shortName: 'UNIBEN',
    state: 'Edo',
    areas: ['Ekosodin', 'Osasogie', 'BDPA', 'Ugbowo'],
    lat: 6.3980,
    lng: 5.6120,
  },
];

// ============================================
// Mock Landlords
// ============================================
const landlords: Landlord[] = [
  {
    id: 'l1',
    name: 'Chief Adebayo Properties',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isVerified: true,
    rating: 4.8,
    totalListings: 12,
    responseTime: 'Usually responds within 1hr',
    joinedDate: 'March 2021',
  },
  {
    id: 'l2',
    name: 'Mrs. Okonkwo Realty',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    isVerified: true,
    rating: 4.9,
    totalListings: 8,
    responseTime: 'Usually responds within 30min',
    joinedDate: 'September 2022',
  },
  {
    id: 'l3',
    name: 'Emeka Housing',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isVerified: false,
    rating: 4.2,
    totalListings: 5,
    responseTime: 'Usually responds within 2hrs',
    joinedDate: 'January 2023',
  },
  {
    id: 'l4',
    name: 'Alhaji Musa Estates',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    isVerified: true,
    rating: 4.6,
    totalListings: 20,
    responseTime: 'Usually responds within 45min',
    joinedDate: 'June 2020',
  },
  {
    id: 'l5',
    name: 'Ngozi Homes Ltd',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isVerified: true,
    rating: 4.7,
    totalListings: 15,
    responseTime: 'Usually responds within 1hr',
    joinedDate: 'November 2021',
  },
  {
    id: 'l6',
    name: 'Kalu & Sons Agency',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    isVerified: false,
    rating: 3.9,
    totalListings: 3,
    responseTime: 'Usually responds within 3hrs',
    joinedDate: 'May 2023',
  },
  {
    id: 'l7',
    name: 'Folashade Apartments',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face',
    isVerified: true,
    rating: 4.5,
    totalListings: 9,
    responseTime: 'Usually responds within 1hr',
    joinedDate: 'February 2022',
  },
];

// ============================================
// Room images — curated apartment/housing photos
// ============================================
const roomImages = [
  [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&h=600&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800&h=600&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560449752-b2523bdafdb3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1598928506311-c55ez9e4babe?w=800&h=600&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600573472591-ee6981cf81d6?w=800&h=600&fit=crop',
  ],
];

const roomTypes = ['Self-Contain', 'Shared Room', '1-Bedroom', 'Mini Flat', '2-Bedroom', 'Hostel Bed', 'Studio'];
const amenitiesList = ['WiFi', 'Water Supply', '24/7 Security', 'Generator', 'Inverter', 'Tiled Floors', 'POP Ceiling', 'Wardrobe', 'Kitchen', 'Bathroom (En-suite)', 'Parking', 'DSTV', 'Prepaid Meter', 'Gated Compound', 'Close to Campus'];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomDate(daysBack: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return date.toISOString();
}

// ============================================
// Generate Listing Posts
// ============================================
// ============================================
// Generate Listing Posts
// ============================================
const listingDescriptions = [
  'Spacious and well-ventilated room in a serene environment, perfect for serious students. Very close to the main gate, easy access to campus.',
  'Newly renovated apartment with modern finishes. Constant water supply and 24/7 security. Prepaid meter available — no crazy light bills!',
  'Clean and affordable lodge in a quiet neighbourhood. The landlord is very understanding and maintenance is prompt. Highly recommended for students.',
  'Luxury self-contain with tiled floors, POP ceiling, and en-suite bathroom. Generator backup and inverter system included in the rent.',
  'Cozy shared room ideal for students on a budget. The compound is well-maintained with a security guard. Walking distance to lecture halls.',
  'Beautiful mini flat with a separate kitchen and living area. Gated compound with parking space. Very peaceful environment for studying.',
  'Brand new hostel with excellent facilities. Each room has its own bathroom and wardrobe. WiFi included. First come, first served!',
  'Affordable 1-bedroom apartment near campus. Recently painted with new fittings. Landlord provides generator during power outages. Serious students only.',
  'Executive self-contain in a prime location. Fully furnished with AC, fridge, and bed. Perfect for final year students and postgraduates.',
  'Comfortable studio apartment with kitchenette. Water runs 24/7, prepaid meter installed. 5 minutes walk from the campus main gate.',
];

const mockHouseRules = [
  ['No loud music after 10 PM', 'No painting of walls without permission', 'Maintain cleanliness in common areas', 'Guests must depart by 11 PM', 'No pets allowed'],
  ['Prepaid token to be shared among flatmates', 'Gate is locked at 11:30 PM daily', 'Proper disposal of refuse is mandatory', 'No commercial activities in the premises'],
  ['No subletting of rooms', 'Quiet hours from 9 PM to 6 AM', 'Keep keycards secure — replacement fee applies', 'Report maintenance issues immediately'],
];

const mockReviewsList: ListingReview[] = [
  { id: 'r-1', authorName: 'Chioma N.', authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', verifiedTenant: true, rating: 5, comment: 'Amazing place! The water is constant and generator schedule is strictly followed. Highly recommended.', date: '2026-05-15T10:30:00Z' },
  { id: 'r-2', authorName: 'Babajide A.', authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', verifiedTenant: true, rating: 4, comment: 'Very close to UNILAG gate. Clean flat and Mrs. Okonkwo responds to issues fast.', date: '2026-06-01T14:20:00Z' },
  { id: 'r-3', authorName: 'Fatima Z.', authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', verifiedTenant: false, rating: 3, comment: 'Lodge is decent but the security guard can be strict about guest hours. Still a okay place.', date: '2026-04-20T09:15:00Z' },
  { id: 'r-4', authorName: 'Victor E.', authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', verifiedTenant: true, rating: 5, comment: 'Perfect self-contain. Prepaid meter is in the room so i manage my consumption. Zero light issues!', date: '2026-07-10T18:45:00Z' },
];

function generateListings(): ListingPost[] {
  const listings: ListingPost[] = [];
  const prices = [80000, 120000, 150000, 180000, 200000, 250000, 300000, 350000, 400000, 450000, 500000, 600000, 700000, 150000, 100000, 250000, 180000, 220000, 280000, 320000, 380000, 160000, 200000, 270000, 190000, 420000, 550000, 130000, 170000, 240000, 350000, 280000];

  for (let i = 0; i < 32; i++) {
    const uni = universities[i % universities.length];
    const landlord = landlords[i % landlords.length];
    const roomType = roomTypes[i % roomTypes.length];
    const images = roomImages[i % roomImages.length];
    const price = prices[i % prices.length];
    const area = uni.areas[i % uni.areas.length];

    // Seeding: every 5th listing (index % 5 === 0) has 0 reviews to test empty review state
    const reviews = i % 5 === 0 ? [] : pickRandom(mockReviewsList, 1 + (i % 3));
    const rules = mockHouseRules[i % mockHouseRules.length];

    listings.push({
      id: `listing-${i + 1}`,
      type: 'listing',
      landlord,
      university: uni,
      area,
      title: `${roomType} Available in ${area}`,
      description: listingDescriptions[i % listingDescriptions.length],
      price,
      priceLabel: '/year',
      roomType,
      images,
      amenities: pickRandom(amenitiesList, 4 + Math.floor(Math.random() * 5)),
      likes: Math.floor(Math.random() * 200) + 10,
      comments: Math.floor(Math.random() * 30) + 1,
      saves: Math.floor(Math.random() * 80) + 5,
      isLiked: Math.random() > 0.7,
      isSaved: Math.random() > 0.8,
      createdAt: randomDate(30),
      distance: `${(Math.random() * 3 + 0.2).toFixed(1)}km from campus`,
      distanceKm: parseFloat((Math.random() * 3 + 0.2).toFixed(1)),
      lat: uni.lat + (Math.random() - 0.5) * 0.04,
      lng: uni.lng + (Math.random() - 0.5) * 0.04,
      videoUrl: i % 3 === 0 ? 'https://assets.mixkit.co/videos/preview/mixkit-kitchen-in-an-apartment-40099-large.mp4' : undefined,
      houseRules: rules,
      reviews: reviews,
    });
  }
  return listings;
}

// ============================================
// Generate Review Posts
// ============================================
function generateReviews(): ReviewPost[] {
  const reviewAuthors = [
    { name: 'Chinwe A.', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face', university: 'UNILAG' },
    { name: 'Tunde O.', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face', university: 'UI' },
    { name: 'Amara E.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', university: 'OAU' },
    { name: 'Ibrahim M.', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face', university: 'ABU' },
    { name: 'Blessing N.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', university: 'UNN' },
    { name: 'Femi J.', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face', university: 'LASU' },
  ];

  const reviews: ReviewPost[] = [
    {
      id: 'review-1',
      type: 'review',
      author: reviewAuthors[0],
      landlordName: 'Chief Adebayo Properties',
      area: 'Akoka',
      university: universities[0],
      rating: 5,
      title: 'Best lodge experience in Akoka! 🏠',
      content: 'I stayed here for 2 years and it was amazing. The water supply is constant, the generator comes on immediately NEPA takes light, and the security is tight. Chief Adebayo is a good landlord — very responsive to complaints. I\'d recommend this to any UNILAG student!',
      images: [roomImages[0][0], roomImages[0][1]],
      likes: 45,
      comments: 12,
      createdAt: randomDate(14),
      isLiked: false,
      isVerifiedTenant: true,
    },
    {
      id: 'review-2',
      type: 'review',
      author: reviewAuthors[1],
      landlordName: 'Mrs. Okonkwo Realty',
      area: 'Bodija',
      university: universities[1],
      rating: 4,
      title: 'Good lodge, minor issues with plumbing',
      content: 'Overall a solid place to stay near UI. The rooms are spacious and clean. Only issue was the plumbing — took a while to fix. But the location is unbeatable, very close to Bodija market and campus. Fair price too.',
      images: [roomImages[1][0]],
      likes: 28,
      comments: 8,
      createdAt: randomDate(7),
      isLiked: true,
      isVerifiedTenant: true,
    },
    {
      id: 'review-3',
      type: 'review',
      author: reviewAuthors[2],
      landlordName: 'Emeka Housing',
      area: 'Ile-Ife',
      university: universities[2],
      rating: 3,
      title: 'Decent but needs improvement',
      content: 'The lodge is okay for the price. Location is close to OAU campus which is great. However, the generator doesn\'t come on regularly and water supply can be inconsistent. The rooms themselves are fine though.',
      images: [],
      likes: 15,
      comments: 6,
      createdAt: randomDate(21),
      isLiked: false,
      isVerifiedTenant: false,
    },
    {
      id: 'review-4',
      type: 'review',
      author: reviewAuthors[3],
      landlordName: 'Alhaji Musa Estates',
      area: 'Samaru',
      university: universities[3],
      rating: 5,
      title: 'Excellent accommodation! Highly recommend 💯',
      content: 'Alhaji Musa provides the best student housing in Samaru. The compound is very secure, rooms are well-built, and the rent is reasonable. He even helped me move in. This is where you want to stay if you\'re at ABU.',
      images: [roomImages[3][0], roomImages[3][1], roomImages[3][2]],
      likes: 67,
      comments: 19,
      createdAt: randomDate(5),
      isLiked: false,
      isVerifiedTenant: true,
    },
    {
      id: 'review-5',
      type: 'review',
      author: reviewAuthors[4],
      landlordName: 'Ngozi Homes Ltd',
      area: 'Nsukka',
      university: universities[4],
      rating: 4,
      title: 'Comfortable stay near UNN campus',
      content: 'Living here was a pleasant experience. Clean environment, steady water, and the landlady is very approachable. The only downside is that it\'s a bit far from the main market, but campus is just a 10-minute walk.',
      images: [roomImages[4][0]],
      likes: 33,
      comments: 7,
      createdAt: randomDate(10),
      isLiked: false,
      isVerifiedTenant: true,
    },
  ];

  return reviews;
}

// ============================================
// Generate Roommate Request Posts
// ============================================
function generateRoommateRequests(): RoommatePost[] {
  return [
    {
      id: 'roommate-1',
      type: 'roommate-request',
      author: {
        name: 'David C.',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        university: 'UNILAG',
        level: '300 Level',
        department: 'Computer Science',
      },
      university: universities[0],
      area: 'Akoka / Yaba',
      budget: 150000,
      title: 'Looking for a roommate in Akoka 🏘️',
      description: 'I\'m a 300-level Computer Science student looking for a clean, serious roommate to share a self-contain in Akoka. I already found a nice place for ₦300k/yr and I need someone to split the rent. No night crawlers please! 😄',
      preferences: ['Non-smoker', 'Quiet', 'Clean', 'Serious student'],
      likes: 34,
      comments: 15,
      createdAt: randomDate(3),
      isLiked: false,
    },
    {
      id: 'roommate-2',
      type: 'roommate-request',
      author: {
        name: 'Khadija A.',
        avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
        university: 'ABU',
        level: '200 Level',
        department: 'Medicine',
      },
      university: universities[3],
      area: 'Samaru',
      budget: 100000,
      title: 'Female roommate needed in Samaru',
      description: 'Medical student looking for a female roommate to share a 2-bedroom flat in Samaru. The apartment already has WiFi and a reading area. I\'m quiet and studious — perfect for another med or science student.',
      preferences: ['Female only', 'Studious', 'Respectful', 'Clean'],
      likes: 22,
      comments: 9,
      createdAt: randomDate(2),
      isLiked: false,
    },
    {
      id: 'roommate-3',
      type: 'roommate-request',
      author: {
        name: 'Emeka O.',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
        university: 'UNIBEN',
        level: '400 Level',
        department: 'Engineering',
      },
      university: universities[9],
      area: 'Ekosodin',
      budget: 120000,
      title: 'Roommate wanted near UNIBEN 🔧',
      description: 'Final year Engineering student. I have a 1-bedroom in Ekosodin with space for one more person. We\'d share the living area and kitchen. Rent is ₦240k/yr total. Generator and water available. Let\'s link up!',
      preferences: ['Male preferred', 'No parties', 'Tidy', 'Respectful'],
      likes: 18,
      comments: 7,
      createdAt: randomDate(5),
      isLiked: false,
    },
  ];
}

// ============================================
// Generate Mixed Feed
// ============================================
export function generateFeed(): FeedPost[] {
  const listings = generateListings();
  const reviews = generateReviews();
  const roommates = generateRoommateRequests();

  // Mix all posts together like a social feed
  const feed: FeedPost[] = [];
  let listingIdx = 0;
  let reviewIdx = 0;
  let roommateIdx = 0;

  // Pattern: 3 listings, 1 review, 2 listings, 1 roommate, repeat
  while (listingIdx < listings.length) {
    // 3 listings
    for (let i = 0; i < 3 && listingIdx < listings.length; i++) {
      feed.push(listings[listingIdx++]);
    }
    // 1 review
    if (reviewIdx < reviews.length) {
      feed.push(reviews[reviewIdx++]);
    }
    // 2 listings
    for (let i = 0; i < 2 && listingIdx < listings.length; i++) {
      feed.push(listings[listingIdx++]);
    }
    // 1 roommate
    if (roommateIdx < roommates.length) {
      feed.push(roommates[roommateIdx++]);
    }
  }

  return feed;
}

// Pre-generated feed for consistent hydration
export const mockFeed = generateFeed();
