"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Background from "@/components/background";
import { IoPlayCircle, IoPauseCircle, IoVolumeHigh, IoRefresh, IoArrowBack } from "react-icons/io5";
import { FaHandPaper, FaVideo, FaEye, FaNetworkWired } from "react-icons/fa";
import { Pacifico, Inter } from "next/font/google";
import PixelCard from "@/components/PixelCard";

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

// Use the existing environment variable from .env.local
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

// Visualization video props interface
interface VideoData {
  src: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

// Video player component
const VideoPlayer = ({ src, autoPlay = false }: { src: string; autoPlay?: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(err => {
          console.error("Video play error:", err);
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Add effect to update progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setProgress((video.currentTime / (video.duration || 1)) * 100);
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
    };
  }, []);


  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative overflow-hidden rounded-xl aspect-video bg-black/20 border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-lg shadow-black/20">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        loop
        playsInline
        onClick={togglePlay}
      />

      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-black/30 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        // whileHover={{ opacity: 1 }}
      >
        <motion.button
          onClick={togglePlay}
          className="text-6xl text-white/90 hover:text-white transition-colors duration-300 drop-shadow-lg pointer-events-auto"
          whileHover={{ scale: 1.1, textShadow: "0 0 8px rgba(255,255,255,0.5)" }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {isPlaying ? <IoPauseCircle /> : <IoPlayCircle />}
        </motion.button>
      </motion.div>

      {/* Improved video controls */}
      <div className="absolute bottom-0 left-0 right-0 py-3 px-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors"
          >
            {isPlaying ? (
              <IoPauseCircle className="text-white text-lg" />
            ) : (
              <IoPlayCircle className="text-white text-lg" />
            )}
          </button>

          <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden cursor-pointer">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </div>
          {/* Add volume control or fullscreen button here if needed */}
        </div>
      </div>
    </div>
  );
};

// Creating a custom heading component to solve the cutoff issue
const PacificoHeading = ({ 
  children, 
  className,
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  // Style like the main heading that works well
  return (
    <div className="relative py-3 my-2 overflow-visible"> {/* Increased padding */}
      <h3 
        className={cn(
          "font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300",
          pacifico.className,
          className
        )}
        style={{ 
          position: 'relative', 
          zIndex: 20,  
          display: 'inline-block', // Add this to handle text width properly
          paddingBottom: '0.55rem', // Extra padding to prevent clipping
          marginBottom: '0.55rem'   // Extra margin to prevent clipping
        }} // Add inline styles for maximum compatibility
      >
        {children}
      </h3>
    </div>
  );
};

// Main Visualization component
const VisualizePage: React.FC = () => {
  // Add mounted state to prevent hydration errors
  const [mounted, setMounted] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videoDataLoaded, setVideoDataLoaded] = useState<boolean>(false);
  const [isCheckingVideos, setIsCheckingVideos] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Video data state with proper typing
  const [videoData, setVideoData] = useState<{ [key: string]: VideoData }>({
    original: {
      src: "", // Initialize empty, load in useEffect
      title: "Original Video",
      description: "Raw video input without any AI processing. This is the original sign language gesture as recorded.",
      icon: FaVideo
    },
    landmarks_overlay: {
      src: "", // Initialize empty
      title: "Landmarks Overlay",
      description: "MediaPipe landmarks overlaid on the original video, showing how the AI detects and tracks body movements.",
      icon: FaEye
    },
    landmarks_only: {
      src: "", // Initialize empty
      title: "Neural Network Visualization",
      description: "Pure visualization of the landmark points the neural network uses to recognize and classify the sign.",
      icon: FaNetworkWired
    }
  });

  // Set mounted state and start polling for videos from API
  useEffect(() => {
    setMounted(true);

    // Check if visualization videos are ready
    const checkForVisualizations = async () => {
      if (isCheckingVideos) return;
      
      setIsCheckingVideos(true);
      try {
        const response = await fetch(`${BACKEND_API_URL}/check_visualizations`);
        if (!response.ok) {
          throw new Error(`Failed to check visualizations: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === "complete" && data.visualization_videos) {
          // Videos are ready from the API
          const updatedVideoData = {
            original: {
              ...videoData.original,
              src: data.visualization_videos.original,
            },
            landmarks_overlay: {
              ...videoData.landmarks_overlay,
              src: data.visualization_videos.landmarks_overlay,
            },
            landmarks_only: {
              ...videoData.landmarks_only,
              src: data.visualization_videos.landmarks_only,
            }
          };
          
          setVideoData(updatedVideoData);
          setVideoDataLoaded(true);
          return true; // Videos are ready
        }
        
        return false; // Videos not ready yet
      } catch (error) {
        console.error("Error checking visualization status:", error);
        setFetchError("Failed to fetch visualization data from server");
        return false;
      } finally {
        setIsCheckingVideos(false);
      }
    };

    let pollingInterval: NodeJS.Timeout;
    
    // Initial check
    checkForVisualizations().then(videosReady => {
      if (!videosReady) {
        // Start polling if videos aren't ready
        pollingInterval = setInterval(async () => {
          const ready = await checkForVisualizations();
          if (ready) {
            // Stop polling once videos are ready
            clearInterval(pollingInterval);
          }
        }, 2000); // Check every 2 seconds
      }
    });

    // Cleanup function
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // Handle video selection - improved to prevent issues with invisible videos
  const handleSelectVideo = (key: string) => {
    if (videoDataLoaded) {
      setSelectedVideo(key);
    }
  };

  // Fix for View All button - properly reset the view
  const handleViewAll = () => {
    // First set to null to trigger AnimatePresence exit animation
    setSelectedVideo(null);
  };

  // Don't render until mounted (prevents hydration issues)
  if (!mounted) return null;

  // Animation variants
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

  // Initial entry animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-[#030303]",
        inter.variable,
        pacifico.variable
      )}
    >
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#030303]" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05]"
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="absolute inset-0">
          <motion.div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0)_60%)]" />
          <motion.div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />
        </div>
      </div>

      {/* Add geometric shapes for visual consistency */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
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

      {/* <Background key="background-component" /> */}

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
              <Link
                href="/"
                className="relative flex items-center h-[48px] hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/assets/SignEaseLogo.png"
                  alt="SignEase Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <span
                  className={cn(
                    "text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 ml-3 leading-relaxed tracking-wide overflow-visible py-2",
                    pacifico.className,
                    "relative z-10"
                  )}
                >
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
              <motion.div whileHover={{ scale: 1.05, color: "#818cf8" }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                <Link
                  href="/"
                  className="hover:text-indigo-400 transition-all"
                >
                  Home
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05, color: "#818cf8" }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                <Link
                  href="/#technology"
                  className="hover:text-indigo-400 transition-all"
                >
                  Technology
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05, color: "#818cf8" }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                <Link
                  href="/#team"
                  className="hover:text-indigo-400 transition-all"
                >
                  Team
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05, color: "#818cf8" }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                <Link
                  href="/#contact"
                  className="hover:text-indigo-400 transition-all"
                >
                  Contact
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </nav>

        {/* Main content */}
        <main className="relative py-8 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col min-h-screen items-center justify-center pt-24 md:pt-32">
              {/* Module introduction - improved styling */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-center mb-16"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm mb-4 shadow-lg shadow-black/5"
                >
                  <motion.div
                    animate={{
                      opacity: [0.8, 1, 0.8],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Image
                      src="/assets/SignEaseLogo.png"
                      alt="SignEase Logo"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </motion.div>
                  <span className="text-sm text-white/80 tracking-wide font-medium">
                    AI Visualization
                  </span>
                </motion.div>

                <motion.h1
                  className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 relative z-10"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                    See How Our AI
                  </span>
                  <br />
                  <motion.span
                    className={cn(
                      "bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300",
                      pacifico.className
                    )}
                    animate={{
                      textShadow: [
                        "0 0 0px rgba(255,255,255,0)",
                        "0 0 5px rgba(255,255,255,0.4)",
                        "0 0 0px rgba(255,255,255,0)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    Processes Signs
                  </motion.span>
                </motion.h1>

                <motion.p
                  className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  Visualize how our technology works by exploring the different processing stages.
                  From raw video to AI landmark detection, see the computer vision in action.
                </motion.p>

                {/* Back to Detection button - improved styling */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="mt-8"
                >
                  <Link href="/sign-detection">
                    <Button
                      variant="ghost"
                      className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-full flex items-center gap-2 px-6 py-6 shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 transition-all duration-300"
                    >
                      <IoArrowBack className="text-sm" />
                      <span>Back to Sign Detection</span>
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Main visualization area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="w-full max-w-6xl mx-auto"
              >
                <motion.div
                  className="bg-white/[0.03] backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative"
                  whileHover={{
                    boxShadow: "0 0 40px rgba(129, 140, 248, 0.1), 0 0 20px rgba(244, 114, 182, 0.1)"
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Add subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/5 to-rose-900/5 pointer-events-none"></div>

                  {/* Improve loading state animation */}
                  {!videoDataLoaded && (
                    <div className="min-h-[400px] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-6">
                        <motion.div
                          animate={{
                            rotate: [0, 360],
                            borderColor: [
                              "rgba(129, 140, 248, 0.5)",
                              "rgba(244, 114, 182, 0.5)",
                              "rgba(129, 140, 248, 0.5)"
                            ],
                            boxShadow: [
                              "0 0 10px rgba(129, 140, 248, 0.3)",
                              "0 0 20px rgba(244, 114, 182, 0.3)",
                              "0 0 10px rgba(129, 140, 248, 0.3)"
                            ]
                          }}
                          transition={{
                            rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                            borderColor: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                            boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                          }}
                          className="w-16 h-16 rounded-full border-4 border-t-indigo-500 border-r-rose-500"
                        />
                        <motion.p
                          className="text-base text-white/70"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          {fetchError ? fetchError : "Loading visualization data..."}
                        </motion.p>
                      </div>
                    </div>
                  )}

                  {/* Video content when loaded */}
                  {videoDataLoaded && (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="relative"
                    >
                      {/* Selected video display */}
                      <AnimatePresence mode="wait">
                        {selectedVideo ? (
                          <motion.div
                            key="selected-video"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="mb-8"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                              <PacificoHeading className="text-3xl">
                                {videoData[selectedVideo].title}
                              </PacificoHeading>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full"
                                onClick={handleViewAll}
                              >
                                <IoRefresh className="mr-2" /> View All
                              </Button>
                            </div>

                            <div className="aspect-video max-h-[500px] overflow-hidden rounded-xl mb-6 shadow-xl shadow-black/30">
                              {/* Ensure src is valid before rendering */}
                              {videoData[selectedVideo]?.src ? (
                                <VideoPlayer src={videoData[selectedVideo].src} autoPlay={true} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-black/40 text-white/50">Video loading...</div>
                              )}
                            </div>

                            <motion.div
                              className="bg-white/[0.03] border border-white/10 rounded-xl p-6 backdrop-blur-sm"
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.2, duration: 0.5 }}
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-rose-500/20 flex items-center justify-center shrink-0 mt-1 border border-white/10 shadow-lg shadow-indigo-500/10">
                                  {React.createElement(videoData[selectedVideo].icon, { className: "text-indigo-300 text-xl" })}
                                </div>
                                <div>
                                  <h4 className="text-xl font-semibold text-white/90 mb-2">
                                    {videoData[selectedVideo].title}
                                  </h4>
                                  <p className="text-white/70 leading-relaxed">{videoData[selectedVideo].description}</p>
                                </div>
                              </div>
                            </motion.div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="all-videos"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mb-8"
                          >
                            <PacificoHeading className="text-3xl text-center mb-6">
                              Processing Pipeline
                            </PacificoHeading>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
                              {Object.entries(videoData).map(([key, data], index) => {
                                // Basic check if src is loaded
                                const videoExists = !!data.src;

                                return (
                                  <motion.div
                                    key={key}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    onClick={() => videoExists && handleSelectVideo(key)}
                                    className={cn(
                                      "cursor-pointer group relative",
                                      !videoExists && "opacity-60 cursor-not-allowed"
                                    )}
                                    whileHover={videoExists ? {
                                      y: -10,
                                      scale: 1.03,
                                      transition: { duration: 0.3, ease: "easeOut" }
                                    } : {}} // Only apply hover if video exists
                                  >
                                    <div className="aspect-video overflow-hidden rounded-xl mb-4 border border-white/10 group-hover:border-white/30 transition-all duration-300 shadow-lg shadow-black/30 group-hover:shadow-xl group-hover:shadow-indigo-500/10">
                                      {videoExists ? (
                                        <VideoPlayer src={data.src} />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-black/40">
                                          <div className="text-white/50 text-center p-4">
                                            <FaVideo className="text-3xl mx-auto mb-3 opacity-40" />
                                            <p>Video unavailable</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-start gap-3 p-1">
                                      <motion.div
                                        className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-rose-500/20 flex items-center justify-center shrink-0 mt-1 border border-white/10"
                                        whileHover={{
                                          scale: 1.1,
                                          boxShadow: "0 0 15px rgba(129, 140, 248, 0.3)"
                                        }}
                                      >
                                        {React.createElement(data.icon, { className: "text-indigo-300" })}
                                      </motion.div>
                                      <div>
                                        <h4 className="text-xl font-bold text-white/90 mb-1">
                                          {data.title}
                                        </h4>
                                        <p className="text-sm text-white/70 line-clamp-2">{data.description}</p>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>

                            {/* Enhanced visual indicator to show the sequence */}
                            <motion.div
                              className="flex justify-center mt-16"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6, duration: 0.5 }}
                            >
                              <div className="flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-rose-500/10 rounded-full border border-white/10 shadow-lg shadow-black/20 backdrop-blur-sm">
                                {/* Animate dots sequentially */}
                                {[0, 0.2, 0.4].map((delay, i) => (
                                  <React.Fragment key={i}>
                                    <motion.div
                                      className={`w-3 h-3 rounded-full ${
                                        i === 0 ? 'bg-indigo-400' : i === 1 ? 'bg-purple-400' : 'bg-rose-400'
                                      }`}
                                      animate={{
                                        scale: [1, 1.3, 1],
                                        boxShadow: [
                                          "0 0 0px rgba(255,255,255,0)",
                                          `0 0 12px ${i === 0 ? 'rgba(129, 140, 248, 0.6)' : i === 1 ? 'rgba(168, 85, 247, 0.6)' : 'rgba(251, 113, 133, 0.6)'}`,
                                          "0 0 0px rgba(255,255,255,0)"
                                        ]
                                      }}
                                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: delay }}
                                    />
                                    {i < 2 && ( // Render line only between dots
                                      <div className={`w-16 h-[1px] bg-gradient-to-r ${
                                        i === 0 ? 'from-indigo-400/70 to-purple-400/70' : 'from-purple-400/70 to-rose-400/70'
                                      }`}></div>
                                    )}
                                  </React.Fragment>
                                ))}
                                <span className="ml-4 text-white/80 text-sm font-medium tracking-wide">Processing Flow</span>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* AI explanation section */}
                      <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className="bg-gradient-to-br from-indigo-950/20 to-rose-950/20 border border-white/10 rounded-xl p-8 mt-12 backdrop-blur-sm shadow-xl shadow-black/20 relative"
                      >
                        {/* Add subtle animated gradient overlay */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-rose-500/[0.02] pointer-events-none"
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        />
                        
                        <PacificoHeading className="text-2xl flex items-center">
                          <motion.div
                            animate={{
                              rotate: [0, 5, -5, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="mr-4 opacity-80"
                          >
                            ✨
                          </motion.div>
                          How Our AI Processes Sign Language
                        </PacificoHeading>

                        {/* FIX: Wrap steps and line in a relative container */}
                        <div className="relative">
                           {/* Steps list */}
                          <div className="space-y-6 relative z-10">
                            {[
                              {
                                title: "Video Capture",
                                description: "First, we capture clear video of the sign language gesture using your webcam. Clean, well-lit video helps our model identify the gesture accurately.",
                                color: "indigo",
                                number: 1,
                                delay: 0.2
                              },
                              {
                                title: "Landmark Detection",
                                description: "Our AI then identifies key points (landmarks) on your hands, face and body using MediaPipe. These points track your movements precisely.",
                                color: "purple",
                                number: 2,
                                delay: 0.4
                              },
                              {
                                title: "Neural Network Analysis",
                                description: "The landmarks feed into our neural network which has been trained on thousands of sign language examples to recognize patterns and movements.",
                                color: "fuchsia",
                                number: 3,
                                delay: 0.6
                              },
                              {
                                title: "Sign Classification",
                                description: "Finally, the model classifies the gesture and provides its interpretation along with a confidence score, converting your sign to text.",
                                color: "rose",
                                number: 4,
                                delay: 0.8
                              }
                            ].map((step, index, array) => (
                              <motion.div
                                key={step.number}
                                className="flex gap-5 items-start"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: step.delay }}
                              >
                                <motion.div
                                  className={`mt-1 w-10 h-10 rounded-full 
                                  ${
                                    step.color === 'indigo' ? 'bg-indigo-500/30' : 
                                    step.color === 'purple' ? 'bg-purple-500/30' : 
                                    step.color === 'fuchsia' ? 'bg-fuchsia-500/30' : 'bg-rose-500/30'
                                  } 
                                  flex items-center justify-center shrink-0 z-10 shadow-md 
                                  border border-${step.color === 'indigo' ? 'indigo-400/40' : 
                                    step.color === 'purple' ? 'purple-400/40' : 
                                    step.color === 'fuchsia' ? 'fuchsia-400/40' : 'rose-400/40'
                                  }`} // Made backgrounds semi-transparent again but kept opaque enough to hide the line
                                  whileHover={{
                                    scale: 1.15,
                                    boxShadow: `0 0 20px rgba(${
                                      step.color === 'indigo' ? '129, 140, 248' :
                                      step.color === 'purple' ? '168, 85, 247' :
                                      step.color === 'fuchsia' ? '217, 70, 239' :
                                      step.color === 'rose' ? '251, 113, 133' : '255,255,255'
                                    }, 0.3)`
                                  }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                >
                                  <span className="text-sm font-bold text-white/90">{step.number}</span>
                                </motion.div>
                                <motion.div
                                  className="bg-white/[0.04] rounded-lg p-4 flex-1 shadow-inner shadow-black/10 border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-white/[0.06]"
                                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                                >
                                  <h4 className="text-lg font-semibold text-white/90 mb-2">
                                    {step.title}
                                  </h4>
                                  <p className="text-white/70 leading-relaxed">
                                    {step.description}
                                  </p>
                                </motion.div>
                              </motion.div>
                            ))}
                          </div>

                          {/* Vertical line */}
                          <div className="absolute left-5 top-[2.75rem] bottom-[3.25rem] w-[2px] z-0">
                            <motion.div
                              className="h-full w-full bg-gradient-to-b from-indigo-500/40 via-purple-500/40 to-rose-500/40 rounded-full"
                              initial={{ scaleY: 0, transformOrigin: 'top' }}
                              animate={{ scaleY: 1 }}
                              transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: 0.6 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>

              {/* Additional action buttons - improved styling to match app theme */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="mt-16 w-full max-w-4xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-6"
              >
                <Link href="/sign-detection">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Button
                      className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/25 border-0 rounded-full px-8 py-6 flex items-center justify-center gap-3 transition-all duration-300"
                    >
                      <FaHandPaper className="text-white/90" />
                      <span>Try Sign Detection</span>
                    </Button>
                  </motion.div>
                </Link>

                <Link href="/#technology">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 hover:border-white/20 rounded-full px-8 py-6 flex items-center justify-center gap-3 shadow-lg shadow-black/10 transition-all duration-300"
                    >
                      <IoVolumeHigh className="text-white/80" />
                      <span>Learn About Our Tech</span>
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VisualizePage;