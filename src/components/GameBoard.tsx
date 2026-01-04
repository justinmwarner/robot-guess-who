import { Bot, Eye, EyeOff, Grid3x3 as Grid3x3Icon, HelpCircle, Palette, RotateCcw, X } from "lucide-react";
import { useMemo, useState } from "react";
import { robots } from "../../scripts/robots";
import { cn } from "../lib/utils";
import { GRID_COLUMN_LABELS, GRID_COLUMN_OPTIONS, IMAGE_STYLES, IMAGE_STYLE_LABELS, useGameStore } from "../store/gameStore";
import { MyRobotButton } from "./MyRobotButton";
import { RobotCard } from "./RobotCard";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function GameBoard() {
  const { resetGame, flippedRobots, imageStyle, setImageStyle, gridColumns, setGridColumns } = useGameStore();
  const [showInstructions, setShowInstructions] = useState(false);
  const [hideEliminated, setHideEliminated] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);

  const flippedCount = Object.values(flippedRobots).filter(Boolean).length;
  const remainingCount = robots.length - flippedCount;

  // Filter robots based on hideEliminated state, sort eliminated to end
  const visibleRobots = useMemo(() => {
    if (hideEliminated) {
      return robots.filter((robot) => !flippedRobots[robot.name]);
    }
    // Sort eliminated robots to the end of the grid
    return [...robots].sort((a, b) => {
      const aFlipped = flippedRobots[a.name] ? 1 : 0;
      const bFlipped = flippedRobots[b.name] ? 1 : 0;
      return aFlipped - bFlipped;
    });
  }, [hideEliminated, flippedRobots]);

  // Grid class mappings for fixed column counts (Tailwind needs complete class names)
  const FIXED_GRID_CLASSES: Record<number, string> = {
    3: "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6",
    8: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8",
    10: "grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10",
  };

  // Dynamic grid class based on visible robot count and user preference
  function getGridClass() {
    // If user has set a specific column count, use that
    if (gridColumns !== "auto") {
      return FIXED_GRID_CLASSES[gridColumns as number];
    }

    // Auto mode - based on visible robot count to fill available screen space
    const count = visibleRobots.length;
    if (count <= 4) {
      return "grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4";
    }
    if (count <= 6) {
      return "grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6";
    }
    if (count <= 8) {
      return "grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8";
    }
    if (count <= 12) {
      return "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-12";
    }
    // Default for many robots - scales up to fill larger screens
    return "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10";
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <Bot className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Robot Guess Who
                </h1>
                <button
                  onClick={() => setHideEliminated(!hideEliminated)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {hideEliminated ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {remainingCount} of {robots.length} robots remaining
                    {hideEliminated && " (filtered)"}
                  </span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <MyRobotButton />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowStylePicker(!showStylePicker)}
                className={cn(showStylePicker && "bg-accent")}
              >
                {showStylePicker ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Palette className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                {showInstructions ? (
                  <X className="h-5 w-5" />
                ) : (
                  <HelpCircle className="h-5 w-5" />
                )}
              </Button>
              <Button variant="destructive" onClick={resetGame}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* Style Picker Panel */}
          {showStylePicker && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Display Settings
                </CardTitle>
                <CardDescription>
                  Customize how the game looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Art Style */}
                <div>
                  <div className="text-sm font-medium mb-2">Art Style</div>
                  <div className="flex gap-2 flex-wrap">
                    {IMAGE_STYLES.map(function renderStyleButton(style) {
                      return (
                        <Button
                          key={style}
                          variant={imageStyle === style ? "default" : "outline"}
                          onClick={function handleStyleClick() {
                            setImageStyle(style);
                          }}
                          className="flex-1 min-w-[100px]"
                        >
                          {IMAGE_STYLE_LABELS[style]}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                {/* Grid Size */}
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Grid3x3Icon className="h-4 w-4" />
                    Grid Columns
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {GRID_COLUMN_OPTIONS.map(function renderColumnButton(cols) {
                      return (
                        <Button
                          key={cols}
                          variant={gridColumns === cols ? "default" : "outline"}
                          onClick={function handleColumnClick() {
                            setGridColumns(cols);
                          }}
                          size="sm"
                        >
                          {GRID_COLUMN_LABELS[cols]}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions Panel */}
          {showInstructions && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle>How to Play</CardTitle>
                <CardDescription>
                  Find the mystery robot by process of elimination
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                  <span><strong>Tap</strong> a robot card to flip and eliminate it</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                  <span><strong>Long press</strong> to view robot details</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                  <span><strong>Click "remaining"</strong> to hide eliminated robots and enlarge cards</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
                  <span>Ask questions to narrow down the mystery robot!</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </header>

      {/* Main Game Grid */}
      <main className="container mx-auto px-4 py-6">
        <div className={cn("grid gap-3 sm:gap-4", getGridClass())}>
          {visibleRobots.map((robot) => (
            <RobotCard key={robot.name} robot={robot} />
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-6 flex justify-center">
          <Card className="py-3">
            <CardContent className="flex items-center gap-4 text-sm">
              <button
                onClick={() => setHideEliminated(false)}
                className={cn(
                  "flex items-center gap-2 transition-opacity",
                  hideEliminated && "opacity-50 hover:opacity-100"
                )}
              >
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span><strong>{flippedCount}</strong> eliminated</span>
              </button>
              <div className="h-4 w-px bg-border" />
              <button
                onClick={() => setHideEliminated(true)}
                className={cn(
                  "flex items-center gap-2 transition-opacity",
                  !hideEliminated && flippedCount > 0 && "opacity-70 hover:opacity-100",
                  hideEliminated && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-md px-2 py-1 -mx-2 -my-1"
                )}
              >
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span><strong>{remainingCount}</strong> remaining</span>
              </button>
            </CardContent>
          </Card>
        </div>
      </main>

    </div>
  );
}
