import { Loader2, Users } from "lucide-react";
import { Card } from "./cards";

export const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export const EmptyState = ({ 
  icon: Icon = Users, 
  title,
  description
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm p-8 flex flex-col items-center justify-center h-64">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground text-center">{description}</p>
    </Card>
  );
};