/**
 * Card Component
 * Gelişmiş hover efektleri ve micro-interactions
 */

import React, { useState } from 'react';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass';
type CardHoverEffect = 'lift' | 'glow' | 'tilt' | 'border-glow' | 'none';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  hoverEffect?: CardHoverEffect;
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-slate-900/50 border border-slate-700',
  elevated: 'bg-slate-900/80 border border-slate-600 shadow-lg',
  outlined: 'bg-transparent border-2 border-slate-700',
  glass: 'glass border border-white/10',
};

const sizePaddingClasses: Record<string, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const sizeClasses: Record<string, string> = {
  sm: 'rounded-xl',
  md: 'rounded-2xl',
  lg: 'rounded-3xl',
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = 'lift',
  className = '',
  onClick,
  clickable,
  size = 'md',
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Tilt effect için mouse position tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverEffect !== 'tilt') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  // Tilt hesaplama
  const tiltStyle = hoverEffect === 'tilt' && isHovered ? {
    transform: `perspective(1000px) rotateX(${-mousePosition.y / 10}deg) rotateY(${mousePosition.x / 10}deg) scale3d(1.02, 1.02, 1.02)`,
    transition: 'transform 0.1s ease-out',
  } : {
    transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  };

  // Hover effect classes
  const getHoverClasses = () => {
    switch (hoverEffect) {
      case 'lift':
        return 'hover:-translate-y-2 hover:shadow-2xl transition-all duration-300';
      case 'glow':
        return 'hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300';
      case 'tilt':
        return 'cursor-pointer';
      case 'border-glow':
        return 'hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300';
      case 'none':
        return '';
    }
  };

  const clickableClasses = clickable || onClick
    ? 'cursor-pointer active:scale-95'
    : '';

  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${sizePaddingClasses[size]}
        ${sizeClasses[size]}
        ${getHoverClasses()}
        ${clickableClasses}
        ${className}
      `}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Glow overlay for tilt effect */}
      {hoverEffect === 'tilt' && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${50 + mousePosition.x / 10}% ${50 + mousePosition.y / 10}%, rgba(6, 182, 212, 0.1) 0%, transparent 60%)`,
          }}
        />
      )}

      {children}
    </div>
  );
};

// Feature Card
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  color?: 'cyan' | 'purple' | 'pink' | 'green' | 'orange' | 'blue';
}

const colorClasses: Record<string, string> = {
  cyan: 'from-cyan-500 to-blue-600',
  purple: 'from-purple-500 to-pink-600',
  pink: 'from-pink-500 to-rose-600',
  green: 'from-green-500 to-emerald-600',
  orange: 'from-orange-500 to-red-600',
  blue: 'from-blue-500 to-indigo-600',
};

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  onClick,
  color = 'cyan',
}) => {
  return (
    <Card
      hoverEffect="lift"
      className="group hover:border-cyan-500/50 transition-colors"
      onClick={onClick}
    >
      <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
        {title}
      </h3>
      <p className="text-slate-400 leading-relaxed">
        {description}
      </p>
    </Card>
  );
};

// Stats Card
interface StatsCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'cyan' | 'purple' | 'pink' | 'green' | 'orange' | 'blue';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  value,
  label,
  icon,
  trend = 'neutral',
  trendValue,
  color = 'cyan',
}) => {
  const trendIcon = {
    up: (
      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    down: (
      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
    neutral: null,
  };

  return (
    <Card
      variant="elevated"
      className="text-center group hover:scale-105 transition-all duration-300"
    >
      {icon && (
        <div className={`w-12 h-12 bg-${color}-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform duration-300`}>
          <span className={`text-${color}-400`}>{icon}</span>
        </div>
      )}
      <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">
        {value}
      </div>
      <p className="text-slate-400 text-sm font-medium mb-2">{label}</p>
      {trend !== 'neutral' && trendValue && (
        <div className="flex items-center justify-center gap-1.5 text-xs">
          {trendIcon[trend]}
          <span className={trend === 'up' ? 'text-green-400' : 'text-red-400'}>
            {trendValue}
          </span>
        </div>
      )}
    </Card>
  );
};

// Testimonial Card
interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
  rating?: number;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  role,
  avatar,
  rating = 5,
}) => {
  return (
    <Card hoverEffect="lift" className="relative">
      {/* Quote Icon */}
      <div className="absolute top-4 right-4 text-6xl text-slate-700/50 opacity-50">
        "
      </div>

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <p className="text-slate-300 mb-6 text-lg leading-relaxed relative z-10">
        {quote}
      </p>

      {/* Author */}
      <div className="flex items-center gap-4">
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className="w-12 h-12 rounded-full border-2 border-cyan-500/50"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {author.charAt(0)}
          </div>
        )}
        <div>
          <div className="font-semibold text-white">{author}</div>
          <div className="text-sm text-slate-400">{role}</div>
        </div>
      </div>
    </Card>
  );
};

// Pricing Card
interface PricingCardProps {
  title: string;
  price: string;
  description?: string;
  features: string[];
  popular?: boolean;
  cta: string;
  onCta?: () => void;
  pricePeriod?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  description,
  features,
  popular,
  cta,
  onCta,
  pricePeriod = '/ay',
}) => {
  return (
    <div className={`
      relative p-8 rounded-2xl transition-all duration-300
      ${popular
        ? 'bg-gradient-to-b from-cyan-900/50 to-slate-900/50 border-2 border-cyan-500 scale-105 shadow-2xl shadow-cyan-500/20'
        : 'bg-slate-900/50 border border-slate-700 hover:scale-105 hover:shadow-2xl'
      }
    `}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg animate-pulse-glow">
          Popüler
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className={`text-xl font-bold mb-2 ${popular ? 'text-cyan-400' : 'text-white'}`}>
          {title}
        </h3>
        <div className="mb-2">
          <span className={`text-5xl font-black ${popular ? 'text-cyan-400' : 'text-white'}`}>
            {price}
          </span>
          <span className="text-slate-400 text-sm">{pricePeriod}</span>
        </div>
        {description && (
          <p className="text-slate-400 text-sm">{description}</p>
        )}
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-slate-300">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onCta}
        className={`
          w-full py-3 rounded-xl font-semibold transition-all duration-300
          ${popular
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/20 hover:scale-105'
            : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:scale-105'
          }
        `}
      >
        {cta}
      </button>
    </div>
  );
};

// Image Card with hover overlay
interface ImageCardProps {
  image: string;
  title?: string;
  subtitle?: string;
  overlay?: React.ReactNode;
  onClick?: () => void;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
}

const aspectRatioClasses: Record<string, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-video',
};

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  title,
  subtitle,
  overlay,
  onClick,
  aspectRatio = 'portrait',
}) => {
  return (
    <Card
      hoverEffect="lift"
      className="p-0 overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      <div className={`relative w-full ${aspectRatioClasses[aspectRatio]} overflow-hidden`}>
        {/* Image */}
        <img
          src={image}
          alt={title || 'Card image'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            {title && (
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            )}
            {subtitle && (
              <p className="text-slate-300 text-sm">{subtitle}</p>
            )}
            {overlay && (
              <div className="mt-4">{overlay}</div>
            )}
          </div>
        </div>

        {/* Hover glow */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-500/50 transition-colors duration-300" />
      </div>
    </Card>
  );
};

