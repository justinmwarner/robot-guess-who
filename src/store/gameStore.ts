import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameState {
  // Map of robot name to whether it's flipped (eliminated)
  flippedRobots: Record<string, boolean>;

  // Actions
  toggleRobot: (robotName: string) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      flippedRobots: {},

      toggleRobot: (robotName: string) =>
        set((state) => ({
          flippedRobots: {
            ...state.flippedRobots,
            [robotName]: !state.flippedRobots[robotName],
          },
        })),

      resetGame: () =>
        set({
          flippedRobots: {},
        }),
    }),
    {
      name: "robot-guess-who-storage",
    }
  )
);

