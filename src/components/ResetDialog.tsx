import { Bot, PlayCircle, RotateCcw } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface ResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetDialog({ open, onOpenChange }: ResetDialogProps) {
  const { resetGame, setHasSeenResetPrompt } = useGameStore();

  const handleContinue = () => {
    setHasSeenResetPrompt(true);
    onOpenChange(false);
  };

  const handleReset = () => {
    resetGame();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </div>
            Welcome Back!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            You have a game in progress. Would you like to continue where you
            left off, or start a new game?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleContinue}>
            <PlayCircle className="h-4 w-4" />
            Continue Game
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Start New Game
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
