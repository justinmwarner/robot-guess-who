import {
  Bot, Compass, Hammer, Heart, PartyPopper, PawPrint, Sparkles, Truck, Wrench
} from "lucide-react";
import { useState } from "react";
import { Robot } from "../../scripts/robots";
import { useLongPress } from "../hooks/useLongPress";
import { cn } from "../lib/utils";
import { ImageStyle, useGameStore } from "../store/gameStore";
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

// Map purpose to hex colors for placeholder images
const getPurposeHexColor = (purpose: string) => {
  const colors: Record<string, string> = {
    Delivery: "f59e0b",      // amber-500
    Cleaning: "06b6d4",      // cyan-500
    "Helping people": "f43f5e", // rose-500
    "Helping animals": "10b981", // emerald-500
    Exploration: "8b5cf6",   // violet-500
    Entertainment: "d946ef", // fuchsia-500
    Building: "64748b",      // slate-500
    Fixing: "eab308",        // yellow-500
  };
  return colors[purpose] || "6b7280";
};

// Generate a placeholder image URL for a robot (fallback)
export const getPlaceholderImageUrl = (robot: Robot, size: number = 400) => {
  const bgColor = getPurposeHexColor(robot.purpose);
  const textColor = "ffffff";
  const text = encodeURIComponent(robot.name.replace(/ /g, "+"));
  return `https://placehold.co/${size}x${size}/${bgColor}/${textColor}/png?text=${text}`;
};

// Convert robot name to safe filename format
const getSafeRobotName = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
};

// Get the generated image URL for a robot with a specific style
export const getRobotImageUrl = (robot: Robot, style: ImageStyle) => {
  const safeName = getSafeRobotName(robot.name);
  return `${import.meta.env.BASE_URL}generated/${safeName}_${style}.png`;
};

// Get all style image URLs for a robot
export const getAllStyleImageUrls = (robot: Robot): Record<ImageStyle, string> => {
  return {
    blocky: getRobotImageUrl(robot, "blocky"),
    realistic: getRobotImageUrl(robot, "realistic"),
  };
};

export function RobotCard({ robot }: RobotCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { flippedRobots, toggleRobot, imageStyle } = useGameStore();

  const isFlipped = flippedRobots[robot.name] ?? false;

  const longPressHandlers = useLongPress({
    onLongPress: () => setDetailOpen(true),
    onClick: () => toggleRobot(robot.name),
    delay: 400,
  });

  // Use generated image, fallback to placeholder on error
  const imageUrl = imageError
    ? getPlaceholderImageUrl(robot, 400)
    : getRobotImageUrl(robot, imageStyle);

  return (
    <>
      <div
        className="relative aspect-[3/4] cursor-pointer select-none touch-manipulation"
        style={{ perspective: "1000px" }}
        {...longPressHandlers}
      >
        <div className={cn("flip-card absolute inset-0", isFlipped && "flipped")}>
          {/* Front of card */}
          <Card
            className={cn(
              "flip-card-face absolute inset-0 flex flex-col overflow-hidden p-0 gap-0",
              "hover:ring-2 hover:ring-ring hover:ring-offset-2 hover:ring-offset-background",
              "transition-shadow"
            )}
          >
            {/* Full-bleed background image */}
            <div className="absolute inset-0">
              <img
                src={imageUrl}
                alt={robot.name}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            </div>
            
            {/* Glass overlay content */}
            <div className="relative flex flex-1 flex-col">
              {/* Top glass panel with icon and name */}
              <div className="mt-auto backdrop-blur-md bg-white/70 dark:bg-black/60 p-3 border-t border-white/20">
                <div className="flex items-center gap-2">
                  {/* Icon */}
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-lg",
                    getPurposeColor(robot.purpose)
                  )}>
                    {getPurposeIcon(robot.purpose)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Name */}
                    <h3 className="text-sm font-bold leading-tight text-foreground truncate">
                      {robot.name}
                    </h3>
                    {/* Purpose badge inline */}
                    <Badge variant="secondary" className="mt-1 text-[10px] bg-white/50 dark:bg-white/20">
                      {robot.purpose}
                    </Badge>
                  </div>
                </div>
              </div>
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
