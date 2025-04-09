"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Background from "@/components/background"
import { FaArrowRight, FaSearch, FaExternalLinkAlt } from 'react-icons/fa'
import { Pacifico, Inter } from "next/font/google"

// Initialize fonts consistent with home page
const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Sign database with links
const signDatabase = [
  { name: "Zipper", link: "https://www.signingsavvy.com/media2/mp4-ld/23/23913.mp4" },
  { name: "Radio", link: "https://www.signingsavvy.com/media2/mp4-ld/35/35087.mp4" },
  { name: "Bird", link: "https://youtu.be/1ZEAGpAH284" },
  { name: "Blow", link: "https://youtu.be/AaAoVhtQ6Ec" },
  { name: "Wait", link: "https://youtu.be/YfwgS9ZsBVw" },
  { name: "Cloud", link: "https://youtu.be/FT17b-fyP4o" },
  { name: "Duck", link: "https://youtu.be/2ncQFdNnDqk" },
  { name: "Flower", link: "https://youtu.be/33DHyOmJN1Y" },
  { name: "Apple", link: "https://youtu.be/3wIiujOP6Ag" },
  { name: "Dry", link: "https://youtu.be/aki6TeQOTo1U" },
  { name: "Thirsty", link: "https://youtu.be/Bp1Znl8WU5A" },
  { name: "Donkey", link: "https://youtu.be/NYjk6-dXb40" },
  { name: "Owl", link: "https://youtu.be/uNMrZeLfl6M" },
  { name: "Not", link: "https://youtu.be/pUn7pNE5HEE" },
  { name: "Yellow", link: "https://youtu.be/nK4_8-U-Y9I" },
  { name: "Shh", link: "https://www.lifeprint.com/asl101/pages-signs/s/shh.htm" },
  { name: "Brother", link: "https://youtu.be/G0fzmn3pQng" },
  { name: "Cheek", link: "https://youtu.be/TMz143LfrMk" },
  { name: "Cute", link: "https://youtu.be/u9lPotOAyhQ" },
  { name: "Animal", link: "https://youtu.be/IyMuDawJZu0" },
  { name: "Another", link: "https://youtu.be/1LOt-sU8c60" },
  { name: "Any", link: "https://youtu.be/Dbq2emMTZE0" },
  { name: "Aunt", link: "https://youtu.be/_c8v25YlVyY" },
  { name: "Bad", link: "https://youtu.be/prwtXZ1o2As" },
  { name: "Because", link: "https://youtu.be/y-VBTZIkHTI" },
  { name: "Bee", link: "https://youtu.be/S713PTJEjV0" },
  { name: "Black", link: "https://youtu.be/O5_4x8p5t4U" },
  { name: "Boy", link: "https://youtu.be/5H6OSAy-Mzs" },
  { name: "Bye", link: "https://youtu.be/4e14uNAn2Ao" },
  { name: "Clean", link: "https://youtu.be/2PeTh4Ym048" },
  { name: "Dad", link: "https://youtu.be/1Vllc4F5ic0" },
  { name: "Ear", link: "https://youtu.be/Eqq_OZk1Eh4" },
  { name: "Eye", link: "https://youtu.be/RSoPZkncEKw" },
  { name: "Face", link: "https://youtu.be/vToOzx3lsVQ" },
  { name: "Find", link: "https://youtu.be/2O5wVw-rlIs" },
  { name: "Flage", link: "https://youtu.be/3weRyM3RjHY" },
  { name: "For", link: "https://www.signingsavvy.com/media2/mp4-ld/36/36842.mp4" },
  { name: "Gift", link: "https://youtu.be/AU76WBpnQDk" },
  { name: "Girl", link: "https://youtu.be/pwh3cOdoiG4" },
  { name: "Give", link: "https://youtu.be/PkJpgPxNhwE" },
  { name: "Hair", link: "https://youtu.be/9j2d2WQsriY" },
  { name: "Happy", link: "https://youtu.be/ZXHHO_DY6_A" },
  { name: "Hat", link: "https://youtu.be/bul0cjvDEEE" },
  { name: "Tv", link: "https://youtu.be/XH8-L7NjeNY" },
  { name: "Have", link: "https://www.signingsavvy.com/media2/mp4-ld/30/30327.mp4" },
  { name: "Hello", link: "https://www.signingsavvy.com/media2/mp4-ld/24/24851.mp4" },
  { name: "Home", link: "https://youtu.be/WSHD1XX7kWk" },
  { name: "Hot", link: "https://youtu.be/00cPyUsrC6M" },
  { name: "If", link: "https://youtu.be/M8CXHkOskvo" },
  { name: "Lion", link: "https://www.signingsavvy.com/media2/mp4-ld/30/30992.mp4" },
  { name: "Man", link: "https://youtu.be/rTUmMfWQ2rw" },
  { name: "Moon", link: "https://www.signingsavvy.com/media2/mp4-ld/33/33544.mp4" },
  { name: "Nose", link: "https://youtu.be/2FpYi18-FiU" },
];


