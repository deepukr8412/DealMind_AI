// ===========================================
// Game Products Database
// Pre-defined products available for negotiation
// Each product has dynamic pricing constraints
// ===========================================

const PRODUCTS = [
  {
    name: 'MacBook Pro 16"',
    description: 'Latest Apple MacBook Pro with M3 Pro chip, 18GB RAM, 512GB SSD',
    category: 'electronics',
    image: '💻',
    originalPrice: 2499,
    minPrice: 1800,
    targetPrice: 2100,
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Premium noise-cancelling wireless headphones',
    category: 'electronics',
    image: '🎧',
    originalPrice: 399,
    minPrice: 250,
    targetPrice: 310,
  },
  {
    name: 'iPhone 16 Pro Max',
    description: '256GB, Titanium finish, A18 Pro chip',
    category: 'electronics',
    image: '📱',
    originalPrice: 1199,
    minPrice: 900,
    targetPrice: 1050,
  },
  {
    name: 'Tesla Model 3',
    description: 'Standard Range Plus, Pearl White, Autopilot included',
    category: 'automotive',
    image: '🚗',
    originalPrice: 42990,
    minPrice: 35000,
    targetPrice: 39000,
  },
  {
    name: 'Rolex Submariner',
    description: 'Date 41mm, Oystersteel, Black dial',
    category: 'luxury',
    image: '⌚',
    originalPrice: 10100,
    minPrice: 7500,
    targetPrice: 8800,
  },
  {
    name: 'PS5 Pro Bundle',
    description: 'Console + 2 Controllers + 3 Games',
    category: 'gaming',
    image: '🎮',
    originalPrice: 699,
    minPrice: 480,
    targetPrice: 560,
  },
  {
    name: 'Vintage Guitar',
    description: '1965 Fender Stratocaster, sunburst finish, original pickups',
    category: 'music',
    image: '🎸',
    originalPrice: 15000,
    minPrice: 10000,
    targetPrice: 12500,
  },
  {
    name: 'Diamond Ring',
    description: '2 carat, round brilliant, VS1 clarity, platinum band',
    category: 'jewelry',
    image: '💍',
    originalPrice: 18000,
    minPrice: 12000,
    targetPrice: 15000,
  },
  {
    name: 'Gaming PC Build',
    description: 'RTX 4090, i9-14900K, 64GB DDR5, 2TB NVMe SSD',
    category: 'electronics',
    image: '🖥️',
    originalPrice: 4500,
    minPrice: 3200,
    targetPrice: 3800,
  },
  {
    name: 'Luxury Sneakers',
    description: 'Limited Edition Nike x Off-White Air Jordan 1, Size 10',
    category: 'fashion',
    image: '👟',
    originalPrice: 2500,
    minPrice: 1500,
    targetPrice: 2000,
  },
  {
    name: 'Drone DJI Mavic 3 Pro',
    description: 'Hasselblad camera, 43min flight time, omnidirectional sensing',
    category: 'electronics',
    image: '🚁',
    originalPrice: 2199,
    minPrice: 1600,
    targetPrice: 1900,
  },
  {
    name: 'Antique Vase',
    description: 'Ming Dynasty porcelain vase, authenticated, museum quality',
    category: 'antiques',
    image: '🏺',
    originalPrice: 50000,
    minPrice: 32000,
    targetPrice: 42000,
  },
  {
    name: 'Private Jet Flight',
    description: 'Round-trip private charter, 6 passengers, premium catering included',
    category: 'travel',
    image: '🛩️',
    originalPrice: 25000,
    minPrice: 18000,
    targetPrice: 21500,
  },
  {
    name: 'Luxury Superyacht Charter',
    description: 'Weekly charter for 12 guests, full crew, Mediterranean route',
    category: 'travel',
    image: '🛥️',
    originalPrice: 120000,
    minPrice: 85000,
    targetPrice: 105000,
  },
  {
    name: 'Limited Edition Banksy',
    description: 'Original screenprint, signed, with Pest Control certification',
    category: 'art',
    image: '🖼️',
    originalPrice: 65000,
    minPrice: 45000,
    targetPrice: 55000,
  },
  {
    name: 'Vintage Leica Camera',
    description: 'Leica M3, original lens, mint condition, 1954',
    category: 'photography',
    image: '📷',
    originalPrice: 5500,
    minPrice: 3800,
    targetPrice: 4600,
  },
  {
    name: 'Futuristic AI Assistant',
    description: 'Latest Holographic AI home core, real-time emotion processing',
    category: 'future-tech',
    image: '🤖',
    originalPrice: 8500,
    minPrice: 6000,
    targetPrice: 7200,
  },
  {
    name: 'Grade 1 English Willow Cricket Bat',
    description: 'Premium Grade 1 English Willow, used by professionals. Balanced pick-up, massive sweet spot, and thick edges.',
    category: 'sports',
    image: '🏏',
    originalPrice: 299,
    minPrice: 180,
    targetPrice: 230,
  },
  {
    name: 'PS5 Standard Edition',
    description: 'PlayStation 5 with Ultra HD Blu-ray disc drive. 825GB SSD, DualSense wireless controller included.',
    category: 'gaming',
    image: '🎮',
    originalPrice: 499,
    minPrice: 380,
    targetPrice: 440,
  },
  {
    name: 'iPhone 16 Pro Max (1TB)',
    description: 'Titanium design, A18 Pro chip, 48MP Fusion camera. The most powerful iPhone ever.',
    category: 'tech',
    image: '📱',
    originalPrice: 1599,
    minPrice: 1400,
    targetPrice: 1500,
  },
  {
    name: 'Rolex Submariner Date',
    description: 'Oystersteel, Cerachrom bezel, 41mm. Unworn, with box and papers. Highly sought after by collectors.',
    category: 'luxury',
    image: '⌚',
    originalPrice: 14500,
    minPrice: 12500,
    targetPrice: 13500,
  },
  {
    name: 'Tesla Model S Plaid',
    description: '1,020 hp, 0-60 in 1.99s. Tri-motor All-Wheel Drive. Includes Full Self-Driving Capability.',
    category: 'vehicles',
    image: '🔋',
    originalPrice: 89990,
    minPrice: 82000,
    targetPrice: 86000,
  },
  {
    name: '1st Edition Shadowless Charizard',
    description: 'PSA 10 Gem Mint. Extremely rare 1999 Base Set collectible card. A piece of history.',
    category: 'collectibles',
    image: '🔥',
    originalPrice: 350000,
    minPrice: 310000,
    targetPrice: 330000,
  },
  {
    name: 'Emerald Bay Private Island',
    description: '45-acre private island in the Maldives. Includes luxury 5-bedroom villa and helipad. Pure paradise.',
    category: 'luxury',
    image: '🏝️',
    originalPrice: 12000000,
    minPrice: 8500000,
    targetPrice: 10000000,
  },
];

// Get random product
function getRandomProduct() {
  return PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
}

// Get product by name
function getProductByName(name) {
  return PRODUCTS.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
}

// Get all products
function getAllProducts() {
  // Return products without hidden prices
  return PRODUCTS.map(({ name, description, category, image, originalPrice }) => ({
    name,
    description,
    category,
    image,
    originalPrice,
  }));
}

// Get random AI strategy
function getRandomStrategy() {
  const strategies = ['aggressive', 'friendly', 'emotional', 'logical'];
  return strategies[Math.floor(Math.random() * strategies.length)];
}

module.exports = {
  PRODUCTS,
  getRandomProduct,
  getProductByName,
  getAllProducts,
  getRandomStrategy,
};
