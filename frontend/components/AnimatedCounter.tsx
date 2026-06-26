import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1.6,
  className = ""
}) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return Math.round(latest).toLocaleString();
  });

  useEffect(() => {
    const controls = animate(count, value, { 
      duration, 
      ease: [0.16, 1, 0.3, 1] // Out-expo easing for smooth decelerating sweep
    });
    return () => controls.stop();
  }, [value, duration, count]);

  return (
    <motion.span className={className}>
      {rounded}
    </motion.span>
  );
};

interface StatDisplayProps {
  text: string;
  className?: string;
}

export const StatDisplay: React.FC<StatDisplayProps> = ({ text, className = "" }) => {
  // Regex to extract prefix, number (with optional commas/decimals), and suffix
  const match = text.match(/^([^0-9-.]*)([0-9,.]+)(.*)$/);
  if (!match) {
    return <span className={className}>{text}</span>;
  }
  
  const prefix = match[1];
  const numberStr = match[2].replace(/,/g, '');
  const suffix = match[3];
  
  const numValue = parseFloat(numberStr);
  if (isNaN(numValue)) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {prefix}
      <AnimatedCounter value={numValue} />
      {suffix}
    </span>
  );
};

export default AnimatedCounter;

