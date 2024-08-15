import _ from "lodash";
import { Button } from "@/components/ui/button";
import { PinIcon } from "lucide-react";
import useUpdateHistory from "@/hooks/useUpdateHistory";
import { Query } from "@/types";
import { cn } from "@/lib/utils";

function TogglePinnedButton({
  item,
  size,
}: {
  item: Query;
  size?: "sm" | "default";
}) {
  const { mutateAsync } = useUpdateHistory();

  const togglePinned = () => {
    let newItem = { ...item, pinned: !item.pinned };
    mutateAsync(newItem);
  };

  if (!item.id) return null;

  return (
    <Button
      size={size || "sm"}
      variant="ghost"
      onClick={(e) => {
        e.stopPropagation();
        togglePinned();
      }}
      className={cn({ "px-1": size === "sm", "px-1.5": size === "default" })}
    >
      {item.pinned ? (
        <PinIcon
          className={cn("fill-red-400", {
            "w-5": size === "sm",
            "w-10": size === "default",
          })}
        />
      ) : (
        <PinIcon
          className={cn({ "w-5": size === "sm", "w-10": size === "default" })}
        />
      )}
    </Button>
  );
}

export default TogglePinnedButton;
