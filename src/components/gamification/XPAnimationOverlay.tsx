import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Zap, Star, Trophy } from 'lucide-react';

interface XPParticle {
  id: string;
  xp: number;
  x: number;
  y: number;
  type: 'xp' | 'level' | 'achievement';
}

interface XPAnimationOverlayProps {
  particles: XPParticle[];
  onParticleComplete: (id: string) => void;
}

export const XPAnimationOverlay: React.FC<XPAnimationOverlayProps> = ({ 
  particles, 
  onParticleComplete 
}) => {
  const [mountedParticles, setMountedParticles] = useState<XPParticle[]>([]);

  useEffect(() => {
    // Add new particles
    const newParticles = particles.filter(
      p => !mountedParticles.find(mp => mp.id === p.id)
    );
    
    if (newParticles.length > 0) {
      setMountedParticles(prev => [...prev, ...newParticles]);
      
      // Remove particles after animation
      newParticles.forEach(particle => {
        setTimeout(() => {
          setMountedParticles(prev => prev.filter(p => p.id !== particle.id));
          onParticleComplete(particle.id);
        }, 2000);
      });
    }
  }, [particles, mountedParticles, onParticleComplete]);

  const getParticleIcon = (type: XPParticle['type']) => {
    switch (type) {
      case 'level':
        return <Star className="w-4 h-4 text-yellow-400" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      default:
        return <Zap className="w-3 h-3 text-primary" />;
    }
  };

  const getParticleColor = (type: XPParticle['type']) => {
    switch (type) {
      case 'level':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'achievement':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      default:
        return 'bg-gradient-to-r from-primary to-primary-glow text-primary-foreground';
    }
  };

  if (mountedParticles.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-50">
      {mountedParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-xp-float"
          style={{
            left: particle.x,
            top: particle.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className={`
            flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-lg border
            ${getParticleColor(particle.type)}
          `}>
            {getParticleIcon(particle.type)}
            {particle.type === 'level' && 'NIVEAU SUPÉRIEUR!'}
            {particle.type === 'achievement' && 'SUCCÈS DÉBLOQUÉ!'}
            {particle.type === 'xp' && `+${particle.xp} XP`}
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
};

// Hook to manage XP animations
export const useXPAnimations = () => {
  const [particles, setParticles] = useState<XPParticle[]>([]);

  const triggerXPAnimation = (
    xp: number, 
    element?: HTMLElement | null, 
    type: XPParticle['type'] = 'xp'
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    
    if (element) {
      const rect = element.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    const particle: XPParticle = {
      id,
      xp,
      x,
      y,
      type,
    };

    setParticles(prev => [...prev, particle]);
  };

  const removeParticle = (id: string) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  };

  return {
    particles,
    triggerXPAnimation,
    removeParticle,
  };
};