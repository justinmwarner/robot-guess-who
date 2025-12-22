import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameState {
  // Map of robot name to whether it's flipped (eliminated)
  flippedRobots: Record<string, boolean>;
  // Whether the game has been started at least once
  hasExistingGame: boolean;
  // Track if user has seen the welcome/reset dialog
  hasSeenResetPrompt: boolean;

  // Actions
  toggleRobot: (robotName: string) => void;
  resetGame: () => void;
  setHasSeenResetPrompt: (value: boolean) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      flippedRobots: {},
      hasExistingGame: false,
      hasSeenResetPrompt: false,

      toggleRobot: (robotName: string) =>
        set((state) => ({
          flippedRobots: {
            ...state.flippedRobots,
            [robotName]: !state.flippedRobots[robotName],
          },
          hasExistingGame: true,
        })),

      resetGame: () =>
        set({
          flippedRobots: {},
          hasExistingGame: false,
          hasSeenResetPrompt: true,
        }),

      setHasSeenResetPrompt: (value: boolean) =>
        set({ hasSeenResetPrompt: value }),
    }),
    {
      name: "robot-guess-who-storage",
    }
  )
);

