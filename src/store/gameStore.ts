import { create } from "zustand";
import { persist } from "zustand/middleware";

// Available image styles - corresponds to generated image suffixes
export type ImageStyle = "blocky" | "realistic";

export const IMAGE_STYLE_LABELS: Record<ImageStyle, string> = {
  blocky: "Blocky",
  realistic: "Realistic",
};

export const IMAGE_STYLES: ImageStyle[] = ["blocky", "realistic"];

interface GameState {
  // Map of robot name to whether it's flipped (eliminated)
  flippedRobots: Record<string, boolean>;
  // Currently selected image style
  imageStyle: ImageStyle;

  // Actions
  toggleRobot: (robotName: string) => void;
  setImageStyle: (style: ImageStyle) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      flippedRobots: {},
      imageStyle: "realistic",

      toggleRobot: (robotName: string) =>
        set((state) => ({
          flippedRobots: {
            ...state.flippedRobots,
            [robotName]: !state.flippedRobots[robotName],
          },
        })),

      setImageStyle: (style: ImageStyle) =>
        set({ imageStyle: style }),

      resetGame: () =>
        set({
          flippedRobots: {},
        }),
    }),
    {
      name: "robot-guess-who-storage",
      partialize: (state: GameState) => ({
        flippedRobots: state.flippedRobots,
        imageStyle: state.imageStyle,
      }),
    }
  )
);

