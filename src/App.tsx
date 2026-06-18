import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Bolt,
  Check,
  Download,
  Image,
  Layers,
  HelpCircle,
  RefreshCw,
  Sliders,
  Maximize2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  X,
  Plus,
  Compass,
  Zap,
  CheckCircle,
  Info
} from "lucide-react";

interface GenerationHistoryItem {
  id: string;
  prompt: string;
  originalPrompt: string;
  imageUrl: string;
  aspectRatio: string;
  style: string;
  time: string;
  resolution: string;
}

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [selectedStyle, setSelectedStyle] = useState("Default");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Default initial image shown on mockup
  const defaultImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1024";

  const [currentImage, setCurrentImage] = useState(defaultImage);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<GenerationHistoryItem | null>(null);
  const [isImgZoomed, setIsImgZoomed] = useState(false);

  // Local storage history
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);

  // Navigation / Modal States
  const [activeTab, setActiveTab] = useState("workspace");
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showGetStartedModal, setShowGetStartedModal] = useState(false);

  // References for scrolling
  const workspaceRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);

  // Loading animation message sequence
  const loadingSteps = [
    "Aligning dimensional circles...",
    "Igniting digital alchemy chambers...",
    "Interlacing prompt vectors...",
    "Fusing neural patterns...",
    "Reticulating high-fidelity pixels...",
    "Polishing native UHD textures..."
  ];

  // Load history from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lumina_ai_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error reading from local storage", e);
    }
  }, []);

  // Timer to rotate loading step messages during generation
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const saveToHistory = (item: GenerationHistoryItem) => {
    const updated = [item, ...history];
    setHistory(updated);
    try {
      localStorage.setItem("lumina_ai_history", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving to local storage", e);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("lumina_ai_history");
    } catch (e) {
      console.error("Error clearing local storage", e);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);
    setSelectedHistoryItem(null);

    try {
      const response = await fetch("http://localhost:3000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          style: selectedStyle
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unexpected issue occurred while calling the model.");
      }

      setCurrentImage(data.imageUrl);

      // Create history record
      const newCreation: GenerationHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        prompt: data.prompt,
        originalPrompt: data.originalPrompt,
        imageUrl: data.imageUrl,
        aspectRatio: data.aspectRatio,
        style: data.style,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        resolution: "4K UHD"
      };

      saveToHistory(newCreation);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong. Please check your system setup logs.");
    } finally {
      setLoading(false);
    }
  };

  const selectPreset = (styleName: string, promptPreset: string) => {
    setSelectedStyle(styleName);
    setPrompt(promptPreset);
    workspaceRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAspectRatioClasses = (ratio: string) => {
    switch (ratio) {
      case "16:9":
        return "aspect-video w-full";
      case "9:16":
        return "aspect-[9/16] max-h-[500px] mx-auto";
      case "4:3":
        return "aspect-[4/3] w-full";
      case "3:4":
        return "aspect-[3/4] max-h-[500px] mx-auto";
      default:
        return "aspect-square w-full";
    }
  };

  // Evaluate the display target image safely
  const activeImageSource = selectedHistoryItem ? selectedHistoryItem.imageUrl : currentImage;

  return (
    <div className="immersive-bg text-on-surface font-sans min-h-screen antialiased selection:bg-primary/20 selection:text-white">
      {/* Top Navbar */}
      <nav className="bg-background/40 backdrop-blur-xl fixed top-0 w-full border-b border-white/5 shadow-[0_0_20px_rgba(99,102,241,0.1)] z-50">
        <div className="flex justify-between items-center h-20 px-6 sm:px-12 md:px-24 max-w-7xl mx-auto w-full">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="font-display text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-black hover:scale-105 transition-transform duration-200"
            id="nav-logo"
          >
            Lumina Studio
          </button>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => {
                showcaseRef.current?.scrollIntoView({ behavior: "smooth" });
                setActiveTab("gallery");
              }}
              className={`font-sans transition-colors hover:text-primary ${
                activeTab === "gallery" ? "text-primary" : "text-on-surface-variant"
              }`}
              id="nav-link-gallery"
            >
              Gallery
            </button>
            <button
              onClick={() => {
                workspaceRef.current?.scrollIntoView({ behavior: "smooth" });
                setActiveTab("workspace");
              }}
              className={`font-sans transition-colors hover:text-primary ${
                activeTab === "workspace" ? "text-primary" : "text-on-surface-variant"
              }`}
              id="nav-link-workspace"
            >
              Workspace
            </button>
            <button
              onClick={() => setShowPricingModal(true)}
              className="text-on-surface-variant hover:text-primary transition-colors"
              id="nav-link-pricing"
            >
              Pricing
            </button>
          </div>

          <button
            onClick={() => setShowGetStartedModal(true)}
            className="bg-gradient-to-r from-primary to-secondary text-on-secondary font-sans font-bold text-xs tracking-wider uppercase px-6 py-2.5 rounded-full hover:bloom-primary hover:scale-105 transition-all duration-200 active:scale-95"
            id="nav-btn-started"
          >
            Get Started
          </button>
        </div>
      </nav>
  

      {/* Main Container */}
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-6 sm:px-12 md:px-24 flex flex-col gap-24">
        
        {/* Hero & Prompt Input Area */}
        <section className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-12 mt-12 relative" ref={workspaceRef}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>
          
          <div className="max-w-3xl flex flex-col gap-6" id="welcome-header">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary uppercase tracking-widest mx-auto animate-pulse">
              <Sparkles className="h-3 w-3" /> Digital Alchemy Engine
            </span>
            <h1 className="font-display text-5xl md:text-[64px] md:leading-[1.1] tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-primary to-secondary font-black">
              Turn Imagination into Reality
            </h1>
            <p className="font-sans text-lg text-on-surface-variant max-w-2xl mx-auto">
              Harness the power of digital alchemy. Generate ultra-high-definition visual matter from raw data in milliseconds.
            </p>
          </div>

          <div className="w-full max-w-4xl flex flex-col gap-8">
            <div className="glass-panel text-left items-start p-4 flex gap-4 rounded-2xl shadow-xl">
              <div className="bg-primary/20 p-2 rounded-xl text-primary shrink-0 mt-0.5">
                <Info className="h-5 w-5" />
              </div>
              <div className="flex-grow">
                <h4 className="font-display font-semibold text-sm text-on-surface flex items-center gap-2">
                  Ready-To-Use Server-Side Generation
                </h4>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed mt-1">
                  This applet runs a secure local translation node on port 3000 to keep visual pipelines streamlined and asset configurations completely localized.
                </p>
              </div>
            </div>

            {/* Stylized Prompt Form */}
            <form onSubmit={handleGenerate} className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-tertiary to-secondary rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
              <div className="relative flex flex-col md:flex-row items-stretch md:items-center glass-panel p-2.5 shadow-2xl focus-within:border-primary/50 focus-within:bloom-primary transition-all duration-300 gap-2.5 rounded-2xl">
                <div className="flex items-center gap-3 px-3 flex-grow py-2 md:py-0">
                  <Sparkles className="text-tertiary shrink-0 h-5 w-5 animate-pulse" />
                  <input
                    className="w-full bg-transparent border-none text-on-surface text-base md:text-lg focus:ring-0 placeholder:text-outline/60 outline-none"
                    placeholder="Describe your vision (e.g., 'A bioluminescent deer in an ancient glowing forest')..."
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={loading}
                    id="prompt-input"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 px-2 pb-2 md:pb-0 justify-between md:justify-end border-t border-white/5 md:border-t-0 pt-2 md:pt-0 shrink-0">
                  <div className="relative flex items-center gap-1.5 bg-surface-container border border-white/10 px-3 py-2 rounded-xl text-xs hover:border-primary/50 transition-colors cursor-pointer">
                    <Sliders className="h-3.5 w-3.5 text-primary" />
                    <select
                      className="bg-transparent text-on-surface select-none pr-4 font-semibold outline-none border-none cursor-pointer"
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      disabled={loading}
                      title="Aspect Ratio"
                    >
                      <option className="bg-surface-container-highest" value="1:1">1:1 Square</option>
                      <option className="bg-surface-container-highest" value="16:9">16:9 Cinema</option>
                      <option className="bg-surface-container-highest" value="9:16">9:16 Portrait</option>
                      <option className="bg-surface-container-highest" value="4:3">4:3 Desktop</option>
                      <option className="bg-surface-container-highest" value="3:4">3:4 Book</option>
                    </select>
                  </div>

                  <div className="relative flex items-center gap-1.5 bg-surface-container border border-white/10 px-3 py-2 rounded-xl text-xs hover:border-primary/50 transition-colors cursor-pointer">
                    <Layers className="h-3.5 w-3.5 text-secondary" />
                    <select
                      className="bg-transparent text-on-surface select-none pr-4 font-semibold outline-none border-none cursor-pointer"
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      disabled={loading}
                      title="Art Style"
                    >
                      <option className="bg-surface-container-highest" value="Default">Default Style</option>
                      <option className="bg-surface-container-highest" value="Neon Dystopia">Neon Dystopia</option>
                      <option className="bg-surface-container-highest" value="Cosmic Impasto">Cosmic Impasto</option>
                      <option className="bg-surface-container-highest" value="Prismatic Void">Prismatic Void</option>
                      <option className="bg-surface-container-highest" value="Anime/Digital Art">Anime Art</option>
                      <option className="bg-surface-container-highest" value="Watercolor">Watercolor</option>
                      <option className="bg-surface-container-highest" value="Photorealistic">Photo</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className={`bg-gradient-to-r from-primary to-secondary text-on-secondary font-semibold text-sm shrink-0 whitespace-nowrap px-6 py-2.5 rounded-xl hover:bloom-primary hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      loading || !prompt.trim() ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                    id="generate-button"
                  >
                    <span>{loading ? "Forging..." : "Generate"}</span>
                    <Bolt className="h-4 w-4 text-on-secondary shrink-0 animate-bounce" />
                  </button>
                </div>
              </div>
            </form>

            {error && (
              <div className="bg-red-950/40 border border-red-500/30 text-red-200 text-xs px-4 py-3 rounded-xl text-left flex gap-2 items-center">
                <HelpCircle className="h-4 w-4 text-red-400 shrink-0" />
                <div className="flex-grow">
                  <span className="font-bold">Generation Issue: </span> {error}
                </div>
                <button onClick={() => setError(null)} className="p-1 hover:bg-red-900/40 rounded transition-colors text-red-400">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Render Stage Container */}
            <div className="w-full mt-4 flex flex-col lg:flex-row gap-6 items-stretch">
              
              {/* Primary Render Preview Box */}
              <div className="flex-grow glass-panel accent-glow rounded-2xl relative overflow-hidden group min-h-[420px] shadow-2xl flex flex-col justify-between p-4">
                <div className="flex-grow flex items-center justify-center p-2 relative h-full">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center gap-6 py-12 text-center z-20">
                      <div className="relative h-20 w-20 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
                        <div className="absolute inset-2 rounded-full border border-tertiary/20 border-b-tertiary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                        <Sparkles className="h-6 w-6 text-primary animate-bounce" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-display font-semibold text-lg text-primary animate-pulse">{loadingSteps[loadingStep]}</p>
                        <p className="font-sans text-xs text-on-surface-variant max-w-sm">Generating premium visual matter using optimized CDN neural pipelines. Please hold on...</p>
                      </div>
                      <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary animate-infinite-loading w-1/2 rounded-full"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                      <img
                        className={`max-h-[550px] object-contain rounded-xl shadow-xl transition-all duration-700 ease-out flex ${getAspectRatioClasses(
                          selectedHistoryItem ? selectedHistoryItem.aspectRatio : aspectRatio
                        )}`}
                        src={activeImageSource}
                        alt="Lumina AI masterpiece placeholder"
                        id="main-preview-image"
                      />

                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 duration-300 z-10 rounded-xl">
                        <button
                          onClick={() => downloadImage(activeImageSource, `lumina-ai-generation-${Date.now()}.png`)}
                          className="bg-primary hover:bg-primary-fixed-dim text-on-primary p-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg hover:bloom-primary"
                          title="Download image"
                        >
                          <Download className="h-5 w-5 font-bold" />
                        </button>
                        <button
                          onClick={() => setIsImgZoomed(true)}
                          className="bg-surface-container border border-white/10 hover:border-tertiary/50 hover:bloom-tertiary text-on-surface p-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
                          title="View fullscreen"
                        >
                          <Maximize2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full flex items-center justify-between border-t border-white/5 pt-3 mt-3 px-2 z-10 flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-tertiary/40 bg-background/50 backdrop-blur-md flex items-center justify-center text-tertiary shrink-0 shadow-inner">
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-tertiary/30 border-t-tertiary rounded-full animate-spin"></div>
                      ) : (
                        <Check className="h-5 w-5 text-tertiary" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-display font-bold text-xs text-on-surface uppercase tracking-wider">
                        {loading ? "Forging Canvas..." : selectedHistoryItem ? "Selected Creation" : "Current Masterpiece"}
                      </p>
                      <p className="font-mono text-[10px] text-tertiary">
                        {loading ? "Neural Speed Mode" : selectedHistoryItem ? `${selectedHistoryItem.resolution} • ${selectedHistoryItem.aspectRatio}` : "0.84s • 4K Resolution"}
                      </p>
                    </div>
                  </div>

                  {!loading && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadImage(activeImageSource, `lumina-ai-${Date.now()}.png`)}
                        className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high border border-white/10 hover:border-primary/40 rounded-xl px-4 py-2 text-xs font-semibold text-on-surface transition-all select-none hover:scale-105"
                      >
                        <Download className="h-3.5 w-3.5 text-primary" />
                        <span>Download 4K</span>
                      </button>
                      <button
                        onClick={() => setIsImgZoomed(true)}
                        className="flex items-center justify-center p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-white/10 text-on-surface-variant hover:text-on-surface transition-colors hover:scale-105"
                        title="Zoom In"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Panel Configuration */}
              <div className="w-full lg:w-80 shrink-0 glass-panel rounded-2xl p-5 flex flex-col gap-6 text-left">
                <div>
                  <h3 className="font-display font-semibold text-lg text-on-surface flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Sliders className="h-4 w-4 text-primary" /> Configuration
                  </h3>
                </div>

                <div className="space-y-2">
                  <span className="font-mono text-xs text-on-surface-variant flex items-center justify-between">
                    <span>ASPECT RATIO</span>
                    <span className="text-primary font-bold">{selectedHistoryItem ? selectedHistoryItem.aspectRatio : aspectRatio}</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { l: "1:1", name: "Square" },
                      { l: "16:9", name: "Cinema" },
                      { l: "9:16", name: "Portrait" },
                      { l: "4:3", name: "Classic" }
                    ].map((item) => (
                      <button
                        key={item.l}
                        onClick={() => {
                          setSelectedHistoryItem(null);
                          setAspectRatio(item.l);
                        }}
                        disabled={loading}
                        className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all text-xs outline-none focus:outline-none ${
                          (selectedHistoryItem ? selectedHistoryItem.aspectRatio : aspectRatio) === item.l
                            ? "bg-primary/20 border-primary text-primary font-bold bloom-primary"
                            : "bg-background/40 glass-panel hover:bg-background/80 text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        <span className="font-display font-bold">{item.l}</span>
                        <span className="text-[10px] opacity-80">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="font-mono text-xs text-on-surface-variant">ACTIVE RENDER STYLE</span>
                  <div className="glass-panel rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden bg-background/20">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full blur-lg"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-display font-bold text-sm text-primary">
                        {selectedHistoryItem ? selectedHistoryItem.style : selectedStyle}
                      </span>
                      <span className="bg-surface text-[10px] text-tertiary px-2 py-0.5 rounded-full border border-tertiary/20">Style Active</span>
                    </div>
                    <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed">
                      {/* Interactive style status descriptions */}
                      {(selectedHistoryItem ? selectedHistoryItem.style : selectedStyle) === "Default" && "Applies an elegant standard image resolution with smart depth."}
                      {(selectedHistoryItem ? selectedHistoryItem.style : selectedStyle) === "Neon Dystopia" && "Applies rain-slicked cyberpunk aesthetics with rich purples and neon cyans."}
                      {(selectedHistoryItem ? selectedHistoryItem.style : selectedStyle) === "Cosmic Impasto" && "Applies classical impasto textures and deep space swirling nebulae highlights."}
                      {(selectedHistoryItem ? selectedHistoryItem.style : selectedStyle) === "Prismatic Void" && "Applies modern studio lighting, crystalline refractions, and abstract 3D layouts."}
                      {(selectedHistoryItem ? selectedHistoryItem.style : selectedStyle) === "Anime/Digital Art" && "Applies hyper-vivid anime colors and clean digital character detailing."}
                      {(selectedHistoryItem ? selectedHistoryItem.style : selectedStyle) === "Watercolor" && "Applies delicate hand-drawn brush details on soft textured canvas gradients."}
                      {(selectedHistoryItem ? selectedHistoryItem.style : selectedStyle) === "Photorealistic" && "Applies professional depth-of-field, sharp lenses, and real atmospheric lighting parameters."}
                    </p>
                  </div>
                </div>

                {/* History Tray Dashboard Sidebar Content */}
                <div className="space-y-2 pt-2 border-t border-white/5 flex-grow overflow-y-auto max-h-[160px] pr-1">
                  <div className="flex justify-between items-center text-[11px] text-on-surface-variant mb-1">
                    <span>CREATION TRAYS</span>
                    {history.length > 0 && (
                      <button onClick={clearHistory} className="text-red-400 hover:underline text-[10px]">Clear all</button>
                    )}
                  </div>
                  {history.length === 0 ? (
                    <p className="text-[11px] text-on-surface-variant/60 italic text-center py-2">No generations found on this workstation device node yet.</p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedHistoryItem(item);
                            setCurrentImage(item.imageUrl);
                          }}
                          className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors border text-left ${
                            selectedHistoryItem?.id === item.id 
                              ? "bg-primary/10 border-primary/40 text-primary" 
                              : "bg-black/20 border-transparent hover:bg-black/40 text-on-surface-variant hover:text-on-surface"
                          }`}
                        >
                          <img src={item.imageUrl} className="w-8 h-8 rounded object-cover border border-white/10 shrink-0" alt="" />
                          <div className="overflow-hidden flex-grow">
                            <p className="text-[11px] font-bold truncate">{item.originalPrompt}</p>
                            <p className="text-[9px] opacity-60 font-mono">{item.time} • {item.style}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/5 shrink-0">
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    <span>Sampling Method</span>
                    <span className="font-mono font-semibold text-on-surface">Digital Alchemy v4.2</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    <span>Generation Speed</span>
                    <span className="font-mono font-semibold text-tertiary">~0.84s (Instant)</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    <span>Output Format</span>
                    <span className="font-mono font-semibold text-on-surface">4K UHD (PNG)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="py-6 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/5 hover:border-primary/50 hover:accent-glow transition-all duration-300 group text-left">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/30 group-hover:bloom-primary transition-all text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-on-surface">Ultra-HD Quality</h3>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                Pixel-perfect precision. Our engine renders every output in native 4K, ensuring flawless details for professional workflows.
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/5 hover:border-tertiary/50 hover:accent-glow transition-all duration-300 group text-left">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-tertiary/30 group-hover:bloom-tertiary transition-all text-tertiary">
                <Bolt className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-on-surface">Lightning Speed</h3>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                Experience near-instant generation times. Our optimized neural networks process complex prompts in fractions of a second.
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/5 hover:border-secondary/50 hover:accent-glow transition-all duration-300 group text-left">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-secondary/30 transition-all text-secondary">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-on-surface">Infinite Styles</h3>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                From photorealism to abstract 3D geometry. Access a boundless library of aesthetic models trained on millions of data points.
              </p>
            </div>
          </div>
        </section>

        {/* Explore Showcase Section */}
        <section className="py-6 flex flex-col gap-8 text-left scroll-mt-24 border-t border-white/5" ref={showcaseRef}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-black tracking-tight text-on-surface">Explore Art Style Modifiers</h2>
              <p className="font-sans text-sm text-on-surface-variant">Click any preset style below to load pre-configured parameters into your active canvas deck.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Neon Dystopia", p: "A quiet rain-slicked side alleyway inside Neo-Tokyo" },
              { name: "Cosmic Impasto", p: "An astronaut holding a shining lantern floating in deep space nebula clouds" },
              { name: "Prismatic Void", p: "Abstract crystalline geometric shape structures reflecting light rays" },
              { name: "Anime/Digital Art", p: "A brave warrior wizard casting a massive energy spell over a fantasy castle" }
            ].map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => selectPreset(item.name, item.p)}
                className="glass-panel bg-surface-container-low border border-white/5 p-4 rounded-xl cursor-pointer hover:border-primary/40 group transition-all"
              >
                <div className="font-display font-bold text-sm text-primary mb-1 group-hover:text-secondary transition-colors">{item.name}</div>
                <p className="text-[11px] text-on-surface-variant line-clamp-2 italic">"{item.p}"</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Fullscreen Zoomed Image Lightbox Portal */}
      {isImgZoomed && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => setIsImgZoomed(false)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors outline-none"
          >
            <X className="h-6 w-6" />
          </button>
          <img src={activeImageSource} className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" alt="Lumina high-res presentation visual" />
          <p className="text-white/60 text-xs mt-4 font-sans max-w-xl text-center truncate italic">
            {selectedHistoryItem ? selectedHistoryItem.prompt : prompt || "Lumina Studio Engine Masterpiece Output Rendering Grid"}
          </p>
        </div>
      )}
    </div>
  );
}