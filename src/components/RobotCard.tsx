import { Bot } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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

// Estimates badge width based on text content
function estimateBadgeWidth(text: string): number {
  // Each character is roughly 5px at 8px font size, plus padding (8px) and gap (4px)
  const charWidth = 5;
  const padding = 8;
  const gap = 4;
  return text.length * charWidth + padding + gap;
}

export function RobotCard({ robot }: RobotCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [visibleSensorCount, setVisibleSensorCount] = useState(robot.sensors.length);
  const sensorsContainerRef = useRef<HTMLDivElement>(null);
  const { flippedRobots, toggleRobot, imageStyle } = useGameStore();

  // Calculate how many sensors fit in the container
  const calculateVisibleSensors = useCallback(function calculateVisibleSensors() {
    const container = sensorsContainerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const overflowBadgeWidth = 28; // "+N" badge approximate width
    
    // Calculate sensor label widths (removing " sensor(s)" suffix)
    const sensorLabels = robot.sensors.map((s) => s.replace(" sensors", "").replace(" sensor", ""));
    
    let usedWidth = 0;
    let count = 0;
    
    for (let i = 0; i < sensorLabels.length; i++) {
      const badgeWidth = estimateBadgeWidth(sensorLabels[i]);
      const remainingAfterThis = containerWidth - usedWidth - badgeWidth;
      const hasMoreSensors = i < sensorLabels.length - 1;
      
      // If this is not the last sensor, ensure there's room for overflow badge
      if (hasMoreSensors && remainingAfterThis < overflowBadgeWidth) {
        break;
      }
      
      // If adding this badge would exceed container width, stop
      if (usedWidth + badgeWidth > containerWidth) {
        break;
      }
      
      usedWidth += badgeWidth;
      count++;
    }
    
    setVisibleSensorCount(Math.max(1, count)); // Always show at least 1
  }, [robot.sensors]);

  // Observe container size changes
  useEffect(function observeSensorContainer() {
    const container = sensorsContainerRef.current;
    if (!container) return;

    calculateVisibleSensors();

    const resizeObserver = new ResizeObserver(calculateVisibleSensors);
    resizeObserver.observe(container);

    return function cleanup() {
      resizeObserver.disconnect();
    };
  }, [calculateVisibleSensors]);

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
              {/* Bottom glass panel with name and attributes */}
              <div className="mt-auto backdrop-blur-md bg-white/70 dark:bg-black/60 p-2 border-t border-white/20">
                {/* Name */}
                <h3 className="text-sm font-bold leading-tight text-foreground truncate mb-1">
                  {robot.name}
                </h3>
                {/* Attributes grid */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-foreground/80">
                  <span className="truncate"><span className="font-semibold">Purpose:</span> {robot.purpose}</span>
                  <span className="truncate"><span className="font-semibold">Move:</span> {robot.movement}</span>
                  <span className="truncate"><span className="font-semibold">Env:</span> {robot.environment}</span>
                  <span className="truncate"><span className="font-semibold">Control:</span> {robot.control.replace("Fully autonomous", "Auto").replace("Human-controlled", "Human").replace("Mixed human and AI control", "Mixed")}</span>
                </div>
                {/* Sensors */}
                <div ref={sensorsContainerRef} className="mt-1 flex flex-wrap gap-1">
                  {robot.sensors.slice(0, visibleSensorCount).map((sensor) => (
                    <Badge 
                      key={sensor} 
                      variant="secondary" 
                      className="text-[8px] px-1 py-0 h-4 bg-white/50 dark:bg-white/20"
                    >
                      {sensor.replace(" sensors", "").replace(" sensor", "")}
                    </Badge>
                  ))}
                  {robot.sensors.length > visibleSensorCount && (
                    <Badge 
                      variant="secondary" 
                      className="text-[8px] px-1 py-0 h-4 bg-white/50 dark:bg-white/20"
                    >
                      +{robot.sensors.length - visibleSensorCount}
                    </Badge>
                  )}
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
