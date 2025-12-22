import {
  Bot, Compass, Cpu, Hammer, Heart, MapPin, Navigation, PartyPopper, PawPrint, Radio, Sparkles, Truck, Wrench
} from "lucide-react";
import { Robot } from "../data/robots";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  if (!robot) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              {getPurposeIcon(robot.purpose)}
            </div>
            {robot.name}
          </DialogTitle>
          <DialogDescription>Robot Specifications</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
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
            <p className="text-xs font-medium text-muted-foreground mb-2">Sensors</p>
            <div className="flex flex-wrap gap-2">
              {robot.sensors.map((sensor) => (
                <Badge key={sensor} variant="secondary">
                  {sensor}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
