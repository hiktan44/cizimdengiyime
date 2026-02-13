/**
 * Button Component
 * Ripple effect ve magnetic button'lar
 */

import React, { useRef, useState } from 'react';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'gradient';

type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  magnetic?: boolean;
  ripple?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600',
  success: 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/30',
  danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30',
  warning: 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-600/30',
  info: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30',
  gradient:
    'bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-600/50',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-7 py-3.5 text-lg rounded-xl',
  xl: 'px-9 py-4.5 text-xl rounded-2xl',
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  magnetic = false,
  ripple = true,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Magnetic effect
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    buttonRef.current.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  };

  const handleMouseLeave = () => {
    if (!magnetic || !buttonRef.current) return;
    buttonRef.current.style.transform = 'translate(0px, 0px)';
  };

  // Ripple effect
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ripple || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);

    // Ripple animasyonundan sonra temizle
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);

    onClick?.(e);
  };

  return (
    <button
      ref={buttonRef}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        relative overflow-hidden
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        font-semibold transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-105 active:scale-95
        ${ripple ? 'ripple' : ''}
        ${magnetic ? 'magnetic' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Ripples */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '0',
            height: '0',
            animation: 'ripple-effect 0.6s linear',
          }}
        />
      ))}

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <div className={`spinner-ring-sm ${iconSizeClasses[size]}`}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      )}

      {/* Content */}
      <span className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : ''}`}>
        {icon && iconPosition === 'left' && (
          <span className={iconSizeClasses[size]}>{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className={iconSizeClasses[size]}>{icon}</span>
        )}
      </span>
    </button>
  );
};

// Icon Button
interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'solid' | 'gradient';
  color?: 'cyan' | 'purple' | 'pink' | 'green' | 'red' | 'yellow' | 'blue' | 'slate';
}

const iconButtonSizeClasses: Record<string, string> = {
  sm: 'w-8 h-8 p-1.5',
  md: 'w-10 h-10 p-2',
  lg: 'w-12 h-12 p-2.5',
};

const colorClasses: Record<string, { ghost: string; solid: string }> = {
  cyan: {
    ghost: 'text-cyan-400 hover:bg-cyan-500/20',
    solid: 'bg-cyan-500 hover:bg-cyan-400 text-white',
  },
  purple: {
    ghost: 'text-purple-400 hover:bg-purple-500/20',
    solid: 'bg-purple-500 hover:bg-purple-400 text-white',
  },
  pink: {
    ghost: 'text-pink-400 hover:bg-pink-500/20',
    solid: 'bg-pink-500 hover:bg-pink-400 text-white',
  },
  green: {
    ghost: 'text-green-400 hover:bg-green-500/20',
    solid: 'bg-green-500 hover:bg-green-400 text-white',
  },
  red: {
    ghost: 'text-red-400 hover:bg-red-500/20',
    solid: 'bg-red-500 hover:bg-red-400 text-white',
  },
  yellow: {
    ghost: 'text-yellow-400 hover:bg-yellow-500/20',
    solid: 'bg-yellow-500 hover:bg-yellow-400 text-white',
  },
  blue: {
    ghost: 'text-blue-400 hover:bg-blue-500/20',
    solid: 'bg-blue-500 hover:bg-blue-400 text-white',
  },
  slate: {
    ghost: 'text-slate-400 hover:bg-slate-500/20',
    solid: 'bg-slate-500 hover:bg-slate-400 text-white',
  },
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'ghost',
  color = 'cyan',
  className = '',
  ...props
}) => {
  return (
    <button
      className={`
        ${iconButtonSizeClasses[size]}
        rounded-xl transition-all duration-300
        hover:scale-110 active:scale-95
        ${colorClasses[color][variant]}
        ${variant === 'gradient' ? 'bg-gradient-to-br from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/30' : ''}
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );
};

// Group of buttons
interface ButtonGroupProps {
  children: React.ReactNode;
  vertical?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  vertical = false,
  size = 'md',
}) => {
  return (
    <div
      className={`
        flex
        ${vertical ? 'flex-col' : 'flex-row'}
        ${size === 'sm' ? 'gap-1' : size === 'md' ? 'gap-2' : 'gap-3'}
      `}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;

          let borderRadius = '';
          if (!vertical) {
            borderRadius = isFirst
              ? 'rounded-l-xl rounded-r-none'
              : isLast
                ? 'rounded-r-xl rounded-l-none'
                : 'rounded-none';
          } else {
            borderRadius = isFirst
              ? 'rounded-t-xl rounded-b-none'
              : isLast
                ? 'rounded-b-xl rounded-t-none'
                : 'rounded-none';
          }

          return React.cloneElement(child as React.ReactElement, {
            className: `${borderRadius} ${child.props.className || ''}`,
          });
        }
        return child;
      })}
    </div>
  );
};

// Floating Action Button (FAB)
export const FAB: React.FC<{
  icon: React.ReactNode;
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  color?: 'cyan' | 'purple' | 'pink' | 'green' | 'red' | 'yellow' | 'blue';
}> = ({ icon, onClick, position = 'bottom-right', size = 'md', color = 'cyan' }) => {
  const positionClasses: Record<string, string> = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'w-12 h-12 p-3',
    md: 'w-14 h-14 p-3.5',
    lg: 'w-16 h-16 p-4',
  };

  const colorClasses: Record<string, string> = {
    cyan: 'bg-gradient-to-br from-cyan-500 to-blue-600 hover:shadow-cyan-500/50',
    purple: 'bg-gradient-to-br from-purple-500 to-pink-600 hover:shadow-purple-500/50',
    pink: 'bg-gradient-to-br from-pink-500 to-rose-600 hover:shadow-pink-500/50',
    green: 'bg-gradient-to-br from-green-500 to-emerald-600 hover:shadow-green-500/50',
    red: 'bg-gradient-to-br from-red-500 to-orange-600 hover:shadow-red-500/50',
    yellow: 'bg-gradient-to-br from-yellow-500 to-amber-600 hover:shadow-yellow-500/50',
    blue: 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:shadow-blue-500/50',
  };

  return (
    <button
      onClick={onClick}
      className={`
        fixed ${positionClasses[position]}
        ${sizeClasses[size]}
        ${colorClasses[color]}
        rounded-2xl shadow-2xl
        flex items-center justify-center
        text-white transition-all duration-300
        hover:scale-110 hover:shadow-2xl
        active:scale-95 animate-float
        z-40
      `}
    >
      <span className="scale-125">{icon}</span>
    </button>
  );
};

