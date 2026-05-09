import { useEffect, useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Import all video assets
import v1 from "@/assets/hero-video.mp4";
import v2 from "@/assets/hero-video-2.mp4";
import v3 from "@/assets/hero-video-3.mp4";
import v4 from "@/assets/hero-video-4.mp4";
import v5 from "@/assets/hero-video-5.mp4";
import v6 from "@/assets/hero-video-6.mp4";

const clips = [
  { 
    vid: v1, 
    eyebrow: "Atelier Society", 
    title: "Considered objects, made to last.", 
    desc: "Sourced and curated from independent makers for the modern minimalist.",
    cta: "Explore Collection"
  },
  { 
    vid: v2, 
    eyebrow: "The Collection", 
    title: "Quiet pieces for everyday rituals.", 
    desc: "Elevate your space with objects designed for stillness and function.",
    cta: "Shop Home"
  },
  { 
    vid: v3, 
    eyebrow: "Haute Electronics", 
    title: "Sound that disappears into the moment.", 
    desc: "Precision engineering meets timeless design in our newest audio series.",
    cta: "Discover Audio"
  },
  { 
    vid: v4, 
    eyebrow: "Boutique Essentials", 
    title: "Defining the contemporary wardrobe.", 
    desc: "Luxury materials and sustainable practices in every stitch.",
    cta: "Shop Apparel"
  },
  { 
    vid: v5, 
    eyebrow: "Limited Series", 
    title: "Rare finds, curated exclusively.", 
    desc: "A rotating selection of unique objects found across the globe.",
    cta: "View Rarities"
  },
  { 
    vid: v6, 
    eyebrow: "Atelier Journal", 
    title: "Stories behind the craft.", 
    desc: "Deep dives into the processes and people behind our objects.",
    cta: "Read Stories"
  }
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % clips.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Ensure video plays when index changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log("Autoplay blocked", e));
    }
  }, [index]);

  const current = clips[index];

  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-black">
      {/* Video Background Layer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover opacity-50 transition-transform duration-[8000ms] scale-110"
            style={{ animation: 'slow-zoom 8s linear infinite' }}
          >
            <source src={current.vid} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
          <div className="absolute inset-0 bg-black/10" />
        </motion.div>
      </AnimatePresence>

      {/* Content Layer */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl text-white"
          >
            <motion.p 
              initial={{ tracking: "0.2em", opacity: 0 }}
              animate={{ tracking: "0.5em", opacity: 0.8 }}
              className="text-[10px] uppercase font-bold text-white mb-6"
            >
              {current.eyebrow}
            </motion.p>
            
            <h1 className="text-4xl font-bold leading-[0.95] tracking-tighter sm:text-7xl md:text-8xl italic uppercase">
              {current.title.split(', ').map((part, i) => (
                <span key={i} className={i === 1 ? "text-zinc-500 block" : "block"}>{part}</span>
              ))}
            </h1>
            
            <p className="mt-8 max-w-lg text-lg text-zinc-300 leading-relaxed font-light">
              {current.desc}
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Link to="/shop">
                <Button size="lg" className="h-14 px-10 rounded-none bg-white text-black hover:bg-zinc-200 uppercase tracking-widest text-[10px] font-bold gap-3 group">
                  {current.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {clips.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setIndex(idx)}
            className={`h-0.5 transition-all duration-500 ${idx === index ? "w-12 bg-white" : "w-6 bg-white/20 hover:bg-white/40"}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 right-4 z-10 hidden sm:block lg:right-8">
        <div className="flex flex-col items-end gap-2">
          <span className="text-[10px] uppercase tracking-widest text-white/30 font-mono">Sequence 0{index + 1} // 06</span>
          <div className="h-1 w-32 bg-white/10 relative overflow-hidden">
             <motion.div 
               key={index}
               initial={{ x: "-100%" }}
               animate={{ x: "0%" }}
               transition={{ duration: 8, ease: "linear" }}
               className="absolute inset-0 bg-white"
             />
          </div>
        </div>
      </div>
    </section>
  );
}
