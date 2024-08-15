import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DisplayType } from "@/types";

export default function DisplayTypeSelect({
  value,
  setValue,
  name,
  fullSize,
}: {
  value: DisplayType;
  setValue: (value: DisplayType) => void;
  name?: string;
  fullSize?: boolean;
}) {
  return (
    <Select
      onValueChange={(val) => setValue(val as DisplayType)}
      value={value}
      name={name}
    >
      <SelectTrigger className={fullSize ? "w-full" : "w-[180px]"}>
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
