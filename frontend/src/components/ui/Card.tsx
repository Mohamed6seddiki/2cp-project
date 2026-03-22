import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ 
  children, 
  hoverable = false,
  className = '', 
  ...props 
}, ref) => {
  const baseStyles = "bg-surface rounded-xl border border-border shadow-soft";
  const hoverStyles = hoverable ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/50" : "";
  
  return (
    <div ref={ref} className={`${baseStyles} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
