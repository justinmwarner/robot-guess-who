import { create } from "zustand";
import { persist } from "zustand/middleware";

// Available image styles - corresponds to generated image suffixes
export type ImageStyle = "blocky" | "realistic";

export const IMAGE_STYLE_LABELS: Record<ImageStyle, string> = {
  blocky: "Blocky",
  realistic: "Realistic",
};

export const IMAGE_STYLES: ImageStyle[] = ["blocky", "realistic"];

// Available grid column options
export type GridColumns = "auto" | 3 | 4 | 5 | 6 | 8 | 10;

export const GRID_COLUMN_OPTIONS: GridColumns[] = ["auto", 3, 4, 5, 6, 8, 10];

export const GRID_COLUMN_LABELS: Record<GridColumns, string> = {
  auto: "Auto",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  8: "8",
  10: "10",
};

interface GameState {
  // Map of robot name to whether it's flipped (eliminated)
  flippedRobots: Record<string, boolean>;
  // Currently selected image style
  imageStyle: ImageStyle;
  // Grid column setting
  gridColumns: GridColumns;
  // User's selected robot (their robot for others to guess)
  myRobotName: string | null;

  // Actions
  toggleRobot: (robotName: string) => void;
  setImageStyle: (style: ImageStyle) => void;
  setGridColumns: (columns: GridColumns) => void;
  setMyRobot: (robotName: string | null) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      flippedRobots: {},
      imageStyle: "realistic",
      gridColumns: "auto" as GridColumns,
      myRobotName: null,

      toggleRobot: (robotName: string) =>
        set((state) => ({
          flippedRobots: {
            ...state.flippedRobots,
            [robotName]: !state.flippedRobots[robotName],
          },
        })),

      setImageStyle: (style: ImageStyle) =>
        set({ imageStyle: style }),

      setGridColumns: (columns: GridColumns) =>
        set({ gridColumns: columns }),

      setMyRobot: (robotName: string | null) =>
        set({ myRobotName: robotName }),

      resetGame: () =>
        set({
          flippedRobots: {},
          myRobotName: null,
        }),
    }),
    {
      name: "robot-guess-who-storage",
      partialize: (state: GameState) => ({
        flippedRobots: state.flippedRobots,
        imageStyle: state.imageStyle,
        gridColumns: state.gridColumns,
        myRobotName: state.myRobotName,
      }),
    }
  )
);

