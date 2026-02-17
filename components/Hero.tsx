import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApplyButton, PortalButton } from './ui/FancyButtons';

const HERO_IMAGES = [
  "https://i.ibb.co/VcnkNVS3/hero.jpg",
  "https://i.ibb.co/Rk4gh5XG/teachering-1.jpg"
];

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [flip, setFlip] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlip(true);
      setTimeout(() => {
        setCurrentImageIndex(prev => (prev + 1) % HERO_IMAGES.length);
        setFlip(false);
        setAnimationKey(prev => prev + 1);
      }, 2000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    // Responsive Margin Top to match Header Height (16 for mobile, 20 for desktop)
    // Height uses dvh (Dynamic Viewport Height) for better mobile browser support
    <section
      id="landing-hero"
      className="relative w-full perspective-container bg-black overflow-hidden mt-16 md:mt-20"
      style={{ height: 'calc(100dvh - 4rem)', minHeight: '500px' }}
    >
      <style>{`
        @media (min-width: 768px) {
          #landing-hero {
            height: calc(100dvh - 5rem) !important; /* 5rem = 80px = h-20 */
          }
        }
      `}</style>

      {/* Next Image (Bottom Layer) */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center sm:bg-top z-0"
        style={{ backgroundImage: `url(${HERO_IMAGES[(currentImageIndex + 1) % HERO_IMAGES.length]})` }}
      />

      {/* Current Image (Flipping Top Layer) */}
      <div
        className={`absolute inset-0 w-full h-full bg-cover bg-center sm:bg-top z-10 origin-left ${flip ? 'book-page-flip' : ''}`}
        style={{ backgroundImage: `url(${HERO_IMAGES[currentImageIndex]})` }}
      >
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-coha-900 via-black/50 to-transparent z-20 pointer-events-none" />

      {/* Content — pinned to the bottom */}
      <div className="relative z-30 flex flex-col justify-end items-center w-full h-full text-center
                      px-4 sm:px-6
                      pb-12 sm:pb-16 lg:pb-24">

        <div className="max-w-7xl mx-auto flex flex-col items-center">
            <h1
              key={`title-${animationKey}`}
              className="cinematic-reveal font-archivo tracking-tighter leading-[0.9]
                        text-white drop-shadow-2xl mb-4 sm:mb-6
                        text-4xl sm:text-6xl lg:text-8xl xl:text-8xl flex flex-col items-center"
            >
              <span>BUILDING</span>
              <span className="whitespace-nowrap">FUTURE LEADERS</span>
            </h1>

            <p
              key={`text-${animationKey}`}
              className="fade-in-up-delay-1 text-white/90 font-sans font-medium drop-shadow-lg leading-relaxed
                        mb-8 sm:mb-12
                        text-sm sm:text-lg lg:text-2xl
                        max-w-xs sm:max-w-xl lg:max-w-3xl px-2"
            >
              Empowering every learner with inclusive education, innovation, and care.
              We provide a supportive environment where every child's potential is recognized and nurtured.
            </p>

            <div className="fade-in-up-delay-2 flex flex-col sm:flex-row gap-4 sm:gap-8 items-center w-full sm:w-auto scale-90 sm:scale-100 origin-bottom pb-4">
              <PortalButton onClick={() => navigate('/login')} />
              <ApplyButton onClick={() => navigate('/apply')} />
            </div>
        </div>
      </div>
    </section>
  );
};