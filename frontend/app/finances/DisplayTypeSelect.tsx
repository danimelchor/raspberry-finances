import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type DisplayType } from "./QueryResults";
import { Dispatch, SetStateAction } from "react";

export default function DisplayTypeSelect({
  value,
  setValue,
}: {
  value: DisplayType;
  setValue: Dispatch<SetStateAction<DisplayType>>;
}) {
  return (
    <Select onValueChange={(val) => setValue(val as DisplayType)} value={value}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a display type" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="table">Table</SelectItem>
          <SelectItem value="bar">Bar chart</SelectItem>
          <SelectItem value="line">Line chart</SelectItem>
          <SelectItem value="pie">Pie chart</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