// Add elegant shapes for visual consistency with home page
function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]",
          )}
        />
      </motion.div>
    </motion.div>
  );
}

const SignSearch: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);
  
  // Prevent hydration errors
  useEffect(() => {
    setIsClient(true);
    setMounted(true);
    
    // Check for URL params to pre-fill search
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');
    if (query) {
      setSearchQuery(query);
    }
  }, []);
  
  // Filter signs based on search query
  const filteredSigns = useMemo(() => {
    if (!searchQuery) return [];
    
    return signDatabase.filter(sign => 
      sign.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Animation variants consistent with home page
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: i * 0.05,
        ease: "easeOut",
      },
    }),
  };

  if (!isClient) {
    return null; // Prevent hydration issues
  }

  if (!mounted) return null;

  return (
    <div className={cn("relative min-h-screen w-full overflow-hidden bg-[#030303]", inter.variable, pacifico.variable)} suppressHydrationWarning>
      {/* Background with consistent styling */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[#030303]" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
        <div className="absolute inset-0">
          <motion.div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0)_60%)]" />
          <motion.div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />
        </div>
      </div>

      {/* Add geometric shapes for visual consistency */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.15]"
          className="left-[-5vw] md:left-[5vw] top-[15vh] md:top-[20vh]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.15]"
          className="right-[5vw] md:right-[10vw] top-[70vh] md:top-[75vh]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
      </div>
      
      <Background key="background-component" />

      <div className="relative z-10">
        {/* Navigation with smooth blur gradient - styled like home page */}
        <nav className="fixed top-0 left-0 right-0 z-30 flex justify-between">
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 backdrop-blur-[8px] backdrop-saturate-150 bg-black/5 pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between w-full px-6 min-h-[80px] py-4">
            <motion.div
              custom={0}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-4"
            >
              <Link href="/" className="relative flex items-center h-[48px] hover:opacity-80 transition-opacity">
                <Image 
                  src="/assets/SignEaseLogo.png" 
                  alt="SignEase Logo" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
                <span className={cn(
                  "text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 ml-3 leading-relaxed tracking-wide overflow-visible py-2",
                  pacifico.className
                )}>
                  SignEase
                </span>
              </Link>
            </motion.div>

            <motion.div
              custom={1}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="flex gap-4 text-white/90"
            >
              <Link
                href="/"
                className="hover:text-indigo-400 transition-all hover:scale-105"
              >
                Home
              </Link>
              <Link
                href="/sign-detection"
                className="hover:text-indigo-400 transition-all hover:scale-105"
              >
                Detection
              </Link>
              <Link
                href="/#technology"
                className="hover:text-indigo-400 transition-all hover:scale-105"
              >
                Technology
              </Link>
              <Link
                href="/#team"
                className="hover:text-indigo-400 transition-all hover:scale-105"
              >
                Team
              </Link>
            </motion.div>
          </div>
        </nav>

        {/* Main content */}
        <main className="relative py-4 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col min-h-screen items-center justify-start pt-24">
              {/* Search introduction */}
                   <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm mb-4"
                              >
                                <Image
                                  src="/assets/SignEaseLogo.png"
                                  alt="SignEase Logo"
                                  width={24}
                                  height={24}
                                  className="object-contain"
                                />
                                <span className="text-sm text-white/80 tracking-wide font-medium">
                                  Real-time Sign Language Recognition
                                </span>
                              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-center mb-8 w-full max-w-3xl"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                  <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                    Find your 
                  </span>{" "}
                  <span className={cn(
                    "bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300",
                    pacifico.className
                  )}>
                    Sign
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto mb-8">
                  Search for signs to find instructional videos and improve your sign language skills.
                  Didn't find the sign you were looking for in detection? Search our database here.
                </p>
              </motion.div>

              {/* Search component */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="w-full max-w-3xl mx-auto mb-10"
              >
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for a sign (e.g., Hello, Thank you, Bird...)"
                    className="w-full py-6 px-5 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl shadow-lg focus-visible:ring-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40">
                    <FaSearch className="text-lg" />
                  </div>
                </div>
              </motion.div>

              {/* Search Results */}
              <div className="w-full max-w-3xl mx-auto">
                {searchQuery && (
                  <>
                    <motion.h2 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xl font-semibold text-white/90 mb-4"
                    >
                      {filteredSigns.length > 0 
                        ? `Found ${filteredSigns.length} result${filteredSigns.length === 1 ? '' : 's'}`
                        : 'No results found'}
                    </motion.h2>
                    
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl min-h-[300px]">
                      {filteredSigns.length > 0 ? (
                        <motion.div 
                          className="grid gap-3"
                          initial="hidden"
                          animate="visible"
                          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                        >
                          {filteredSigns.map((sign, index) => (
                            <motion.div
                              key={sign.name}
                              custom={index}
                              variants={itemVariants}
                              className="group"
                            >
                              <a 
                                href={sign.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300"
                              >
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-rose-500/20 flex items-center justify-center mr-3">
                                    <span className={cn("text-lg text-white/70", pacifico.className)}>
                                      {sign.name.charAt(0)}
                                    </span>
                                  </div>
                                  <span className="text-white font-medium">{sign.name}</span>
                                </div>
                                <div className="flex items-center text-white/60 group-hover:text-white/90 transition-all">
                                  <span className="text-sm mr-2 hidden sm:inline">View Tutorial</span>
                                  <FaExternalLinkAlt className="text-sm" />
                                </div>
                              </a>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : searchQuery && (
                        <div className="flex flex-col items-center justify-center h-[300px]">
                          <div className="text-5xl mb-4 text-white/30">🔍</div>
                          <h3 className="text-xl font-medium text-white/70 mb-2">No matches found</h3>
                          <p className="text-white/50 text-center max-w-md">
                            Sorry, we couldn't find any signs matching "{searchQuery}". 
                            Try a different search term or check your spelling.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {!searchQuery && (
                  <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center shadow-xl">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-rose-500/20 flex items-center justify-center mb-6">
                        <FaSearch className="text-3xl text-white/70" />
                      </div>
                      <h3 className="text-2xl font-medium text-white/90 mb-3">Search Our Sign Dictionary</h3>
                      <p className="text-white/60 max-w-lg mb-6">
                        Type the name of a sign above to find video tutorials and improve your sign language skills.
                      </p>
                      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 max-w-xl">
                        {["Hello", "Thank", "Bird", "Apple", "Happy", "Boy", "Girl", "Home"].map((suggestion, i) => (
                          <Button
                            key={suggestion}
                            variant="outline"
                            onClick={() => setSearchQuery(suggestion)}
                            className="bg-white/5 hover:bg-white/10 border-white/10 text-white/80"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Additional info section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="mt-16 w-full max-w-3xl mx-auto text-center"
              >
                <div className="bg-gradient-to-r from-indigo-500/10 via-white/5 to-rose-500/10 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                  <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 mb-3">
                    Can't find what you're looking for?
                  </h3>
                  <p className="text-white/60 mb-4">
                    Our sign database is continuously expanding. Return to the detection page to try recognition again or explore our learning resources.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link 
                      href="/sign-detection" 
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-rose-500 hover:opacity-90 text-white rounded-full flex items-center justify-center gap-2 transition-all"
                    >
                      Back to Detection <FaArrowRight className="text-sm" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SignSearch;

