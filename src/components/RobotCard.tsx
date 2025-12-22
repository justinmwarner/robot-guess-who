import {
  Bot, Compass, Hammer, Heart, PartyPopper, PawPrint, Sparkles, Truck, Wrench
} from "lucide-react";
import { useState } from "react";
import { Robot } from "../data/robots";
import { useLongPress } from "../hooks/useLongPress";
import { cn } from "../lib/utils";
import { useGameStore } from "../store/gameStore";
import { RobotDetailDialog } from "./RobotDetailDialog";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface RobotCardProps {
  robot: Robot;
}

const getPurposeIcon = (purpose: string) => {
  const icons: Record<string, React.ReactNode> = {
    Delivery: <Truck className="h-6 w-6" />,
    Cleaning: <Sparkles className="h-6 w-6" />,
    "Helping people": <Heart className="h-6 w-6" />,
    "Helping animals": <PawPrint className="h-6 w-6" />,
    Exploration: <Compass className="h-6 w-6" />,
    Entertainment: <PartyPopper className="h-6 w-6" />,
    Building: <Hammer className="h-6 w-6" />,
    Fixing: <Wrench className="h-6 w-6" />,
  };
  return icons[purpose] || <Bot className="h-6 w-6" />;
};

const getPurposeColor = (purpose: string) => {
  const colors: Record<string, string> = {
    Delivery: "bg-amber-500",
    Cleaning: "bg-cyan-500",
    "Helping people": "bg-rose-500",
    "Helping animals": "bg-emerald-500",
    Exploration: "bg-violet-500",
    Entertainment: "bg-fuchsia-500",
    Building: "bg-slate-500",
    Fixing: "bg-yellow-500",
  };
  return colors[purpose] || "bg-gray-500";
};

export function RobotCard({ robot }: RobotCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const { flippedRobots, toggleRobot } = useGameStore();

  const isFlipped = flippedRobots[robot.name] ?? false;

  const longPressHandlers = useLongPress({
    onLongPress: () => setDetailOpen(true),
    onClick: () => toggleRobot(robot.name),
    delay: 400,
  });

  return (
    <>
      <div
        className="relative aspect-[3/4] cursor-pointer select-none touch-none"
        style={{ perspective: "1000px" }}
        {...longPressHandlers}
      >
        <div className={cn("flip-card absolute inset-0", isFlipped && "flipped")}>
          {/* Front of card */}
          <Card
            className={cn(
              "flip-card-face absolute inset-0 flex flex-col overflow-hidden py-0 gap-0",
              "hover:ring-2 hover:ring-ring hover:ring-offset-2 hover:ring-offset-background",
              "transition-shadow"
            )}
          >
            {/* Color accent bar */}
            <div className={cn("h-2 w-full shrink-0", getPurposeColor(robot.purpose))} />
            
            {/* Content */}
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-2">
              {/* Icon */}
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full text-white",
                getPurposeColor(robot.purpose)
              )}>
                {getPurposeIcon(robot.purpose)}
              </div>
              
              {/* Name */}
              <h3 className="text-center text-xs font-semibold leading-tight px-1">
                {robot.name}
              </h3>
            </div>

            {/* Purpose badge */}
            <div className="p-2 pt-0 shrink-0">
              <Badge variant="secondary" className="w-full justify-center text-[10px]">
                {robot.purpose}
              </Badge>
            </div>
          </Card>

          {/* Back of card (eliminated) */}
          <Card
            className={cn(
              "flip-card-face flip-card-back absolute inset-0 py-0 gap-0",
              "flex flex-col items-center justify-center",
              "bg-muted"
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted-foreground/20">
              <Bot className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mt-2 text-center text-xs font-medium text-muted-foreground px-2 leading-tight">
              {robot.name}
            </h3>
            <Badge variant="outline" className="mt-2 text-[10px]">
              Eliminated
            </Badge>
          </Card>
        </div>
      </div>

      <RobotDetailDialog
        robot={robot}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
