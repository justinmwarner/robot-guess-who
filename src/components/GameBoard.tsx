import { Bot, HelpCircle, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { robots } from "../data/robots";
import { useGameStore } from "../store/gameStore";
import { ResetDialog } from "./ResetDialog";
import { RobotCard } from "./RobotCard";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function GameBoard() {
  const { hasExistingGame, hasSeenResetPrompt, resetGame, flippedRobots } = useGameStore();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (hasExistingGame && !hasSeenResetPrompt) {
      setShowResetDialog(true);
    }
  }, [hasExistingGame, hasSeenResetPrompt]);

  const flippedCount = Object.values(flippedRobots).filter(Boolean).length;
  const remainingCount = robots.length - flippedCount;

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
                <p className="text-sm text-muted-foreground">
                  {remainingCount} of {robots.length} robots remaining
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
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
                  <span>Ask questions to narrow down the mystery robot!</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </header>

      {/* Main Game Grid */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
          {robots.map((robot) => (
            <RobotCard key={robot.name} robot={robot} />
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-6 flex justify-center">
          <Card className="py-3">
            <CardContent className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span><strong>{flippedCount}</strong> eliminated</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span><strong>{remainingCount}</strong> remaining</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Reset Dialog */}
      <ResetDialog open={showResetDialog} onOpenChange={setShowResetDialog} />
    </div>
  );
}
