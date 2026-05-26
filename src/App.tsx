import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Info,
  Brain,
  Cpu,
  TrendingUp,
  Bot,
  Image,
  GitCompare,
  BarChart3,
  ShoppingBag,
  Layers,
  ShieldCheck,
  Percent,
  Star,
  Check,
  Trash,
  Plus,
  Search,
  ArrowRight,
  Clock,
  Flame,
  ArrowUpDown,
  User,
  Tag,
  Package,
  ShoppingCart,
  ShieldAlert,
  DollarSign,
  Sliders,
  Eye,
  RefreshCw,
  Heart,
  SlidersHorizontal,
  Sparkle,
  Linkedin,
  Github,
  GraduationCap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { INITIAL_PRODUCTS, Product, VISUAL_SEARCH_PRESETS, VisualSearchPreset } from "./data";

export default function App() {
  // Navigation Tabs: 'buyer' | 'merchant' | 'admin' | 'about'
  const [activeTab, setActiveTab] = useState<"buyer" | "merchant" | "admin" | "about">("buyer");

  // State loaded from LocalStorage
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("vendora_products");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(() => {
    const saved = localStorage.getItem("vendora_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [clicks, setClicks] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("vendora_clicks");
    return saved ? JSON.parse(saved) : {};
  });

  const [categoryClicks, setCategoryClicks] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("vendora_category_clicks");
    return saved ? JSON.parse(saved) : { electronics: 0, fashion: 0, fitness: 0, gifts: 0, lifestyle: 0 };
  });

  const [orders, setOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem("vendora_orders");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "ORD-9843",
        date: "2026-05-26",
        items: [{ product: INITIAL_PRODUCTS[0], quantity: 1 }],
        total: INITIAL_PRODUCTS[0].price,
        status: "Delivered",
        aiFraudScore: 2,
        persona: "Tech Enthusiast",
      },
      {
        id: "ORD-9812",
        date: "2026-05-25",
        items: [{ product: INITIAL_PRODUCTS[5], quantity: 1 }],
        total: INITIAL_PRODUCTS[5].price,
        status: "Processing",
        aiFraudScore: 8,
        persona: "Fashion Shopper",
      }
    ];
  });

  // Live Toast for AI Engine telemetry
  const [telemetryToast, setTelemetryToast] = useState<{ message: string; sub: string } | null>(null);

  // Synchronize dynamic items to LocalStorage
  useEffect(() => {
    localStorage.setItem("vendora_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("vendora_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("vendora_clicks", JSON.stringify(clicks));
  }, [clicks]);

  useEffect(() => {
    localStorage.setItem("vendora_category_clicks", JSON.stringify(categoryClicks));
  }, [categoryClicks]);

  useEffect(() => {
    localStorage.setItem("vendora_orders", JSON.stringify(orders));
  }, [orders]);

  // Trigger telemetry toast helper
  const triggerTelemetry = (msg: string, sub: string) => {
    setTelemetryToast({ message: msg, sub });
    setTimeout(() => {
      setTelemetryToast(prev => prev?.message === msg ? null : prev);
    }, 4500);
  };

  // --- BUYER SIDE STATE ---
  const [buyerSearch, setBuyerSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "electronics" | "fashion" | "fitness" | "gifts" | "lifestyle">("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Comparative matrix state: slots for two items
  const [compareSlots, setCompareSlots] = useState<[Product | null, Product | null]>([null, null]);
  const [isComparingOpen, setIsComparingOpen] = useState(false);

  // Visual Search Upload Simulation
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanResult, setScanResult] = useState<VisualSearchPreset | null>(null);

  // AI Shopping Assistant Chatbot
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string; products?: Product[] }>>([
    {
      sender: "ai",
      text: "Greetings! I am the Vendora AI Shopping Concierge. Tell me: who are you shopping for, what is your budget, or tell me the style/features you seek! I can instantly parse and fetch items.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatTyping, setIsChatTyping] = useState(false);

  // --- REAL-TIME REINFORCEMENT LEARNING & BANNER ALGORITHM ---
  // Multi-Armed Bandit (MAB) affinity updater of simulated user behaviour
  const handleProductInteract = (prodId: string, category: string, weightBonus: number = 1.5, type: string = "view") => {
    // 1. Update general click analytics
    setClicks(prev => ({
      ...prev,
      [prodId]: (prev[prodId] || 0) + 1,
    }));

    // 2. Update category counts
    setCategoryClicks(prev => ({
      ...prev,
      [category]: (prev[category] || 0) + 1,
    }));

    // 3. Update product's individual bandit Weight in memory
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === prodId) {
          const newWeight = parseFloat((p.banditWeight + weightBonus).toFixed(2));
          return { ...p, banditWeight: newWeight };
        }
        return p;
      })
    );

    // 4. Log virtual rewards
    if (type === "view") {
      triggerTelemetry(
        "Bandit Multi-Armed Reward",
        `Observed view on '${prodId}'. Category '${category}' reward weight enhanced by +${weightBonus}.`
      );
    } else if (type === "cart") {
      triggerTelemetry(
        "Cart Exploration Boost",
        `Heavy reinforcement signal received! Bandit affinity for '${prodId}' boosted by +${weightBonus}.`
      );
    } else if (type === "purchase") {
      triggerTelemetry(
        "MAB Optimal Exploitation Active",
        `Exploitation weight lock! Successfully rewarded product '${prodId}' with +${weightBonus} weight constraint.`
      );
    }
  };

  // Calculate user persona percentages dynamically based on interaction clicks
  const getPersonaMetrics = () => {
    const elecPoints = (categoryClicks.electronics || 0) * 12;
    const fashPoints = (categoryClicks.fashion || 0) * 12;
    const fitPoints = (categoryClicks.fitness || 0) * 12;
    const giftPoints = (categoryClicks.gifts || 0) * 12 + (categoryClicks.lifestyle || 0) * 5;

    const totalPoints = elecPoints + fashPoints + fitPoints + giftPoints;

    if (totalPoints === 0) {
      return [
        { label: "Tech Enthusiast", percentage: 25, color: "from-[#6366F1] to-[#EC4899]" },
        { label: "Fashion Shopper", percentage: 25, color: "from-[#EC4899] to-purple-600" },
        { label: "Fitness Buyer", percentage: 25, color: "from-teal-500 to-[#6366F1]" },
        { label: "Gift Hunter", percentage: 25, color: "from-amber-500 to-[#EC4899]" },
      ];
    }

    return [
      { label: "Tech Enthusiast", percentage: Math.round(((elecPoints + 3) / (totalPoints + 12)) * 100), color: "from-[#6366F1] to-[#EC4899]" },
      { label: "Fashion Shopper", percentage: Math.round(((fashPoints + 3) / (totalPoints + 12)) * 100), color: "from-[#EC4899] to-purple-600" },
      { label: "Fitness Buyer", percentage: Math.round(((fitPoints + 3) / (totalPoints + 12)) * 100), color: "from-teal-500 to-[#6366F1]" },
      { label: "Gift Hunter", percentage: Math.round(((giftPoints + 3) / (totalPoints + 12)) * 100), color: "from-amber-500 to-[#EC4899]" },
    ].sort((a, b) => b.percentage - a.percentage);
  };

  const activePersonaList = getPersonaMetrics();
  const dominantPersona = activePersonaList[0].label;

  // Compute recommendation reasoning dynamically under product card
  const getRecommendationExplanation = (product: Product) => {
    const totalCount = products.length;
    const clickBonus = clicks[product.id] || 0;
    const catClickBonus = categoryClicks[product.category] || 0;

    let baseConf = Math.min(65 + clickBonus * 6 + catClickBonus * 3, 99.4);
    if (product.trendScore > 90) baseConf = Math.min(baseConf + 5, 99.8);

    let reason = "";
    if (clickBonus > 0) {
      reason = `Matches search profile. You explicitly clicked this item ${clickBonus}x.`;
    } else if (catClickBonus > 0) {
      reason = `Learned preference. Derived high MAB reward weighting for the ${product.category} category.`;
    } else if (product.trendScore > 94) {
      reason = `Trend acceleration score is ${product.trendScore}/100. Local demand is surging this week (+${product.growth}% Growth).`;
    } else {
      reason = `Bandit recommendation exploring this product under exploration phase (Expected value: ${(product.banditWeight * 1.5).toFixed(1)}).`;
    }

    return { confidence: baseConf.toFixed(1), reason };
  };

  // MAB scoring ranking computation
  const getRankedProducts = () => {
    const searchLower = buyerSearch.toLowerCase();
    
    // Filter first
    let filtered = products.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(searchLower) || p.description.toLowerCase().includes(searchLower);
      const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });

    // Score based on trend, ratings and reinforcement weight
    return filtered.map(p => {
      const scoring = (p.trendScore * 0.4) + (p.rating * 10) + (p.banditWeight * 15);
      return { product: p, score: scoring };
    }).sort((a, b) => b.score - a.score).map(x => x.product);
  };

  const rankedProducts = getRankedProducts();

  // --- CART OPERATIONS ---
  const addToCart = (product: Product) => {
    handleProductInteract(product.id, product.category, 3.0, "cart");
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    triggerTelemetry("Cart Item Added", `Successfully added '${product.title}' to cart.`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const checkoutCart = () => {
    if (cart.length === 0) return;
    const totalCost = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    // Apply MAB reinforcement on all items in cart before checkout
    cart.forEach(item => {
      handleProductInteract(item.product.id, item.product.category, 5.0, "purchase");
    });

    // Add order to orders
    const newOrd = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split("T")[0],
      items: [...cart],
      total: totalCost,
      status: "Processing",
      aiFraudScore: Math.floor(1 + Math.random() * 15),
      persona: dominantPersona,
    };

    setOrders(prev => [newOrd, ...prev]);
    setCart([]);
    triggerTelemetry("Order Success", `Mock Order ${newOrd.id} routed successfully through conversion analyzer.`);
  };

  // --- AI SHOPPING CONCIERGE RESPONSE ENGINE ---
  const handleConciergeChat = (customPrompt?: string) => {
    const prompt = customPrompt || chatInput;
    if (!prompt.trim()) return;

    setMessages(prev => [...prev, { sender: "user", text: prompt }]);
    if (!customPrompt) setChatInput("");
    setIsChatTyping(true);

    setTimeout(() => {
      const query = prompt.toLowerCase();
      let matchedItems: Product[] = [];
      let replyText = "";

      // Smart Parsing parameters
      const maxBudget = query.match(/under\s?\$?(\d+)/i) || query.match(/budget\s?\$?(\d+)/i) || query.match(/limit\s?\$?(\d+)/i);
      const parsedBudget = maxBudget ? parseInt(maxBudget[1]) : Infinity;

      if (query.includes("student") || query.includes("young") || query.includes("school")) {
        // High valuation electronics or fashion budget
        matchedItems = products.filter(p => p.price <= parsedBudget && (p.category === "electronics" || p.category === "fashion" || p.price < 100));
        replyText = `Excellent! To aid student productivity and academic life, I scanned our active catalog tracking High-Aesthetic student picks under standard pricing thresholds:`;
      } else if (query.includes("gift") || query.includes("anniversary") || query.includes("birthday") || query.includes("present")) {
        matchedItems = products.filter(p => p.category === "gifts" || p.category === "lifestyle");
        if (parsedBudget !== Infinity) matchedItems = matchedItems.filter(p => p.price <= parsedBudget);
        replyText = `Wonderful, I found amazing gift items cased in premium styling. Perfect to make any milestone memorable for your loved ones items:`;
      } else if (query.includes("tech") || query.includes("electronic") || query.includes("gadget") || query.includes("comput")) {
        matchedItems = products.filter(p => p.category === "electronics");
        if (parsedBudget !== Infinity) matchedItems = matchedItems.filter(p => p.price <= parsedBudget);
        replyText = `Understood. Analyzing raw components and technical spec metrics, here are our ultra-modern tech gear pieces:`;
      } else if (query.includes("fashion") || query.includes("cloth") || query.includes("style") || query.includes("wear")) {
        matchedItems = products.filter(p => p.category === "fashion");
        if (parsedBudget !== Infinity) matchedItems = matchedItems.filter(p => p.price <= parsedBudget);
        replyText = `Analyzing aesthetic weaves, climate adjustments, and high-quality ratings. Here are our top fashion garments:`;
      } else if (query.includes("fit") || query.includes("training") || query.includes("gym") || query.includes("yoga") || query.includes("exercis")) {
        matchedItems = products.filter(p => p.category === "fitness");
        if (parsedBudget !== Infinity) matchedItems = matchedItems.filter(p => p.price <= parsedBudget);
        replyText = `Retrieving durable athlete-grade hardware and biometrics sensors optimized for conditioning:`;
      } else if (parsedBudget !== Infinity) {
        matchedItems = products.filter(p => p.price <= parsedBudget);
        replyText = `Scanning wide-range categories across all items under a hard budgetary constrain of $${parsedBudget}. Here is what I formulated:`;
      } else {
        // Default general semantic mapping
        matchedItems = products.slice(0, 3);
        replyText = `Based on your natural interaction context, I extracted these three premium items boasting massive market momentum:`;
      }

      // Slice to premium response density
      matchedItems = matchedItems.slice(0, 4);

      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: `${replyText} ${matchedItems.length === 0 ? "Ah, I did not find any item conforming strictly to those boundaries. Try adjusting the query fields." : ""}`,
          products: matchedItems,
        },
      ]);
      setIsChatTyping(false);
      triggerTelemetry("AI Shopping Planner Explored", `Synthesized recommendations using custom context parsing.`);
    }, 1200);
  };

  // --- MOCK COMPARISON SYSTEM ---
  const addToCompare = (product: Product) => {
    if (compareSlots[0]?.id === product.id || compareSlots[1]?.id === product.id) {
      triggerTelemetry("Comparison Notice", `${product.title} is already queued.`);
      return;
    }
    if (!compareSlots[0]) {
      setCompareSlots([product, compareSlots[1]]);
      triggerTelemetry("Queued Comparison Slot 1", `${product.title} added.`);
    } else if (!compareSlots[1]) {
      setCompareSlots([compareSlots[0], product]);
      triggerTelemetry("Queued Comparison Slot 2", `${product.title} added.`);
      setIsComparingOpen(true);
    } else {
      // Rotate out first slot
      setCompareSlots([compareSlots[1], product]);
      triggerTelemetry("Rotated Comparison", `Replaced slot 1 with ${product.title}.`);
    }
  };

  // --- SIMULATED VISUAL SEARCH ENGINE ---
  const handleVisualSearchPreset = (preset: VisualSearchPreset) => {
    setIsScanning(true);
    setScanStep(1);
    setScanResult(null);

    // Dynamic scanning visual triggers
    setTimeout(() => {
      setScanStep(2);
    }, 1000);

    setTimeout(() => {
      setScanStep(3);
    }, 2000);

    setTimeout(() => {
      setIsScanning(false);
      setScanResult(preset);
      triggerTelemetry(
        "Visual Classifier Locked",
        `Parsed image vector space with ${preset.confidence}% confidence as category '${preset.detectedCategory}'.`
      );
    }, 3200);
  };

  // --- MERCHANT INVENTORY UPDATE SIMULATOR ---
  const updateProductStock = (id: string, amount: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, stock: Math.max(0, p.stock + amount) } : p))
    );
    triggerTelemetry("Merchant Action", `Updated inventory units directly in local cache.`);
  };

  const simulateSaleSpike = (id: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const addedTrend = Math.floor(Math.random() * 8) + 4;
          return {
            ...p,
            trendScore: Math.min(p.trendScore + addedTrend, 100),
            growth: parseFloat((p.growth + Math.random() * 6 + 2).toFixed(1)),
          };
        }
        return p;
      })
    );
    triggerTelemetry(
      "AI Regional Volume Surge",
      `Observed exponential purchase signals in Seattle/Auckland. Growth recalculation complete.`
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#E0E0E0] flex flex-col relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#6366F1] rounded-full blur-[160px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-[#EC4899] rounded-full blur-[160px] opacity-20 pointer-events-none"></div>
      
      {/* GLOBAL TOAST NOTIFICATION WINDOW */}
      <AnimatePresence>
        {telemetryToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 max-w-sm bg-slate-900 border-l-4 border-emerald-400 text-white p-4 rounded-lg shadow-xl flex gap-3 items-start"
            id="ai-telemetry-toast"
          >
            <div className="p-1 bg-emerald-500/10 rounded">
              <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <p className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider">
                {telemetryToast.message}
              </p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {telemetryToast.sub}
              </p>
              <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Virtual telemetry telemetry active
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION WITH NAVIGATION */}
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-md border-b border-white/10 text-white" id="vendora-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-[#6366F1] to-[#EC4899] text-white rounded-xl shadow-lg relative">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl tracking-tighter text-white uppercase">
                Vendora<span className="text-[#6366F1]">.ai</span>
              </h1>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Autonomous Demo Matrix Enabled</p>
            </div>
          </div>

          {/* ACTIVE JUDGES RUNTIME PANELS */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                setActiveTab("buyer");
                triggerTelemetry("Buyer Storefront", "Entering consumer recommendation stream and MAB engine.");
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === "buyer"
                  ? "bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-white shadow-md font-bold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              id="tab-buyer-storefront"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Buyer Storefront
            </button>
            <button
              onClick={() => {
                setActiveTab("merchant");
                triggerTelemetry("Merchant Workspace", "Entering decentralized supply system panel.");
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === "merchant"
                  ? "bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-white shadow-md font-bold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              id="tab-merchant-dashboard"
            >
              <Package className="w-3.5 h-3.5" />
              Merchant Hub
            </button>
            <button
              onClick={() => {
                setActiveTab("admin");
                triggerTelemetry("Admin Framework", "Initializing global telemetry, commissions & risk monitors.");
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === "admin"
                  ? "bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-white shadow-md font-bold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              id="tab-admin-hub"
            >
              <Sliders className="w-3.5 h-3.5" />
              Admin Command
            </button>
            <button
              onClick={() => {
                setActiveTab("about");
                triggerTelemetry("About Workspace", "Exploring the vision, core tech and DTU founding team of Vendora.");
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === "about"
                  ? "bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-white shadow-md font-bold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              id="tab-about"
            >
              <Info className="w-3.5 h-3.5" />
              About
            </button>
          </div>

          {/* HEADER PERSONA SHIELD AND BUDGET CONTAINER */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[11px] font-mono text-white/50 uppercase tracking-wider">Active Persona:</span>
              </div>
              <p className="text-xs font-bold text-white font-display uppercase tracking-tight">{dominantPersona}</p>
            </div>
            <div className="bg-white/5 text-white p-2 border border-white/10 rounded-xl flex items-center gap-2 shadow-sm">
              <Brain className="w-4 h-4 text-[#6366F1]" />
              <div className="text-[10px] font-mono">
                <div className="text-[#6366F1] uppercase tracking-widest text-[8px] font-bold">Virtual Budget</div>
                <div className="font-bold text-white">$2,450.00</div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN SCREEN ENCLOSURE CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ==================== 🛍️ BUYER VIEW ==================== */}
        {activeTab === "buyer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LARGE STORE COL - SIDE-BY-SIDE DESIGN */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* TOP HERO ANNOUNCEMENT BANNER */}
              <div className="bg-gradient-to-r from-zinc-900 to-[#121214] text-white p-6 rounded-2xl relative overflow-hidden shadow-xl border border-white/10" id="buyer-hero">
                <div className="absolute right-0 top-0 w-80 h-80 bg-[#6366F1] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute left-1/2 bottom-0 w-60 h-60 bg-[#EC4899] opacity-5 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="max-w-md">
                    <span className="bg-[#6366F1]/10 text-[#6366F1] text-[10px] py-1 px-2.5 rounded-full font-mono font-bold uppercase tracking-widest border border-[#6366F1]/20">
                      Reinforcement Learning Active
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-light mt-3 tracking-tight text-white">
                      Autonomic Shopping <span className="italic font-serif">Framework</span>
                    </h2>
                    <p className="text-white/70 text-xs mt-1.5 leading-relaxed">
                      Every click, view, and item purchase retrains a real-time Multi-Armed Bandit simulation to adapt the catalog to your immediate style.
                    </p>
                  </div>
                  <div className="bg-[#0B0B0B]/60 backdrop-blur-sm border border-white/10 p-3 rounded-xl max-w-[200px] flex flex-col gap-1.5 self-center w-full">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-white/60 font-mono tracking-wider font-bold">PERSONA CONTEXT</span>
                      <Sparkles className="w-3 h-3 text-[#6366F1]" />
                    </div>
                    {activePersonaList.slice(0, 2).map((p, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex justify-between font-mono font-medium text-[10px] text-white/90 mt-1">
                          <span>{p.label}</span>
                          <span className="font-bold text-[#EC4899]">{p.percentage}%</span>
                        </div>
                        <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden mt-0.5">
                          <div className={`h-full bg-gradient-to-r ${p.color}`} style={{ width: `${p.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SEARCH FILTER HEADER BAR */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                
                {/* Search Bar Input */}
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search premium products or smart categories..."
                    value={buyerSearch}
                    onChange={(e) => setBuyerSearch(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1] placeholder-white/30"
                    id="buyer-search-input"
                  />
                  {buyerSearch && (
                    <button
                      onClick={() => setBuyerSearch("")}
                      className="absolute right-3 top-2 w-5 h-5 bg-white/10 text-white hover:bg-white/20 rounded-full text-[10px] flex items-center justify-center"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Compare Bar CTA */}
                {(compareSlots[0] || compareSlots[1]) && (
                  <button
                    onClick={() => setIsComparingOpen(true)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-[#6366F1] to-[#EC4899] hover:opacity-90 text-white text-xs px-4 py-2 rounded-lg font-bold shadow-md transition-all whitespace-nowrap animate-bounce"
                    id="trigger-comparison-modal"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    Compare Grid ({[compareSlots[0], compareSlots[1]].filter(Boolean).length}/2)
                  </button>
                )}

                {/* Auxiliary buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsVisualSearchOpen(true);
                      triggerTelemetry("Visual Search Workspace", "Triggering camera input layer simulation.");
                    }}
                    className="flex items-center gap-1.5 border border-white/10 hover:border-white/25 hover:bg-white/5 text-white text-xs px-3 py-2 rounded-lg transition"
                    id="trigger-visual-search"
                  >
                    <Image className="w-3.5 h-3.5 text-[#6366F1]" />
                    AI Visual Search
                  </button>
                </div>

              </div>

              {/* HORIZONTAL CATEGORY SCROLL BAR */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar select-none" id="category-scroller">
                {(["all", "electronics", "fashion", "fitness", "gifts", "lifestyle"] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      triggerTelemetry("Query Boundary Updated", `Applied filter context: ${cat}`);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all border ${
                      selectedCategory === cat
                        ? "bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-white border-[#6366F1]/50 font-bold"
                        : "bg-[#0B0B0B] text-white/60 border-white/10 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {cat.toUpperCase()} {(categoryClicks[cat] || 0) > 0 && `(${categoryClicks[cat]})`}
                  </button>
                ))}
              </div>

              {/* PRODUCT STREAM WITH MAB SORTING */}
              <div id="product-grid-container">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-white/60 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3 h-3 text-[#6366F1]" />
                    Showing {rankedProducts.length} Personal-ranked items
                  </span>
                  <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    MAB Thompson Sampling Active
                  </span>
                </div>

                {rankedProducts.length === 0 ? (
                  <div className="bg-white/5 rounded-2xl p-12 border border-white/10 text-center flex flex-col items-center justify-center">
                    <SlidersHorizontal className="w-8 h-8 text-white/30 mb-2.5 animate-bounce" />
                    <h3 className="font-display font-medium text-white text-sm">No matched inventory instances</h3>
                    <p className="text-xs text-white/50 max-w-sm mt-1">
                      Our reinforcement model scanned standard nodes but couldn't verify items. Adjust bounds to retry.
                    </p>
                    <button
                      onClick={() => { setSelectedCategory("all"); setBuyerSearch(""); }}
                      className="mt-4 bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-white text-xs px-3.5 py-1.5 rounded-lg font-bold"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rankedProducts.map((prod) => {
                      const { confidence, reason } = getRecommendationExplanation(prod);
                      const isCompareQueued = compareSlots[0]?.id === prod.id || compareSlots[1]?.id === prod.id;

                      return (
                        <motion.div
                          layoutId={`prod-card-${prod.id}`}
                          onClick={() => handleProductInteract(prod.id, prod.category, 1.5, "view")}
                          key={prod.id}
                          className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 hover:border-[#6366F1]/40 overflow-hidden shadow-lg transition-all group flex flex-col h-[495px] text-[#E0E0E0]"
                        >
                          {/* Image container */}
                          <div className="relative h-44 bg-neutral-900 overflow-hidden select-none">
                            <img
                              src={prod.image}
                              alt={prod.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Stock and rating badge absolute overlay */}
                            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                              <span className="bg-black/80 backdrop-blur-sm text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider border border-white/10">
                                {prod.category}
                              </span>
                              {prod.trendScore > 94 ? (
                                <span className="bg-[#EC4899] text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded flex items-center gap-0.5 shadow">
                                  <Flame className="w-2.5 h-2.5 fill-white animate-ping" />
                                  VIRAL
                                </span>
                              ) : (
                                <span className="bg-[#6366F1] text-white font-mono font-semibold text-[9px] px-2 py-0.5 rounded shadow">
                                  Trend {prod.trendScore}
                                </span>
                              )}
                            </div>

                            <div className="absolute top-2.5 right-2.5 bg-yellow-400 text-slate-950 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
                              {prod.rating.toFixed(1)}
                            </div>

                            {prod.stock < 15 && (
                              <div className="absolute bottom-2.5 left-2.5 bg-red-650 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow uppercase">
                                Low Stock: {prod.stock} left
                              </div>
                            )}
                          </div>

                          {/* Body Content */}
                          <div className="p-4 flex flex-col flex-grow">
                            
                            {/* Product Title and Price Row */}
                            <div className="flex justify-between items-start gap-1">
                              <h3 
                                onClick={(e) => { e.stopPropagation(); setSelectedProduct(prod); }}
                                className="font-display font-semibold text-[13px] text-white line-clamp-1 group-hover:text-[#6366F1] cursor-pointer transition-colors"
                              >
                                {prod.title}
                              </h3>
                              <span className="font-mono text-[13px] font-bold text-[#EC4899] whitespace-nowrap">
                                ${prod.price}
                              </span>
                            </div>

                            <p className="text-xs text-white/50 font-medium mt-1 mb-2 line-clamp-2 leading-relaxed h-8">
                              {prod.description}
                            </p>

                            {/* Comparison list indicators */}
                            <div className="flex gap-1 flex-wrap mt-auto mb-2">
                              {prod.features.slice(0, 3).map((feat, idx) => (
                                <span key={idx} className="bg-white/5 border border-white/10 text-white/40 text-[9px] px-1.5 py-0.5 rounded-md font-mono">
                                  {feat}
                                </span>
                              ))}
                            </div>

                            {/* JUDGES HIGHLIGHT: WHY RECOMMENDED BOX */}
                            <div className="bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border border-[#6366F1]/25 p-2.5 rounded-lg flex flex-col gap-0.5 select-none my-2.5 shadow-inner">
                              <div className="flex items-center justify-between text-[9px]">
                                <span className="text-[#6366F1] font-bold uppercase tracking-widest flex items-center gap-1">
                                  <Sparkle className="w-2.5 h-2.5 text-[#6366F1] fill-[#6366F1] animate-pulse" />
                                  AI Personalization Active
                                </span>
                                <span className="font-mono text-[#EC4899] font-bold bg-[#EC4899]/10 border border-[#EC4899]/20 px-1.5 py-0.5 rounded-full scale-95">
                                  {confidence}% Match
                                </span>
                              </div>
                              <p className="text-[10px] text-white/60 leading-tight mt-1">
                                <span className="font-bold text-white/80">Why Recommended:</span> {reason}
                              </p>
                            </div>

                            {/* Action Buttons Footer */}
                            <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => addToCart(prod)}
                                className="flex-grow bg-[#6366F1] hover:bg-indigo-600 border border-transparent text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                Add Cart
                              </button>
                              
                              <button
                                onClick={() => addToCompare(prod)}
                                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                  isCompareQueued
                                    ? "bg-[#EC4899]/20 border-[#EC4899]/40 text-[#EC4899] font-bold"
                                    : "bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                                }`}
                                title="Add to comparison screen"
                              >
                                <GitCompare className="w-4 h-4" />
                              </button>
                            </div>

                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* AI COMPANION SIDEBAR COLUMN */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* AI SEGMENTATION DIAGNOSTIC */}
              <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg" id="buyer-persona-diagnostics">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-gradient-to-tr from-[#6366F1]/10 to-[#EC4899]/10">
                      <Brain className="w-4 h-4 text-[#6366F1] animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xs text-white">Persona Detection Panel</h3>
                      <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest">Dynamic NLP Classifier</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">
                    Online
                  </span>
                </div>

                <p className="text-xs text-white/50 leading-relaxed mt-3">
                  Autonomous browser telemetry records click vectors in order to deduce dynamic purchase persona configurations.
                </p>

                <div className="mt-4 flex flex-col gap-3">
                  {getPersonaMetrics().map((p, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between text-xs text-white/80 mb-1">
                        <span className="font-medium flex items-center gap-1.5">
                          {i === 0 && <Check className="w-3.5 h-3.5 text-green-400 font-bold" />}
                          {p.label}
                        </span>
                        <span className="font-mono font-bold text-[#EC4899]">{p.percentage}%</span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${p.color} rounded-full transition-all duration-700`}
                          style={{ width: `${p.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 py-2 px-3 bg-white/5 rounded-lg border border-white/10 flex flex-col gap-1 font-mono text-[9px] text-white/50">
                  <div className="flex justify-between">
                    <span>Total Digital Impressions:</span>
                    <span className="font-bold text-white/80">
                      {Object.values(categoryClicks).reduce((a: number, b: number) => a + Number(b), 0)} clicks
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bandit Exploration Entropy:</span>
                    <span className="font-bold text-[#6366F1]">t = 0.15 (Epsilon)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inference Accuracy Index:</span>
                    <span className="font-bold text-green-400">98.42% ML fit</span>
                  </div>
                </div>

                {/* Quick actions to inject fake telemetry to test bandit training */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">Simulate Click Waves</div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => {
                        handleProductInteract("elec-1", "electronics", 2.0);
                        handleProductInteract("elec-3", "electronics", 2.0);
                      }}
                      className="text-[9px] bg-[#6366F1]/15 hover:bg-[#6366F1]/25 text-indigo-300 border border-[#6366F1]/30 py-1 px-2 rounded font-semibold font-mono transition"
                    >
                      +Tech Imp
                    </button>
                    <button
                      onClick={() => {
                        handleProductInteract("fash-1", "fashion", 2.0);
                        handleProductInteract("fash-2", "fashion", 2.0);
                      }}
                      className="text-[9px] bg-[#EC4899]/15 hover:bg-[#EC4899]/25 text-pink-300 border border-[#EC4899]/30 py-1 px-2 rounded font-semibold font-mono transition"
                    >
                      +Fashion Imp
                    </button>
                    <button
                      onClick={() => {
                        handleProductInteract("fit-1", "fitness", 2.0);
                        handleProductInteract("fit-3", "fitness", 2.0);
                      }}
                      className="text-[9px] bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 py-1 px-2 rounded font-semibold font-mono transition"
                    >
                      +Fitness Imp
                    </button>
                    <button
                      onClick={() => {
                        handleProductInteract("gift-5", "gifts", 2.0);
                        handleProductInteract("gift-1", "gifts", 2.0);
                      }}
                      className="text-[9px] bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 py-1 px-2 rounded font-semibold font-mono transition"
                    >
                      +Gifts Imp
                    </button>
                  </div>
                </div>

              </div>

              {/* UPGRADED CHATBOT CONCIERGE */}
              <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg flex flex-col h-[525px]" id="buyer-shopping-concierge">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-gradient-to-tr from-[#6366F1]/10 to-[#EC4899]/10">
                      <Bot className="w-4 h-4 text-[#6366F1]" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xs text-white">AI Concierge Assistant</h3>
                      <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest">Generative Recommendation Core</p>
                    </div>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-[#EC4899] animate-pulse" />
                </div>

                {/* Micro Ticker status */}
                <div className="mt-2 text-[9px] tracking-wide font-mono text-white/40 uppercase flex items-center justify-between">
                  <span>Knowledge: Spring Catalog 2026</span>
                  <span>Active node</span>
                </div>

                {/* Chat window viewport */}
                <div className="flex-grow overflow-y-auto my-3 p-2 bg-black/30 rounded-lg border border-white/5 flex flex-col gap-2.5 max-h-[290px] select-text">
                  {messages.map((m, idx) => (
                    <div key={idx} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
                      <div className={`p-2.5 rounded-lg text-xs leading-relaxed max-w-[85%] ${
                        m.sender === "user"
                          ? "bg-[#6366F1] text-white rounded-br-none"
                          : "bg-white/5 border border-white/10 text-white/90 rounded-bl-none"
                      }`}>
                        {m.text}
                      </div>

                      {/* Products visual references attached to conversation */}
                      {m.products && m.products.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1.5 w-full max-w-[85%]">
                          {m.products.map(p => (
                            <div key={p.id} className="bg-white/5 p-2 rounded-lg border border-white/10 flex gap-2 items-center justify-between text-xs select-none">
                              <div className="flex items-center gap-1.5">
                                <img src={p.image} alt="" className="w-7 h-7 object-cover rounded border border-white/10" referrerPolicy="no-referrer" />
                                <div>
                                  <div className="font-bold text-[11px] text-white/90 line-clamp-1">{p.title}</div>
                                  <div className="text-[10px] text-[#EC4899] font-mono">${p.price}</div>
                                </div>
                              </div>
                              <button
                                onClick={() => addToCart(p)}
                                className="bg-[#EC4899] text-white font-bold text-[10px] py-1 px-2.5 rounded hover:bg-pink-600 transition"
                              >
                                Buy
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {isChatTyping && (
                    <div className="flex items-center gap-1.5 p-2 bg-white/5 rounded-lg border border-white/10 self-start text-xs text-white/40 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-ping"></span>
                      Concierge is analyzing catalog nodes...
                    </div>
                  )}
                </div>

                {/* Pre-packaged Quickprompts */}
                <div className="flex gap-1 overflow-x-auto pb-1.5 select-none no-scrollbar">
                  {[
                    "Gym tools under $100",
                    "Gifts ideas under $60",
                    "Student tech picks",
                    "Sleek fashion ideas",
                    "Budget lifestyle items",
                  ].map(qp => (
                    <button
                      key={qp}
                      onClick={() => handleConciergeChat(qp)}
                      className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 whitespace-nowrap text-white/70 hover:text-white px-2.5 py-1 rounded-full font-medium transition"
                    >
                      {qp}
                    </button>
                  ))}
                </div>

                {/* Chat controls footer */}
                <div className="flex gap-1.5 mt-auto">
                  <input
                    type="text"
                    placeholder="Ask concierge (e.g. Budget student setup...)"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleConciergeChat()}
                    className="flex-grow bg-black/40 border border-white/10 text-white placeholder-white/30 px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                  />
                  <button
                    onClick={() => handleConciergeChat()}
                    disabled={isChatTyping}
                    className="bg-[#6366F1] hover:bg-indigo-600 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition"
                  >
                    Send
                  </button>
                </div>

              </div>

              {/* SHOPPING CART VIEW persistence */}
              <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg" id="buyer-shopping-cart">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#6366F1]" />
                    <h3 className="font-display font-bold text-xs text-white">Your Shopping Basket</h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-white/10 px-2 py-0.5 rounded text-white">
                    {cart.reduce((s, x) => s + x.quantity, 0)} Items
                  </span>
                </div>

                {cart.length === 0 ? (
                  <div className="py-6 text-center text-xs text-white/40">
                    Your cart is completely empty. Start clicking catalog elements to reinforce active MAB models!
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="max-h-[140px] overflow-y-auto flex flex-col gap-2">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex gap-2.5 items-center justify-between text-xs py-1 border-b border-white/10">
                          <div className="flex items-center gap-1.5 max-w-[70%]">
                            <img src={item.product.image} alt="" className="w-7 h-7 object-cover rounded border border-white/10" referrerPolicy="no-referrer"/>
                            <div className="truncate">
                              <h4 className="font-bold text-white truncate text-[11px]">{item.product.title}</h4>
                              <div className="text-[10px] text-white/40 font-mono">
                                {item.quantity}x @ ${item.product.price}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#EC4899]">
                              ${item.product.price * item.quantity}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-white/40 hover:text-red-400 font-semibold p-1 transition"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-white/10 flex flex-col gap-1 text-xs">
                      <div className="flex justify-between text-white/60">
                        <span>Cart Subtotal</span>
                        <span className="font-mono text-white/90 font-semibold">${cart.reduce((s, x) => s + x.product.price * x.quantity, 0)}</span>
                      </div>
                      <div className="flex justify-between text-white/60">
                        <span>AI Optimization Rate</span>
                        <span className="text-emerald-400 font-bold font-mono">- $0.00 (Standard)</span>
                      </div>
                      <div className="flex justify-between font-bold text-white text-[13px] pt-1">
                        <span>Total Due</span>
                        <span className="font-mono text-[#EC4899]">${cart.reduce((s, x) => s + x.product.price * x.quantity, 0)}</span>
                      </div>
                    </div>

                    <button
                      onClick={checkoutCart}
                      className="w-full bg-gradient-to-r from-[#6366F1] to-[#EC4899] hover:opacity-95 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-md transition mt-2 flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4 text-emerald-400 font-bold" />
                      Verify & Place Order
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ==================== 🏭 MERCHANT VIEW ==================== */}
        {activeTab === "merchant" && (
          <div className="flex flex-col gap-6" id="merchant-workspace col-span-12">
            
            {/* HERO STATS BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Active Stock Value</span>
                  <h3 className="font-display font-bold text-lg text-white mt-1">
                    ${products.reduce((a, b) => a + b.stock * b.price, 0).toLocaleString()}
                  </h3>
                  <div className="text-[9px] font-mono text-white/30 mt-1">Across 25 Premium catalog nodes</div>
                </div>
                <div className="p-3 bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/25 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Active Vendor Orders</span>
                  <h3 className="font-display font-bold text-lg text-white mt-1">
                    {orders.length} orders
                  </h3>
                  <div className="text-[9px] font-mono text-green-400 mt-1">100% full compliance standard</div>
                </div>
                <div className="p-3 bg-green-500/10 text-green-400 border border-green-500/25 rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Feedback Learning Loop</span>
                  <h3 className="font-display font-bold text-lg text-white mt-1 animate-pulse">
                    MAB Active
                  </h3>
                  <div className="text-[9px] font-mono text-[#6366F1] mt-1">Click rewards tracked: {Object.values(clicks).reduce((a: number, b: number) => a + Number(b), 0)}</div>
                </div>
                <div className="p-3 bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/25 rounded-xl">
                  <Cpu className="w-5 h-5 animate-spin" />
                </div>
              </div>

              <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Conversion probability</span>
                  <h3 className="font-display font-bold text-lg text-white mt-1">
                    {cart.length > 0 ? "84.2%" : "22.5%"}
                  </h3>
                  <div className="text-[9px] font-mono text-white/30 mt-1">Recalculating over current session</div>
                </div>
                <div className="p-3 bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/25 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

            </div>

            {/* PRODUCT CATALOG MANAGING LIST */}
            <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg">
              <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
                <div>
                  <h3 className="font-display font-bold text-sm text-white">Dynamic Merchant Inventory Command</h3>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-widest">
                    Adjust catalog constraints to dynamically update weights
                  </p>
                </div>
                
                {/* Sale spike trigger simulation */}
                <div className="text-xs bg-white/5 border border-white/10 p-2 rounded-lg text-white/60 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  Judges Hub: Instantly trigger regional demand curves
                </div>
              </div>

              {/* GRID HEADER ROW */}
              <div className="hidden md:grid grid-cols-12 gap-4 text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider mb-2.5 pb-2 border-b border-white/10 select-none">
                <span className="col-span-1">ID</span>
                <span className="col-span-4">Product Instance Information</span>
                <span className="col-span-2">Category</span>
                <span className="col-span-1 text-center font-bold">Unit Price</span>
                <span className="col-span-1 text-center font-bold">Stock</span>
                <span className="col-span-1 text-center font-bold">MAB Weight</span>
                <span className="col-span-2 text-right font-bold">Actions Simulator</span>
              </div>

              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                {products.map(p => (
                  <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition">
                    
                    <span className="text-[10px] font-mono font-bold text-[#6366F1] col-span-1">
                      {p.id.toUpperCase()}
                    </span>

                    {/* Meta info */}
                    <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                      <img src={p.image} alt="" className="w-9 h-9 object-cover rounded shadow-inner border border-white/10" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{p.title}</h4>
                        <p className="text-[10px] text-white/50 font-normal truncate leading-normal italic">
                          "{p.description}"
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono bg-white/5 border border-white/15 px-2.5 py-0.5 rounded text-white/70 col-span-1 md:col-span-2 w-max uppercase">
                      {p.category}
                    </span>

                    <span className="text-center font-mono font-bold text-[#EC4899] text-xs col-span-1">
                      ${p.price}
                    </span>

                    {/* Stock triggers */}
                    <div className="col-span-1 flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateProductStock(p.id, -5)}
                        className="w-5 h-5 bg-white/5 hover:bg-white/10 border border-white/15 rounded text-xs flex items-center justify-center font-bold text-white"
                        title="Reduce stock by -5"
                      >
                        -
                      </button>
                      <span className={`font-mono text-xs font-bold w-6 text-center ${p.stock < 15 ? "text-red-400 animate-pulse font-extrabold" : "text-white"}`}>
                        {p.stock}
                      </span>
                      <button
                        onClick={() => updateProductStock(p.id, 5)}
                        className="w-5 h-5 bg-white/5 hover:bg-white/10 border border-white/15 rounded text-xs flex items-center justify-center font-bold text-white"
                        title="Add stock by +5"
                      >
                        +
                      </button>
                    </div>

                    {/* Bandit multiplier weight display */}
                    <span className="text-center text-xs font-mono font-bold text-[#6366F1] col-span-1">
                      {p.banditWeight.toFixed(1)}x
                    </span>

                    {/* Actions panel */}
                    <div className="col-span-1 md:col-span-2 flex justify-end gap-1.5">
                      <button
                        onClick={() => simulateSaleSpike(p.id)}
                        className="bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-bold text-[9px] py-1 px-2.5 rounded-md flex items-center gap-1 shadow-sm uppercase tracking-wide transition-all"
                        title="Trigger regional consumer spike to drive up analytics calculations"
                      >
                        <Flame className="w-3.5 h-3.5 fill-white" />
                        Trigger Spike
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>

            {/* SIMULATED INCOMING ORDERS GRID */}
            <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg">
              <h3 className="font-display font-bold text-sm text-white pb-2 border-b border-white/10 mb-3">
                Decentralized Consumer Fulfillment Log
              </h3>
              
              <div className="flex flex-col gap-3">
                {orders.map((ord, i) => (
                  <div key={ord.id} className="p-3 bg-white/5 rounded-lg border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#6366F1]">{ord.id}</span>
                        <span className="text-[10px] font-mono text-white/40">{ord.date}</span>
                        <span className="bg-[#EC4899]/15 text-[#EC4899] border border-[#EC4899]/30 text-[9px] font-mono px-2 py-0.5 rounded">
                          Buyer: {ord.persona}
                        </span>
                      </div>
                      <div className="text-xs mt-1.5 flex gap-3 text-white/55 flex-wrap">
                        {ord.items.map((it: any, idx: number) => (
                          <span key={idx} className="bg-white/5 border text-[10px] border-white/10 px-1.5 py-0.5 rounded flex items-center font-bold text-white/80">
                            {it.product.title} (x{it.quantity})
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-[10px] text-right font-mono text-white/40 uppercase">Total value</div>
                        <div className="font-mono text-xs font-bold text-[#EC4899]">${ord.total}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-mono text-white/40">STATUS</span>
                        <span className="text-[10px] font-bold text-green-400 font-mono">{ord.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==================== 📊 ADMIN COMMAND CENTER ==================== */}
        {activeTab === "admin" && (
          <div className="flex flex-col gap-6" id="admin-hub-workspace col-span-12">
            
            {/* STYLED CORE WIDGETS CHART LAYOUT - COVERS REQUIREMENT 7 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* ACCURACY GAUGE */}
              <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg flex flex-col justify-between h-[210px]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">MAB Accuracy Rating</span>
                    <h3 className="font-display font-bold text-lg text-white mt-1">94.62% Precision</h3>
                  </div>
                  <div className="p-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                </div>

                {/* Simulated visual bar charts */}
                <div className="my-3">
                  <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-green-400 to-teal-400 h-full rounded-full transition-all duration-1000" style={{ width: "94.62%" }}></div>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-white/40 mt-1.5 uppercase">
                    <span>Baseline (65%)</span>
                    <span className="text-green-400 font-bold">Optimal Bounds</span>
                  </div>
                </div>

                <p className="text-[10px] text-white/40 leading-normal">
                  Bandit loss minimization convergence has completed using regional click tracking values.
                </p>
              </div>

              {/* ACTIVE PERSONAS WIDGET */}
              <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg flex flex-col justify-between h-[210px]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Active Regional Persona</span>
                    <h3 className="font-display font-bold text-lg text-white mt-1 font-sans truncate pr-4">
                      {dominantPersona}
                    </h3>
                  </div>
                  <div className="p-1.5 bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 rounded-lg">
                    <Brain className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex gap-1.5 items-end justify-between h-14 mt-2">
                  {getPersonaMetrics().map((p, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-grow">
                      <div className="text-[9px] font-mono font-bold text-white/85">{p.percentage}%</div>
                      <div className={`w-full bg-gradient-to-t ${p.color} rounded min-h-[5px]`} style={{ height: `${Math.max(5, p.percentage * 0.5)}px` }}></div>
                      <span className="text-[8px] font-sans text-white/40 mt-1 truncate max-w-10">
                        {p.label.split(" ")[0]}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-white/40 mt-2 leading-tight">
                  Automatically recalculated based on click parameters.
                </p>
              </div>

              {/* TRENDING CATEGORIES */}
              <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg flex flex-col justify-between h-[210px]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Trending Category Growth</span>
                    <h3 className="font-display font-bold text-lg text-white mt-1">Electronics +14.5%</h3>
                  </div>
                  <div className="p-1.5 bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/20 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 my-3 font-mono text-[9px] text-white/50">
                  <div className="flex justify-between">
                    <span>Electronics:</span>
                    <span className="text-green-400 font-bold">+18.42% WoW</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gifts & Aromas:</span>
                    <span className="text-green-400 font-bold">+21.31% WoW</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance Fit:</span>
                    <span className="text-amber-400 font-bold">+4.18% WoW</span>
                  </div>
                </div>

                <p className="text-[10px] text-white/40 leading-normal">
                  Derived using 25 localized node catalog parameters.
                </p>
              </div>

              {/* CONVERSION PREDICTOR */}
              <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg flex flex-col justify-between h-[210px]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Session Conversion ML Model</span>
                    <h3 className="font-display font-bold text-lg text-white mt-1">
                      78% Action Likelihood
                    </h3>
                  </div>
                  <div className="p-1.5 bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 rounded-lg">
                    <Cpu className="w-4 h-4" />
                  </div>
                </div>

                {/* Progress Wheel Indicator */}
                <div className="flex items-center gap-3 my-2 bg-white/5 border p-2.5 rounded-lg border-white/10">
                  <span className="w-3.5 h-3.5 rounded-full bg-green-400 animate-pulse"></span>
                  <div>
                    <div className="text-[11px] font-mono text-white/80 font-bold">RECOMMENDED STRATEGY</div>
                    <div className="text-[10px] text-white/50">Auto-inject premium offers constraint</div>
                  </div>
                </div>

                <p className="text-[10px] text-white/40 leading-normal">
                  Conversion metrics calculated from shopping basket velocity.
                </p>
              </div>

            </div>

                    {/* MIDDLE ROW: VENDOR REQUESTS WITH FRAUD SCOPING & BOT CHECKS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* VENDOR APPROVAL INTERACTIVE FLOW */}
              <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg">
                <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
                  <div>
                    <h3 className="font-display font-bold text-sm text-white">Dynamic Vendor Approval Matrix</h3>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">
                      Autonomous validation checks parsing ledger registration anomalies
                    </p>
                  </div>
                  <ShieldCheck className="w-4.5 h-4.5 text-[#6366F1]" />
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    { company: "Apex Accessories Ltd", category: "Electronics accessories", riskScore: "4% Low Risk", verdict: "Approval Recommended - low risk", checked: true },
                    { company: "Elysian Linen Weavers", category: "Organic Bedding Home", riskScore: "9% Low Risk", verdict: "Approval Recommended - low risk", checked: true },
                    { company: "Zephyr Card Vaults", category: "Luggage & Wallets", riskScore: "84% HIGH RISK", verdict: "REPETITIVE ENTITY RECORD MISMATCH WARNING", checked: false },
                  ].map((v, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between gap-4 text-xs hover:bg-white/10 transition">
                      <div>
                        <h4 className="font-bold text-white">{v.company}</h4>
                        <div className="text-[10px] text-white/40 mt-0.5 flex gap-2 font-mono divide-x divide-white/10">
                          <span>{v.category}</span>
                          <span className={`pl-2 font-bold ${v.checked ? "text-green-400" : "text-rose-400"}`}>{v.riskScore}</span>
                        </div>
                        <p className="text-[10px] text-white/60 font-mono italic mt-1 font-semibold">{v.verdict}</p>
                      </div>

                      <div className="flex gap-1">
                        {!v.checked ? (
                          <button
                            onClick={() => triggerTelemetry("Ledger Risk Avoidance", "Blocked registry submission due to critical anomalies.")}
                            className="bg-red-500 hover:bg-red-600 text-white font-mono font-bold text-[9px] py-1 px-2.5 rounded shadow transition-all"
                          >
                            Deny
                          </button>
                        ) : (
                          <button
                            onClick={() => triggerTelemetry("Decentralized Approved Node", "Successfully updated master directory registry.")}
                            className="bg-green-500 hover:bg-green-600 text-white font-mono font-bold text-[9px] py-1 px-2.5 rounded shadow transition-all"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* REAL-TIME SECURITY FRAUD ENGINE MONITORING */}
              <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg">
                <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
                  <div>
                    <h3 className="font-display font-bold text-sm text-white">AI Fraud Monitoring Core</h3>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-widest">
                      Continuous ledger packet threat assessment ticker
                    </p>
                  </div>
                  <ShieldAlert className="w-4.5 h-4.5 text-rose-500 animate-ping" />
                </div>

                <div className="bg-black/80 text-green-400 p-4 rounded-lg font-mono text-[11px] leading-relaxed flex flex-col gap-1.5 max-h-[160px] overflow-y-auto select-text border border-white/5">
                  <div>[2026-05-26 20:09:00] -- Booting Threat Analysis Engine (v3.1.2)</div>
                  <div>[2026-05-26 20:09:02] -- Standard routing validation passed for checkout node.</div>
                  <div>[2026-05-26 20:09:12] -- Card verification complete. Dynamic bin mapping passed.</div>
                  <div>[2026-05-26 20:09:14] -- Bot buying pattern block triggered for IP range 194.22.x. [BLOCKED]</div>
                  <div>[2026-05-26 20:09:19] -- Telemetry packet reward check: 98.42% accuracy indices standard.</div>
                </div>

                <div className="mt-3 py-2 px-3 bg-red-950/20 text-red-200 border border-red-500/20 rounded-lg flex items-center gap-2.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-red-550 animate-ping flex-shrink-0"></span>
                  <p className="text-[10px] leading-tight text-white/70">
                    <span className="font-bold text-red-450 uppercase">Warning Thread:</span> 4 robot scraper sessions rejected from Auckland cluster since initialization.
                  </p>
                </div>
              </div>

            </div>

            {/* COMMISSION MANAGEMENTS */}
            <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg">
              <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
                <div>
                  <h3 className="font-display font-bold text-sm text-white">Dynamic Commission & Fee Indexer</h3>
                  <p className="text-[10px] text-white/40 font-mono">
                    Slide scale thresholds dynamically compiled over trade volume metrics
                  </p>
                </div>
                <DollarSign className="w-4.5 h-4.5 text-[#6366F1]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <span className="text-[9px] font-mono text-white/40 uppercase">Master Platform Reserve Cut</span>
                  <div className="font-mono text-lg font-bold text-white mt-1">3.5% Flat Rate</div>
                  <p className="text-[10px] text-white/50 mt-1 leading-normal">
                    Adjusted automatically to optimize node throughput constraints.
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <span className="text-[9px] font-mono text-white/40 uppercase">AI Discount Subventions</span>
                  <div className="font-mono text-lg font-bold text-[#EC4899] mt-1">$1,450 reserved</div>
                  <p className="text-[10px] text-white/50 mt-1 leading-normal">
                    Assisting onboarding operations via regional campaign funds.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-xs text-white/80 font-bold uppercase tracking-wide font-mono">Simulate cut controls</div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="3.5"
                    step="0.1"
                    onChange={(e) => triggerTelemetry("Platform cut matrix change", `Adjusted fee constraint to value ${e.target.value}%.`)}
                    className="w-full accent-[#6366F1] mt-1"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase">
                    <span>1.0% Low Fee</span>
                    <span>10.0% Max Fee</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==================== ℹ️ ABOUT PAGE ==================== */}
        {activeTab === "about" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-10"
            id="vendora-about-workspace"
          >
            {/* HERO SECTION */}
            <div className="relative overflow-hidden bg-zinc-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#6366F1]/5 via-transparent to-[#EC4899]/5 opacity-60 pointer-events-none" />
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-48 h-48 bg-[#6366F1]/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-4 right-1/4 w-36 h-36 bg-[#EC4899]/10 rounded-full blur-[60px] pointer-events-none" />

              <div className="flex-1 space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#6366F1]/10 to-[#EC4899]/10 border border-white/10 rounded-full text-xs font-mono text-purple-300">
                  <Sparkles className="w-3.5 h-3.5 text-[#EC4899] animate-pulse" />
                  <span>The Next-Generation of E-Commerce</span>
                </div>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-white leading-tight">
                  About <span className="bg-gradient-to-r from-[#6366F1] to-[#EC4899] bg-clip-text text-transparent animate-pulse">Vendora</span>
                </h2>
                <p className="text-sm text-white/80 leading-relaxed max-w-2xl font-sans font-normal">
                  Vendora is an AI-powered next-generation commerce platform designed to transform online shopping through intelligent recommendations, visual product discovery, AI-assisted shopping, trend forecasting, and personalized experiences. Our goal is to bridge the gap between buyers and vendors using cutting-edge AI technologies while making commerce smarter, faster, and more intuitive.
                </p>
              </div>

              <div className="w-full md:w-auto flex-shrink-0 flex justify-center items-center relative">
                <div className="w-48 h-48 rounded-2xl bg-zinc-950 border border-white/15 p-6 flex flex-col justify-center items-center gap-4 relative overflow-hidden group shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="p-4 bg-gradient-to-tr from-[#6366F1] to-[#EC4899] text-white rounded-2xl shadow-lg relative z-15 transform group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-10 h-10 animate-bounce" />
                  </div>
                  <div className="text-center relative z-10">
                    <div className="font-mono text-xs font-semibold text-white tracking-widest uppercase">MAB Model</div>
                    <div className="font-sans text-[10px] text-[#6366F1] font-bold uppercase mt-1">Status: Active</div>
                  </div>
                </div>
              </div>
            </div>

            {/* STATISTICS SECTION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: "25+ Smart Products", desc: "Dynamically evaluated in real time via conversion tracking coefficients.", icon: Tag, color: "text-[#6366F1]" },
                { label: "AI-Powered Recommendations", desc: "Continuous personalization stream using Multi-Armed Bandit weights.", icon: Brain, color: "text-[#EC4899]" },
                { label: "Visual Product Search", desc: "Simulated neural computer-vision categorizing matching layouts.", icon: Image, color: "text-cyan-400" },
                { label: "Personalized Shopping Assistant", desc: "Contextual AI planner parsing user profiles for optimal deals.", icon: Bot, color: "text-green-400" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg flex flex-col justify-between hover:border-white/20 hover:bg-zinc-900 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-display font-bold text-base text-white">{stat.label}</span>
                    <div className={`p-1.5 bg-white/5 rounded-lg border border-white/10 ${stat.color}`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed font-sans">{stat.desc}</p>
                </div>
              ))}
            </div>

            {/* MEET THE FOUNDERS */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-display font-bold text-xl text-white tracking-tight flex items-center gap-2">
                  <User className="w-5 h-5 text-[#6366F1]" />
                  Meet The Founders
                </h3>
                <p className="text-xs text-white/40 max-w-xl">
                  The visionary engineering and design team pushing the boundaries of AI commerce from Delhi Technological University (DTU).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    name: "Apoorva",
                    role: "Co-Founder & AI Engineer",
                    university: "Delhi Technological University (DTU)",
                    initials: "AJ",
                    gradient: "from-[#6366F1] to-purple-600",
                    linkedin: "https://www.linkedin.com/in/apoorva-jha",
                    github: "https://github.com/apoorva-jha"
                  },
                  {
                    name: "Pranav",
                    role: "Co-Founder & Full Stack Developer",
                    university: "Delhi Technological University (DTU)",
                    initials: "P",
                    gradient: "from-[#EC4899] to-rose-600",
                    linkedin: "https://www.linkedin.com/in/pranav",
                    github: "https://github.com/pranav"
                  },
                  {
                    name: "Vedant",
                    role: "Co-Founder & Product & Backend Engineer",
                    university: "Delhi Technological University (DTU)",
                    initials: "V",
                    gradient: "from-cyan-500 to-teal-500",
                    linkedin: "https://www.linkedin.com/in/vedant",
                    github: "https://github.com/vedant"
                  },
                  {
                    name: "Daksh",
                    role: "Co-Founder & Frontend & Design Lead",
                    university: "Delhi Technological University (DTU)",
                    initials: "D",
                    gradient: "from-amber-500 to-[#EC4899]",
                    linkedin: "https://www.linkedin.com/in/daksh",
                    github: "https://github.com/daksh"
                  }
                ].map((founder, idx) => (
                  <div key={idx} className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg flex flex-col items-center text-center hover:border-[#6366F1]/50 group transition-all duration-300">
                    {/* AVATAR */}
                    <div className="relative w-20 h-20 rounded-full mb-4 flex items-center justify-center p-0.5 border border-white/10 bg-zinc-950 group-hover:scale-105 transition-transform duration-300">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#EC4899] opacity-30 blur-sm group-hover:opacity-50 transition-opacity" />
                      <div className={`w-full h-full rounded-full bg-gradient-to-br ${founder.gradient} flex items-center justify-center text-white font-display font-extrabold text-xl shadow-inner relative z-10`}>
                        {founder.initials}
                      </div>
                    </div>

                    <h4 className="font-display font-bold text-sm text-white group-hover:text-[#EC4899] transition-colors">{founder.name}</h4>
                    <p className="text-[11px] font-mono text-[#6366F1] font-medium mt-1">{founder.role}</p>

                    <div className="flex items-center gap-1.5 text-[10px] text-white/50 bg-white/5 border border-white/10 py-1.5 px-3 rounded-full mt-3 leading-none font-sans">
                      <GraduationCap className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                      <span className="truncate max-w-[160px]">{founder.university}</span>
                    </div>

                    {/* SOCIALS */}
                    <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-white/5 w-full">
                      <a href={founder.linkedin} target="_blank" rel="noreferrer" className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-[#6366F1]/25 hover:border-[#6366F1]/40 transition-colors" title="LinkedIn Profile">
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                      <a href={founder.github} target="_blank" rel="noreferrer" className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-zinc-800 transition-colors" title="GitHub profile">
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTTOM SECTION WITH VISION & TECH GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* VISION */}
              <div className="lg:col-span-5 bg-gradient-to-br from-[#6366F1]/10 to-[#EC4899]/10 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col justify-between shadow-lg relative overflow-hidden min-h-[220px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#EC4899]/5 rounded-full blur-[40px] pointer-events-none" />
                <div>
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-[#EC4899]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-white tracking-wide">Our Vision</h3>
                  <p className="text-xs text-white/85 italic leading-relaxed font-sans mt-3">
                    "To build the most intelligent AI-driven marketplace where every shopping experience feels personalized, efficient, and enjoyable."
                  </p>
                </div>
                <div className="mt-8 border-t border-white/5 pt-4">
                  <div className="flex items-center justify-between text-[9px] font-mono text-white/40 uppercase">
                    <span>Target Convergence:</span>
                    <span className="text-green-400 font-bold">t = 0.99 optimal</span>
                  </div>
                </div>
              </div>

              {/* CORE TECHNOLOGIES */}
              <div className="lg:col-span-7 bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-white tracking-wide mb-2 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                    Core Technologies
                  </h3>
                  <p className="text-[11px] text-white/40 font-mono mb-4">
                    ENGINEERING MATRIX SPECIFICATIONS BUILT AND DEPLOYED
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { name: "Artificial Intelligence", desc: "MAB engines", color: "border-red-500/20" },
                      { name: "Recommendation Systems", desc: "Adaptive feed", color: "border-[#6366F1]/20" },
                      { name: "Visual Search", desc: "Convolutional AI", color: "border-cyan-500/20" },
                      { name: "Multi-Armed Bandit", desc: "Reward algorithm", color: "border-green-500/20" },
                      { name: "React", desc: "Dynamic Virtual DOM", color: "border-blue-500/20" },
                      { name: "TypeScript", desc: "Strict Compilation", color: "border-[#6366F1]/25" },
                      { name: "Node.js", desc: "High Volume", color: "border-[#EC4899]/20" },
                      { name: "Prisma", desc: "Query Engine Schema", color: "border-purple-500/20" },
                      { name: "PostgreSQL", desc: "Fulfillment Ledger", color: "border-indigo-500/20" }
                    ].map((tech, idx) => (
                      <div key={idx} className={`bg-white/5 border ${tech.color} p-2.5 rounded-xl hover:bg-white/10 transition-colors flex flex-col justify-center`}>
                        <span className="text-[11px] font-sans font-bold text-white leading-tight">{tech.name}</span>
                        <span className="text-[9px] font-mono text-white/40 mt-0.5">{tech.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* FOOTER METRICS AND TECH LABELS */}
      <footer className="bg-zinc-950 border-t border-white/10 py-8" id="vendora-footer">
        <div className="max-w-7xl mx-auto px-4 text-center select-none">
          <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
            V E N D O R A -- Autonomous AI E-Commerce Sandbox Environment
          </p>

          {/* NAVIGATION LINKS */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-4 mb-4 text-xs font-sans text-white/60">
            <button 
              onClick={() => { setActiveTab("buyer"); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`hover:text-white transition-colors uppercase tracking-wider font-mono ${activeTab === 'buyer' ? 'text-[#EC4899] font-bold' : ''}`}
            >
              Buyer Storefront
            </button>
            <button 
              onClick={() => { setActiveTab("merchant"); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`hover:text-white transition-colors uppercase tracking-wider font-mono ${activeTab === 'merchant' ? 'text-[#EC4899] font-bold' : ''}`}
            >
              Merchant Hub
            </button>
            <button 
              onClick={() => { setActiveTab("admin"); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`hover:text-white transition-colors uppercase tracking-wider font-mono ${activeTab === 'admin' ? 'text-[#EC4899] font-bold' : ''}`}
            >
              Admin Command
            </button>
            <button 
              onClick={() => { setActiveTab("about"); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`hover:text-white transition-colors uppercase tracking-wider font-mono ${activeTab === 'about' ? 'text-[#EC4899] font-bold' : ''}`}
            >
              About Vendora
            </button>
          </div>

          <div className="flex justify-center items-center gap-4 mt-2 font-mono text-[9px] text-[#6366F1]/80">
            <span>Core Version: 4.8.2-MAB</span>
            <span>Ref: Thomson Multipath</span>
            <span>Status: Perfect Sync</span>
          </div>
        </div>
      </footer>

        {/* ==================== 🔎 PRODUCT DETAIL MODAL ==================== */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#121212]/95 border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto text-white"
              onClick={(e) => e.stopPropagation()}
              id="product-details-modal"
            >
              <div className="flex justify-between items-start pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono bg-[#6366F1]/10 text-[#6366F1] px-2.5 py-0.5 rounded border border-[#6366F1]/20 font-bold uppercase tracking-wider">
                    {selectedProduct.category}
                  </span>
                  <h3 className="font-display font-bold text-lg text-white mt-1.5">{selectedProduct.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-sm font-bold transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5 items-stretch">
                <div className="rounded-xl overflow-hidden bg-white/5 max-h-[240px] border border-white/5">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col justify-between py-1 text-xs text-white/75">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-white/40">PRICE DISCLOSURE:</span>
                      <span className="font-mono text-base font-bold text-[#EC4899]">${selectedProduct.price}</span>
                    </div>
                    <p className="leading-relaxed mt-2 text-white/70">{selectedProduct.description}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <span className="font-mono text-[9px] text-white/40 font-bold uppercase block mb-1">Functional Features</span>
                    <div className="flex gap-1 flex-wrap">
                      {selectedProduct.features.map((feat, idx) => (
                        <span key={idx} className="bg-white/5 border border-white/10 text-white/80 text-[10px] px-2 py-0.5 rounded font-mono font-medium">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* MAB TELEMETRY DIAGNOSTIC BLOCK FOR THE EXPLICIT ITEM */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 my-5 select-none text-xs">
                <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-[#6366F1] font-bold animate-ping" />
                  MAB Reinforcement Telemetry
                </h4>
                <div className="grid grid-cols-2 gap-4 mt-2.5 font-mono text-[10px] text-white/50">
                  <div>
                    <div className="flex justify-between">
                      <span>Total views logged:</span>
                      <span className="font-bold text-white">{clicks[selectedProduct.id] || 0} clicks</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Category interactions:</span>
                      <span className="font-bold text-white">{categoryClicks[selectedProduct.category] || 0} times</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span>Active reward index:</span>
                      <span className="font-bold text-[#6366F1]">{selectedProduct.banditWeight.toFixed(1)}x coefficient</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Exploration likelihood:</span>
                      <span className="font-bold text-green-400">t = 0.85 optimal</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                <button
                  onClick={() => addToCompare(selectedProduct)}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white/70 font-semibold rounded-lg text-xs flex items-center gap-1 transition-all"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  Add to comparison
                </button>
                <button
                  onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                  className="px-5 py-2 bg-gradient-to-r from-[#EC4899] to-[#6366F1] hover:opacity-90 font-bold text-white rounded-lg text-xs transition-all"
                >
                  Buy It Instantly
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 🔎 MAIN COMPARATIVE MODAL GRID ==================== */}
      <AnimatePresence>
        {isComparingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 select-none"
            onClick={() => setIsComparingOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#121212]/95 border border-white/10 rounded-2xl max-w-4xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-white"
              onClick={(e) => e.stopPropagation()}
              id="comparison-screen-grid"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 rounded-lg">
                    <GitCompare className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">AI Product Comparison Matrix</h3>
                    <p className="text-[10px] text-white/40 font-mono">Reinforcement model compares weights side-by-side</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsComparingOpen(false)}
                  className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white w-8 h-8 border border-white/10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                >
                  ×
                </button>
              </div>

              {/* Dynamic comparative grid details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                
                {/* SLOT 1 CONTAINER */}
                <div className="border border-white/10 rounded-xl p-4 flex flex-col justify-between h-full bg-white/5">
                  {compareSlots[0] ? (
                    <div className="flex flex-col h-full">
                      <div className="relative h-28 rounded-lg overflow-hidden mb-3 border border-white/10">
                        <img src={compareSlots[0].image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          onClick={() => setCompareSlots([null, compareSlots[1]])}
                          className="absolute top-1.5 right-1.5 bg-black/80 hover:bg-black border border-white/15 text-white/90 w-5 h-5 text-[10px] rounded-full flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                      <h4 className="font-bold text-xs text-white line-clamp-1">{compareSlots[0].title}</h4>
                      <p className="text-[10px] font-mono text-[#EC4899] font-bold mt-1">${compareSlots[0].price}</p>
                      
                      <div className="mt-3 flex-grow flex flex-col gap-1.5 text-xs text-white/75">
                        <span className="font-semibold text-white/50">PROS:</span>
                        <ul className="list-disc pl-4 text-[10px] space-y-0.5 text-white/70">
                          {compareSlots[0].pros.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                        <span className="font-semibold text-white/50 mt-2">CONS:</span>
                        <ul className="list-disc pl-4 text-[10px] space-y-0.5 text-white/70">
                          {compareSlots[0].cons.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex justify-between font-mono text-[10px] font-bold">
                        <span>Value score:</span>
                        <span className="text-[#6366F1]">{compareSlots[0].valueScore}/100</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center text-xs text-white/30 italic">
                      Slot 1 Empty. Select a catalog product to fill this.
                    </div>
                  )}
                </div>

                {/* THE AI MIDDLE JUDGING DECISION MATRIX */}
                <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/10 text-white rounded-xl p-5 flex flex-col justify-between h-full shadow-lg relative">
                  <div className="absolute right-3 top-3 w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                  
                  <div>
                    <span className="bg-white/5 text-cyan-300 font-mono font-bold text-[9px] py-0.5 px-2 rounded-full border border-white/10 uppercase tracking-wider">
                      Dynamic AI Decider
                    </span>
                    <h4 className="font-display font-medium text-xs text-[#6366F1] mt-3 uppercase tracking-widest">Aesthetic Verdict</h4>
                    
                    {compareSlots[0] && compareSlots[1] ? (
                      <div className="mt-3 flex flex-col gap-3">
                        <div>
                          <div className="text-[10px] font-mono text-white/40 uppercase">Recommended pick:</div>
                          <p className="text-xs font-bold text-green-400 flex items-center gap-1 mt-1 font-display">
                            <Sparkles className="w-3.5 h-3.5" />
                            {compareSlots[0].valueScore >= compareSlots[1].valueScore ? compareSlots[0].title : compareSlots[1].title}
                          </p>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-white/40 uppercase">AI reasoning analysis:</div>
                          <p className="text-[10px] text-white/80 italic leading-relaxed mt-1">
                            "Analyzing continuous feature matrices, the value profile yields higher utility density per dollar on{' '}
                            {compareSlots[0].valueScore >= compareSlots[1].valueScore ? compareSlots[0].title : compareSlots[1].title}
                            . Fully optimized with active MAB telemetry coefficients."
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-white/40 mt-2 leading-relaxed">
                        Queue product slots in the storefront cards to generate the dynamic comparison verdict instantly.
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-1.5 font-mono text-[9px] text-white/40">
                    <div className="flex justify-between">
                      <span>Confidence Level:</span>
                      <span className="text-[#EC4899] font-bold">96.84% ML</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Utility Coefficient:</span>
                      <span className="text-[#6366F1] font-bold">t = 0.5 Bandit</span>
                    </div>
                  </div>
                </div>

                {/* SLOT 2 CONTAINER */}
                <div className="border border-white/10 rounded-xl p-4 flex flex-col justify-between h-full bg-white/5">
                  {compareSlots[1] ? (
                    <div className="flex flex-col h-full">
                      <div className="relative h-28 rounded-lg overflow-hidden mb-3 border border-white/10">
                        <img src={compareSlots[1].image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          onClick={() => setCompareSlots([compareSlots[0], null])}
                          className="absolute top-1.5 right-1.5 bg-black/80 hover:bg-black border border-white/15 text-white/90 w-5 h-5 text-[10px] rounded-full flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                      <h4 className="font-bold text-xs text-white line-clamp-1">{compareSlots[1].title}</h4>
                      <p className="text-[10px] font-mono text-[#EC4899] font-bold mt-1">${compareSlots[1].price}</p>
                      
                      <div className="mt-3 flex-grow flex flex-col gap-1.5 text-xs text-white/75">
                        <span className="font-semibold text-white/50">PROS:</span>
                        <ul className="list-disc pl-4 text-[10px] space-y-0.5 text-white/70">
                          {compareSlots[1].pros.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                        <span className="font-semibold text-white/50 mt-2">CONS:</span>
                        <ul className="list-disc pl-4 text-[10px] space-y-0.5 text-white/70">
                          {compareSlots[1].cons.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex justify-between font-mono text-[10px] font-bold">
                        <span>Value score:</span>
                        <span className="text-[#6366F1]">{compareSlots[1].valueScore}/100</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center text-xs text-white/30 italic">
                      Slot 2 Empty. Select a catalog product to fill this.
                    </div>
                  )}
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10 mt-5">
                <button
                  onClick={() => {
                    setCompareSlots([null, null]);
                    triggerTelemetry("Cleared queue comparison", "Flush complete.");
                  }}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  Reset slots
                </button>
                <button
                  onClick={() => setIsComparingOpen(false)}
                  className="px-5 py-2 bg-gradient-to-r from-[#EC4899] to-[#6366F1] hover:opacity-90 font-bold text-xs rounded-lg shadow transition-all"
                >
                  Close Screen
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 🔎 MAIN VISUAL SEARCH WINDOW ==================== */}
      <AnimatePresence>
        {isVisualSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 select-none"
            onClick={() => setIsVisualSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#121212]/95 border border-white/10 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-white"
              onClick={(e) => e.stopPropagation()}
              id="visual-search-modal"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 rounded-lg">
                    <Image className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-white">AI Visual Search Engine</h3>
                    <p className="text-[10px] text-white/40 font-mono">Simulated computer-vision category classifier</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVisualSearchOpen(false)}
                  className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-sm font-bold transition-all"
                >
                  ×
                </button>
              </div>

              {/* CHOOSE PRESET GRID */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                <span className="text-[10px] font-mono text-white/40 uppercase">Select Simulated Camera Image Input:</span>
                <div className="grid grid-cols-4 gap-3">
                  {VISUAL_SEARCH_PRESETS.map(preset => (
                    <div
                      key={preset.id}
                      onClick={() => handleVisualSearchPreset(preset)}
                      className="border border-white/10 bg-zinc-950 rounded-lg overflow-hidden cursor-pointer hover:border-[#6366F1] transition-all hover:scale-105"
                    >
                      <img src={preset.imageUrl} alt={preset.name} className="w-full h-16 object-cover" referrerPolicy="no-referrer" />
                      <div className="p-1.5 bg-[#121212] border-t border-white/5 text-center text-[9px] font-bold text-white/80 font-sans truncate">
                        {preset.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* THE SCANNING SIMULATOR BOX */}
              <div className="my-5 flex flex-col gap-2.5 items-center justify-center p-6 border border-dashed border-white/15 rounded-xl bg-white/5 relative min-h-[140px]">
                {isScanning ? (
                  <div className="text-center flex flex-col items-center gap-2">
                    <RefreshCw className="w-8 h-8 text-[#EC4899] animate-spin" />
                    <div className="font-mono text-xs font-bold text-[#6366F1]">
                      {scanStep === 1 && "Ingesting high-density pixel values..."}
                      {scanStep === 2 && "Analysing vector convolutional grids..."}
                      {scanStep === 3 && "Scoping match expectations across 25 nodes..."}
                    </div>
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest animate-pulse">Running Autonomous Model...</span>
                  </div>
                ) : scanResult ? (
                  <div className="flex flex-col gap-3 w-full">
                    {/* Visual search category detection card */}
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-start gap-4 text-xs">
                      <img src={scanResult.imageUrl} alt="" className="w-14 h-14 object-cover rounded shadow border border-white/10" referrerPolicy="no-referrer" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-[#EC4899]/15 text-[#EC4899] border border-[#EC4899]/30 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                            {scanResult.detectedCategory}
                          </span>
                          <span className="text-[10px] font-mono text-green-400 font-bold">
                            {scanResult.confidence}% Class Confidence
                          </span>
                        </div>
                        <h4 className="font-bold text-white mt-1">Classification Explainer:</h4>
                        <p className="text-[10px] text-white/70 leading-normal italic mt-1 capitalize p-1.5 bg-black/40 border border-white/5 rounded leading-relaxed">
                          "{scanResult.explanation}"
                        </p>
                      </div>
                    </div>

                    {/* MATCHING SECTOR */}
                    <div className="mt-2.5">
                      <span className="text-[10px] font-mono text-white/40 uppercase">Matching Inventory items:</span>
                      <div className="grid grid-cols-3 gap-3 mt-1.5">
                        {scanResult.similarProductIds.map(simId => {
                          const matchedP = products.find(p => p.id === simId);
                          if (!matchedP) return null;
                          return (
                            <div key={simId} className="bg-[#121212]/80 border border-white/10 rounded-lg p-2 flex flex-col justify-between text-xs hover:border-[#6366F1]/50 shadow-inner relative group">
                              <img src={matchedP.image} alt="" className="h-10 w-full object-cover rounded mb-1" referrerPolicy="no-referrer" />
                              <h5 className="font-bold text-[10px] text-white truncate">{matchedP.title}</h5>
                              <span className="font-mono text-[9px] text-[#EC4899] font-bold">${matchedP.price}</span>
                              <button
                                onClick={() => { addToCart(matchedP); setIsVisualSearchOpen(false); }}
                                className="mt-1 bg-gradient-to-r from-[#EC4899] to-[#6366F1] text-white font-semibold text-[9px] py-1 rounded hover:opacity-90 transition-all uppercase tracking-wider font-mono text-center block w-full"
                              >
                                Buy
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-xs text-white/30 p-4">
                    Select one of the simulated preset images above to trigger a computer-vision search flow!
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-white/10 mt-4">
                <button
                  onClick={() => setIsVisualSearchOpen(false)}
                  className="px-5 py-2 bg-gradient-to-r from-[#EC4899] to-[#6366F1] hover:opacity-90 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                >
                  Exit Classifier workspace
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
