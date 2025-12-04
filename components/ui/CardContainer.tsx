import React from 'react';
import { Card } from "@/components/ui/Card";

interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
  blur?: boolean;
  border?: boolean;
}

export const CardContainer: React.FC<CardContainerProps> = ({
  children,
  className = "",
  blur = true,
  border = true,
}) => {
  return (
    <Card className={`
      ${border ? 'border-border/20' : ''}
      bg-card/50 
      flex-col 
      ${blur ? 'backdrop-blur-sm' : ''}
      p-4 
      ${className}
    `}>
      {children}
    </Card>
  );
};

interface InstructionCardProps {
  title: string;
  items: string[];
  className?: string;
}

export const InstructionCard: React.FC<InstructionCardProps> = ({
  title,
  items,
  className = "",
}) => {
  return (
    <Card className={`
      border-border/50 
      bg-card/50 
      flex-col 
      relative 
      -z-10 
      backdrop-blur-sm 
      p-6 
      ${className}
    `}>
      <h3 className="text-foreground  font-medium mb-2">
        {title}
      </h3>
      <ul className="text-muted-foreground text-sm list-disc list-inside space-y-1">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </Card>
  );
};