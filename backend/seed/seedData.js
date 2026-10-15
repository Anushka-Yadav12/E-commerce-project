/**
 * High-Aesthetic Clothing Catalog Seed Data
 */
const SEED_PRODUCTS = [
  {
    id: "prod-001",
    name: "Architectural Double-Breasted Trench",
    tagline: "Water-resistant Japanese twill with structured storm flaps",
    brand: "ATELIER EDIT",
    category: "outerwear",
    gender: "unisex",
    price: 245,
    original_price: 295,
    badge: "BESTSELLER",
    is_new: 0,
    rating: 4.9,
    reviews_count: 38,
    description: "Crafted from heavy 380 GSM Japanese cotton twill with an ultra-matte water-repellent finish. Features drop-shoulder tailoring, horn buttons, deep storm-shield pockets, and a detachable cinched waist belt.",
    details: "100% Organic Japanese Cotton Twill. Interior piped seams. Horn buttons. Relaxed oversized fit.",
    care_instructions: ["Dry clean only", "Iron on medium with press cloth", "Do not tumble dry"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      {
        name: "Desert Khaki",
        hex: "#C2B29A",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Obsidian Black",
        hex: "#1A1A1A",
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
      }
    ],
    inventory: {
      "desert khaki-xs": 5,
      "desert khaki-s": 8,
      "desert khaki-m": 3,
      "desert khaki-l": 4,
      "desert khaki-xl": 0,
      "obsidian black-xs": 2,
      "obsidian black-s": 6,
      "obsidian black-m": 7,
      "obsidian black-l": 3,
      "obsidian black-xl": 1
    }
  },
  {
    id: "prod-002",
    name: "Heavyweight Boxy Cashmere Sweater",
    tagline: "7-gauge Mongolian grade-A ribbed cashmere",
    brand: "NORDIC MINIMAL",
    category: "knitwear",
    gender: "women",
    price: 185,
    original_price: null,
    badge: "NEW DROP",
    is_new: 1,
    rating: 4.8,
    reviews_count: 24,
    description: "Spun from cruelty-free Grade-A Mongolian cashmere with tactile fisherman-ribbing. Designed with a clean boxy silhouette, gently dropped shoulders, and rolled seam neckline.",
    details: "100% Grade-A Mongolian Cashmere. 7-gauge knit. Weight: 420g. Pre-washed for cloud-soft hand feel.",
    care_instructions: ["Hand wash cold with wool detergent", "Dry flat on towel", "Store folded, do not hang"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      {
        name: "Oatmeal Melange",
        hex: "#DDD6C8",
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Sage Fog",
        hex: "#9EAA9A",
        image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80"
      }
    ],
    inventory: {
      "oatmeal melange-xs": 4,
      "oatmeal melange-s": 6,
      "oatmeal melange-m": 5,
      "oatmeal melange-l": 2,
      "oatmeal melange-xl": 0,
      "sage fog-xs": 3,
      "sage fog-s": 4,
      "sage fog-m": 2,
      "sage fog-l": 1,
      "sage fog-xl": 0
    }
  },
  {
    id: "prod-003",
    name: "Pleated Wide-Leg Wool Trousers",
    tagline: "High-rise tailored trousers with inverted front pleats",
    brand: "ATELIER EDIT",
    category: "bottoms",
    gender: "women",
    price: 160,
    original_price: 195,
    badge: "SALE 20%",
    is_new: 0,
    rating: 4.7,
    reviews_count: 19,
    description: "Architectural high-waisted trousers tailored from breathable tropical virgin wool with fluid drape. Finished with double front pleats, hidden slide hooks, and wide hems that stack elegantly over boots or loafers.",
    details: "98% Virgin Wool, 2% Elastane. Half-lined with cupro. Deep slant side pockets and rear welt pockets.",
    care_instructions: ["Professional dry clean only", "Steam iron low"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      {
        name: "Charcoal Slate",
        hex: "#383B40",
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Cream Ivory",
        hex: "#F5F3ED",
        image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"
      }
    ],
    inventory: {
      "charcoal slate-xs": 3,
      "charcoal slate-s": 7,
      "charcoal slate-m": 4,
      "charcoal slate-l": 1,
      "charcoal slate-xl": 2,
      "cream ivory-xs": 4,
      "cream ivory-s": 2,
      "cream ivory-m": 6,
      "cream ivory-l": 3,
      "cream ivory-xl": 0
    }
  },
  {
    id: "prod-004",
    name: "Heavy Minimalist Oversized Hoodie",
    tagline: "460 GSM loopback French terry with double-layered hood",
    brand: "KINETIC TAILOR",
    category: "tops",
    gender: "unisex",
    price: 110,
    original_price: null,
    badge: "TRENDING",
    is_new: 1,
    rating: 4.9,
    reviews_count: 52,
    description: "Constructed from custom-developed 460 GSM loopback cotton fleece. Features a seamless double-layer hood without drawstrings for clean aesthetic lines, dropped shoulder, and tight ribbing.",
    details: "100% Combed Organic Cotton. 460 GSM heavy terry. Ribbed side gussets. Preshrunk.",
    care_instructions: ["Machine wash cold inside out", "Hang dry in shade to maintain color depth"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      {
        name: "Washed Clay",
        hex: "#9E6B55",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Raw Ecru",
        hex: "#EDE8DF",
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"
      }
    ],
    inventory: {
      "washed clay-s": 6,
      "washed clay-m": 10,
      "washed clay-l": 5,
      "washed clay-xl": 3,
      "washed clay-xxl": 2,
      "raw ecru-s": 4,
      "raw ecru-m": 8,
      "raw ecru-l": 6,
      "raw ecru-xl": 2,
      "raw ecru-xxl": 0
    }
  },
  {
    id: "prod-005",
    name: "Deconstructed Tailored Wool Blazer",
    tagline: "Unstructured Italian hopsack wool jacket",
    brand: "ATELIER EDIT",
    category: "outerwear",
    gender: "men",
    price: 280,
    original_price: 320,
    badge: "LIMITED",
    is_new: 0,
    rating: 5.0,
    reviews_count: 14,
    description: "An effortlessly sophisticated unstructured jacket cut from breathable Italian hopsack wool. Soft shoulders without padding provide natural mobility while retaining sharp sartorial silhouette.",
    details: "100% Italian Virgin Wool. Unlined body, butterfly sleeve lining in viscose. Genuine buffalo horn buttons.",
    care_instructions: ["Specialist dry clean only", "Brush clean after wear"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        name: "Midnight Navy",
        hex: "#1E293B",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Espresso Brown",
        hex: "#3D2B1F",
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
      }
    ],
    inventory: {
      "midnight navy-s": 2,
      "midnight navy-m": 5,
      "midnight navy-l": 3,
      "midnight navy-xl": 1,
      "espresso brown-s": 1,
      "espresso brown-m": 3,
      "espresso brown-l": 2,
      "espresso brown-xl": 0
    }
  },
  {
    id: "prod-006",
    name: "Relaxed Supima Cotton Relaxed Tee",
    tagline: "260 GSM long-staple organic Supima jersey",
    brand: "NORDIC MINIMAL",
    category: "tops",
    gender: "unisex",
    price: 48,
    original_price: null,
    badge: "ESSENTIAL",
    is_new: 0,
    rating: 4.8,
    reviews_count: 88,
    description: "The quintessential luxury basic. Knit from Californian long-staple Supima cotton that resists pilling, fading, and distortion. Cut with a relaxed boxy drape and reinforced rib collar.",
    details: "100% Supima Cotton. 260 GSM. Blind-stitch hems. Garment dyed.",
    care_instructions: ["Machine wash warm 40C", "Tumble dry low", "Warm iron"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      {
        name: "Optic Chalk White",
        hex: "#F9F9F9",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Vintage Charcoal",
        hex: "#2F3136",
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
      }
    ],
    inventory: {
      "optic chalk white-xs": 8,
      "optic chalk white-s": 15,
      "optic chalk white-m": 20,
      "optic chalk white-l": 12,
      "optic chalk white-xl": 8,
      "optic chalk white-xxl": 4,
      "vintage charcoal-xs": 5,
      "vintage charcoal-s": 12,
      "vintage charcoal-m": 14,
      "vintage charcoal-l": 9,
      "vintage charcoal-xl": 4,
      "vintage charcoal-xxl": 2
    }
  },
  {
    id: "prod-007",
    name: "Selvedge Tapered Denim 14oz",
    tagline: "Shuttle-loom woven raw indigo denim with red selvedge ID",
    brand: "KINETIC TAILOR",
    category: "bottoms",
    gender: "men",
    price: 155,
    original_price: 175,
    badge: "RESTOCKED",
    is_new: 0,
    rating: 4.9,
    reviews_count: 31,
    description: "Woven on vintage shuttle looms in Okayama. 14oz ring-spun denim with distinctive texture that molds to your silhouette over time. Finished with copper rivets and chain-stitched hems.",
    details: "100% Japanese Selvedge Cotton. 14oz weight. Button fly with custom brass donut buttons.",
    care_instructions: ["Wash inside-out cold after 6 months of wear", "Air dry flat in shade"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        name: "Raw Deep Indigo",
        hex: "#1A2639",
        image: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80"
      }
    ],
    inventory: {
      "raw deep indigo-s": 3,
      "raw deep indigo-m": 6,
      "raw deep indigo-l": 4,
      "raw deep indigo-xl": 1
    }
  },
  {
    id: "prod-008",
    name: "Structured Calfskin Crossbody Bag",
    tagline: "Full-grain Italian calf leather with palladium hardware",
    brand: "ATELIER EDIT",
    category: "accessories",
    gender: "unisex",
    price: 210,
    original_price: null,
    badge: "LUXURY",
    is_new: 1,
    rating: 5.0,
    reviews_count: 16,
    description: "Architectural saddle-profile bag handcrafted in Tuscany from vegetable-tanned full-grain calfskin. Features an adjustable strap, magnetic front clasp, and microfiber suede lining with card slots.",
    details: "100% Full-Grain Vegetable Tanned Leather. Suede lining. Palladium plated solid brass hardware.",
    care_instructions: ["Condition with natural beeswax leather cream annually", "Keep in dustbag away from moisture"],
    sizes: ["One Size"],
    colors: [
      {
        name: "Cognac Amber",
        hex: "#8C4A28",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Noir",
        hex: "#111111",
        image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"
      }
    ],
    inventory: {
      "cognac amber-one size": 4,
      "noir-one size": 3
    }
  }
];

const SEED_USER = {
  id: "user-001",
  full_name: "Elena Vance",
  email: "elena.vance@example.com",
  phone: "+1 (555) 234-8901",
  tier: "Atelier Privé Gold",
  points: 1450,
  preferred_size: "M",
  preferred_fit: "Relaxed Tailored",
  address: "742 Evergreen Terrace, Apt 4B",
  city: "New York",
  postal_code: "10001",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
};

module.exports = {
  SEED_PRODUCTS,
  SEED_USER
};
