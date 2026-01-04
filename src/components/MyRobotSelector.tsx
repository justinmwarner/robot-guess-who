import { Bot, Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Robot, robots } from "../../scripts/robots";
import { cn } from "../lib/utils";
import { useGameStore } from "../store/gameStore";
import { getRobotImageUrl, getPlaceholderImageUrl } from "./RobotCard";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface MyRobotSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog component for selecting the user's robot (their robot for others to guess)
 */
export function MyRobotSelector({ open, onOpenChange }: MyRobotSelectorProps) {
  const { myRobotName, setMyRobot, imageStyle } = useGameStore();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Get robot object from name
  const myRobot = useMemo(function findMyRobot() {
    return robots.find(function matchRobot(r) {
      return r.name === myRobotName;
    }) || null;
  }, [myRobotName]);

  function handleSelectRobot(robot: Robot) {
    setMyRobot(robot.name);
    onOpenChange(false);
  }

  function handleClearSelection() {
    setMyRobot(null);
  }

  function handleImageError(robotName: string) {
    setImageErrors(function updateErrors(prev) {
      return { ...prev, [robotName]: true };
    });
  }

  function getImageUrl(robot: Robot) {
    if (imageErrors[robot.name]) {
      return getPlaceholderImageUrl(robot, 200);
    }
    return getRobotImageUrl(robot, imageStyle);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Select Your Robot
          </DialogTitle>
          <DialogDescription>
            Choose the robot that others will try to guess. This is your secret robot!
          </DialogDescription>
        </DialogHeader>

        {/* Current selection indicator */}
        {myRobot && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg overflow-hidden border-2 border-primary">
                  <img
                    src={getImageUrl(myRobot)}
                    alt={myRobot.name}
                    className="h-full w-full object-cover"
                    onError={function onError() {
                      handleImageError(myRobot.name);
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{myRobot.name}</span>
                    <Badge variant="default" className="text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Selected
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{myRobot.purpose}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Robot grid */}
        <div className="flex-1 overflow-y-auto mt-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {robots.map(function renderRobotOption(robot) {
              const isSelected = robot.name === myRobotName;
              return (
                <button
                  key={robot.name}
                  onClick={function handleClick() {
                    handleSelectRobot(robot);
                  }}
                  className={cn(
                    "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                    "hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    isSelected
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-transparent hover:border-primary/50"
                  )}
                >
                  <img
                    src={getImageUrl(robot)}
                    alt={robot.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={function onError() {
                      handleImageError(robot.name);
                    }}
                  />
                  
                  {/* Name overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-xs font-medium text-white truncate">
                      {robot.name}
                    </p>
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

