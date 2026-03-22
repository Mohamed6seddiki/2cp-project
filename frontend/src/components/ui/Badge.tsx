import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold";
  
  const variants = {
    default: "bg-surface-hover text-text-muted border border-border",
    primary: "bg-primary/10 text-primary border border-primary/20",
    success: "bg-success/10 text-success border border-success/20",
    warning: "bg-warning/10 text-warning border border-warning/20",
    danger: "bg-danger/10 text-danger border border-danger/20",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
