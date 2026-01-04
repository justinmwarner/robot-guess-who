import { Bot, Eye, UserCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { robots } from "../../scripts/robots";
import { useGameStore } from "../store/gameStore";
import { getRobotImageUrl, getPlaceholderImageUrl } from "./RobotCard";
import { RobotDetailDialog } from "./RobotDetailDialog";
import { MyRobotSelector } from "./MyRobotSelector";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

/**
 * Header button component that shows user's selected robot and provides
 * quick access to view robot details or change selection
 */
export function MyRobotButton() {
  const { myRobotName, imageStyle } = useGameStore();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get robot object from name
  const myRobot = useMemo(function findMyRobot() {
    return robots.find(function matchRobot(r) {
      return r.name === myRobotName;
    }) || null;
  }, [myRobotName]);

  function handleViewDetails() {
    setDetailOpen(true);
  }

  function handleChangeRobot() {
    setSelectorOpen(true);
  }

  function getImageUrl() {
    if (!myRobot) return "";
    if (imageError) {
      return getPlaceholderImageUrl(myRobot, 100);
    }
    return getRobotImageUrl(myRobot, imageStyle);
  }

  // No robot selected - show button to select one
  if (!myRobot) {
    return (
      <>
        <Button
          variant="outline"
          onClick={handleChangeRobot}
          className="gap-2"
        >
          <UserCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Select My Robot</span>
          <span className="sm:hidden">My Robot</span>
        </Button>

        <MyRobotSelector open={selectorOpen} onOpenChange={setSelectorOpen} />
      </>
    );
  }

  // Robot selected - show avatar with dropdown menu
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 pl-1 pr-3"
          >
            <div className="h-7 w-7 rounded-md overflow-hidden border border-primary/30">
              <img
                src={getImageUrl()}
                alt={myRobot.name}
                className="h-full w-full object-cover"
                onError={function onError() {
                  setImageError(true);
                }}
              />
            </div>
            <span className="hidden sm:inline max-w-[100px] truncate">{myRobot.name}</span>
            <span className="sm:hidden">My Robot</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="h-4 w-4 mr-2" />
            View My Robot
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleChangeRobot}>
            <Bot className="h-4 w-4 mr-2" />
            Change Robot
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RobotDetailDialog
        robot={myRobot}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        isMyRobot
      />

      <MyRobotSelector open={selectorOpen} onOpenChange={setSelectorOpen} />
    </>
  );
}

