import React from "react";
import { Separator } from "./separator";
import { CircleXIcon, CirclePlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  value?: string;
  onClear?: () => void;
  onDropdown?: () => void;
}

function Chip({ label, value, onClear, onDropdown }: ChipProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full hover:bg-slate-100 cursor-pointer",
        "py-0.5 pl-1.5 pr-2.5",
        "text-sm text-slate-700 font-medium",
        "border border-slate-300",
        value ? "border-solid" : "border-dashed",
      )}
      onClick={onDropdown}
    >
      {value && (
        <span className="text-slate-400 hover:text-red-400" onClick={onClear}>
          <CircleXIcon
            onClick={(e) => {
              e.stopPropagation();
              onClear?.();
            }}
            size={14}
          />
        </span>
      )}
      {!value && (
        <span className="text-slate-700">
          <CirclePlusIcon onClick={onDropdown} size={14} />
        </span>
      )}
      <span className="capitalize text-nowrap">{label}</span>
      {value && (
        <>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-primary text-nowrap">{value}</span>
        </>
      )}
    </div>
  );
}

export default Chip;
