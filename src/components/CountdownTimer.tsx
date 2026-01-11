import { useCountdown } from '@/hooks/useCountdown';

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
}

export function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, isComplete } = useCountdown(targetDate);

  if (isComplete) {
    onComplete?.();
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <p className="text-center text-muted-foreground mb-6 font-body text-lg">
        Time until your match is revealed
      </p>
      
      <div className="flex items-center justify-center gap-3 md:gap-6">
        <TimeBlock value={days} label="Days" />
        <Separator />
        <TimeBlock value={hours} label="Hours" />
        <Separator />
        <TimeBlock value={minutes} label="Minutes" />
        <Separator />
        <TimeBlock value={seconds} label="Seconds" />
      </div>
      
      <p className="text-center mt-8 text-foreground/80 font-display text-xl md:text-2xl font-medium">
        <span className="text-gradient">{days} days</span>, <span className="text-gradient">{hours} hours</span>, <span className="text-gradient">{minutes} minutes</span> and <span className="text-gradient">{seconds} seconds</span>
        <br />
        <span className="text-muted-foreground text-lg">to unveil your match</span>
      </p>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center animate-countdown">
      <div className="bg-gradient-card shadow-card rounded-2xl p-4 md:p-6 min-w-[70px] md:min-w-[100px] border border-border/50">
        <span className="text-3xl md:text-5xl font-display font-bold text-gradient">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs md:text-sm text-muted-foreground mt-2 font-body uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span className="text-2xl md:text-4xl font-bold text-primary/40 animate-pulse-soft">:</span>
  );
}
