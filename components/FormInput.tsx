/**
 * Floating Label Input Component
 * Modern form input'ları için floating label ve validation
 */

import React, { forwardRef, useState, useRef, useEffect, useImperativeHandle } from 'react';

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  onRightIconClick?: () => void;
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg',
};

const labelSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      rightIcon,
      size = 'md',
      onRightIconClick,
      className = '',
      value,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(!!value);
    const [showPassword, setShowPassword] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(!!value);
      props.onBlur?.(e);
    };

    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
      <div className="relative w-full">
        <div
          className={`relative transition-all duration-300 ${error ? 'ring-2 ring-red-500/50' : isFocused ? 'ring-2 ring-cyan-500/50' : ''
            }`}
        >
          {/* Icon */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            value={value}
            className={`
              w-full bg-slate-800 border border-slate-700 rounded-xl
              text-white placeholder-transparent
              focus:outline-none focus:border-cyan-500
              transition-all duration-300
              ${sizeClasses[size]}
              ${icon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {/* Floating Label */}
          <label
            className={`
              absolute left-4 transition-all duration-300 pointer-events-none
              ${isFocused || value
                ? `-${size === 'sm' ? 'top-2.5' : size === 'md' ? 'top-3' : 'top-3.5'} ${labelSizeClasses[size]} ${error ? 'text-red-500' : 'text-cyan-400'
                }`
                : `top-1/2 -translate-y-1/2 ${size === 'sm' ? 'text-sm' : 'text-base'} text-slate-400`
              }
              ${icon ? 'left-10' : ''}
            `}
          >
            {label}
          </label>

          {/* Right Icon (e.g., password toggle) */}
          {rightIcon && (
            <button
              type="button"
              onClick={() => {
                if (type === 'password') {
                  setShowPassword(!showPassword);
                }
                onRightIconClick?.();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {rightIcon}
            </button>
          )}
        </div>

        {/* Helper Text */}
        {(helperText || error) && (
          <div className={`mt-1.5 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            {error ? (
              <span className="text-red-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </span>
            ) : (
              <span className="text-slate-500">{helperText}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

// Textarea Component
interface FormTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  rows?: number;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      rows = 4,
      className = '',
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(!!value);
    const internalRef = useRef<HTMLTextAreaElement>(null);

    // Sync external ref with internal ref
    useImperativeHandle(ref, () => internalRef.current!);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(!!value);
      props.onBlur?.(e);
    };

    return (
      <div className="relative w-full">
        <div
          className={`relative transition-all duration-300 ${error ? 'ring-2 ring-red-500/50' : isFocused ? 'ring-2 ring-cyan-500/50' : ''
            }`}
        >
          <textarea
            ref={internalRef}
            value={value}
            rows={rows}
            className={`
              w-full bg-slate-800 border border-slate-700 rounded-xl
              text-white placeholder-transparent
              focus:outline-none focus:border-cyan-500 resize-y min-h-[120px]
              transition-all duration-300
              ${sizeClasses[size]}
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {/* Resize Indicator */}
          <div className="absolute bottom-2 right-2 text-slate-500 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v6m0 0h-6m6 0L13 13" />
            </svg>
          </div>

          <label
            className={`
              absolute left-4 transition-all duration-300 pointer-events-none
              ${isFocused || value
                ? `-${size === 'sm' ? 'top-2.5' : size === 'md' ? 'top-3' : 'top-3.5'} ${labelSizeClasses[size]} ${error ? 'text-red-500' : 'text-cyan-400'
                }`
                : `top-4 ${size === 'sm' ? 'text-sm' : 'text-base'} text-slate-400`
              }
            `}
          >
            {label}
          </label>
        </div>

        {/* Helper Text */}
        {(helperText || error) && (
          <div className={`mt-1.5 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            {error ? (
              <span className="text-red-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </span>
            ) : (
              <span className="text-slate-500">{helperText}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

// Select Component
interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  options: { value: string; label: string }[];
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      options,
      className = '',
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(!!value);

    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(!!value);
      props.onBlur?.(e);
    };

    return (
      <div className="relative w-full">
        <div
          className={`relative transition-all duration-300 ${error ? 'ring-2 ring-red-500/50' : isFocused ? 'ring-2 ring-cyan-500/50' : ''
            }`}
        >
          <select
            ref={ref}
            value={value}
            className={`
              w-full bg-slate-800 border border-slate-700 rounded-xl
              text-white appearance-none cursor-pointer
              focus:outline-none focus:border-cyan-500
              transition-all duration-300
              ${sizeClasses[size]}
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label
            className={`
              absolute left-4 transition-all duration-300 pointer-events-none
              ${isFocused || value
                ? `-${size === 'sm' ? 'top-2.5' : size === 'md' ? 'top-3' : 'top-3.5'} ${labelSizeClasses[size]} ${error ? 'text-red-500' : 'text-cyan-400'
                }`
                : `top-1/2 -translate-y-1/2 ${size === 'sm' ? 'text-sm' : 'text-base'} text-slate-400`
              }
            `}
          >
            {label}
          </label>

          {/* Arrow Icon */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Helper Text */}
        {(helperText || error) && (
          <div className={`mt-1.5 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            {error ? (
              <span className="text-red-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </span>
            ) : (
              <span className="text-slate-500">{helperText}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

// Checkbox Component
interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="relative w-full">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            ref={ref}
            className={`
              w-5 h-5 rounded border-2 border-slate-600 bg-slate-800
              appearance-none cursor-pointer
              checked:bg-cyan-500 checked:border-cyan-500
              transition-all duration-300
              hover:border-cyan-400
              focus:outline-none focus:ring-2 focus:ring-cyan-500/50
              ${error ? 'border-red-500 checked:bg-red-500 checked:border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
          <span
            className={`
              text-sm transition-colors duration-300
              ${error ? 'text-red-400' : 'text-slate-300 group-hover:text-white'}
            `}
          >
            {label}
          </span>
        </label>
        {error && (
          <div className="mt-1.5 text-sm text-red-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';

