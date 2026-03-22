import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ 
  label, 
  error, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-text-muted">{label}</label>}
      <input 
        ref={ref}
        className={`w-full bg-background border rounded-md px-3 py-2 text-text placeholder-text-muted/50 focus:outline-none focus:ring-1 focus:border-transparent transition-all ${
          error ? 'border-danger focus:ring-danger/50' : 'border-border focus:ring-primary'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-danger mt-1">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
