import {
  Bot, ChevronLeft, ChevronRight, Compass, Cpu, Hammer, Heart, MapPin, Navigation, PartyPopper, PawPrint, Radio, Sparkles, Truck, Wrench
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Robot } from "../../scripts/robots";
import { cn } from "../lib/utils";
import { ImageStyle, IMAGE_STYLES, IMAGE_STYLE_LABELS } from "../store/gameStore";
import { getAllStyleImageUrls, getPlaceholderImageUrl } from "./RobotCard";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "./ui/dialog";

interface RobotDetailDialogProps {
  robot: Robot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getPurposeIcon = (purpose: string) => {
  const icons: Record<string, React.ReactNode> = {
    Delivery: <Truck className="h-5 w-5" />,
    Cleaning: <Sparkles className="h-5 w-5" />,
    "Helping people": <Heart className="h-5 w-5" />,
    "Helping animals": <PawPrint className="h-5 w-5" />,
    Exploration: <Compass className="h-5 w-5" />,
    Entertainment: <PartyPopper className="h-5 w-5" />,
    Building: <Hammer className="h-5 w-5" />,
    Fixing: <Wrench className="h-5 w-5" />,
  };
  return icons[purpose] || <Bot className="h-5 w-5" />;
};

export function RobotDetailDialog({
  robot,
  open,
  onOpenChange,
}: RobotDetailDialogProps) {
  const [currentStyleIndex, setCurrentStyleIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<ImageStyle, boolean>>({
    blocky: false,
    realistic: false,
  });
  
  // Touch/swipe handling refs (must be before early return)
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const goToPrevious = useCallback(() => {
    setCurrentStyleIndex((prev) => (prev - 1 + IMAGE_STYLES.length) % IMAGE_STYLES.length);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentStyleIndex((prev) => (prev + 1) % IMAGE_STYLES.length);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  }, [goToNext, goToPrevious]);

  if (!robot) return null;

  const currentStyle = IMAGE_STYLES[currentStyleIndex];
  const imageUrls = getAllStyleImageUrls(robot);

  const handleImageError = (style: ImageStyle) => {
    setImageErrors((prev) => ({ ...prev, [style]: true }));
  };

  const getImageUrl = (style: ImageStyle) => {
    return imageErrors[style] ? getPlaceholderImageUrl(robot, 800) : imageUrls[style];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden max-h-[90vh]">
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">{robot.name} Details</DialogTitle>
        
        {/* Left/Right layout container */}
        <div className="flex flex-col sm:flex-row h-full">
          {/* Left: Image carousel */}
          <div 
            className="relative w-full sm:w-1/2 aspect-square sm:aspect-auto sm:min-h-[500px] bg-muted group touch-pan-y flex-shrink-0"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Current image */}
            <img
              src={getImageUrl(currentStyle)}
              alt={`${robot.name} - ${IMAGE_STYLE_LABELS[currentStyle]}`}
              className="w-full h-full object-cover transition-opacity duration-300"
              onError={() => handleImageError(currentStyle)}
            />

            {/* Navigation arrows - visible on mobile, hover reveal on desktop */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Style indicator dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {IMAGE_STYLES.map((style, index) => (
                <button
                  key={style}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    index === currentStyleIndex
                      ? "bg-white w-6"
                      : "bg-white/50 hover:bg-white/70"
                  )}
                  onClick={() => setCurrentStyleIndex(index)}
                  aria-label={`View ${IMAGE_STYLE_LABELS[style]} style`}
                />
              ))}
            </div>

            {/* Style label badge */}
            <Badge 
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/50 text-white border-0"
            >
              {IMAGE_STYLE_LABELS[currentStyle]}
            </Badge>
          </div>

          {/* Right: Scrollable properties panel */}
          <div className="w-full sm:w-1/2 overflow-y-auto max-h-[50vh] sm:max-h-[500px]">
            {/* Header section */}
            <div className="p-6 pb-4 border-b sticky top-0 bg-background z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  {getPurposeIcon(robot.purpose)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{robot.name}</h2>
                  <p className="text-muted-foreground text-sm">Robot Specifications</p>
                </div>
              </div>
            </div>

            {/* Properties grid */}
            <div className="p-6 pt-4 grid gap-3">
              <Card className="py-3">
                <CardContent className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Cpu className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Purpose</p>
                    <p className="font-semibold">{robot.purpose}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="py-3">
                <CardContent className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Navigation className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Movement</p>
                    <p className="font-semibold">{robot.movement}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="py-3">
                <CardContent className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Environment</p>
                    <p className="font-semibold">{robot.environment}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="py-3">
                <CardContent className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Radio className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Control Type</p>
                    <p className="font-semibold">{robot.control}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="pt-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">Sensors ({robot.sensors.length})</p>
                <div className="flex flex-wrap gap-2">
                  {robot.sensors.map((sensor) => (
                    <Badge key={sensor} variant="secondary">
                      {sensor}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
