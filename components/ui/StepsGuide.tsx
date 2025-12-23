import { Card } from "./cards";

export const StepsGuide = ({ steps, title = "How It Works" }: {steps: {description: string; title: string}[], title: string}) => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <StepItem key={index} step={step} number={index + 1} />
        ))}
      </div>
    </Card>
  );
};

const StepItem = ({ step, number }: {step:{
    description: string;
    title: string;
}, number: number}) => (
  <div className="flex items-start gap-3">
    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
      <span className="text-primary text-sm font-bold">{number}</span>
    </div>
    <div>
      <h4 className="font-medium text-foreground">{step.title}</h4>
      <p className="text-muted-foreground text-sm mt-1">
        {step.description}
      </p>
    </div>
  </div>
);