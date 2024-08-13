import type { Column, Row, Table } from "@tanstack/react-table";
import React from "react";
import Chip from "./chip";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Input } from "./input";
import { Button } from "./button";
import { DatePickerWithRange } from "./date-range-picker";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import _ from "lodash";

interface FilterImplProps<T, TData, TValue> {
  value?: T;
  setValue: (value?: T) => void;
  data: Row<TData>[];
  column: Column<TData, TValue>;
}

function InputField<TData, TValue>({
  value,
  setValue,
}: FilterImplProps<string, TData, TValue>) {
  return (
    <Input
      type="text"
      onChange={(e) => setValue(e.target.value)}
      value={value}
    />
  );
}

function NumberRangeField<TData, TValue>({
  value: _value,
  setValue,
}: FilterImplProps<[number, number], TData, TValue>) {
  let value = _value || [0, 0];

  const [min, setMin] = React.useState(value[0].toString());
  const [max, setMax] = React.useState(value[1].toString());

  return (
    <div className="flex gap-2">
      <Input
        type="number"
        onChange={(e) => setMin(e.target.value)}
        onBlur={() => setValue([parseInt(min), parseInt(max)])}
        value={min}
      />
      <Input
        type="number"
        onChange={(e) => setMax(e.target.value)}
        onBlur={() => setValue([parseInt(min), parseInt(max)])}
        value={max}
      />
    </div>
  );
}

function OptionField<TData, TValue>({
  value,
  setValue,
  data,
  column,
}: FilterImplProps<string, TData, TValue>) {
  const colName = column.id;
  const options = _.uniq(data.map((row) => row.getValue(colName) as string));

  return (
    <div className="w-full flex">
      <Select onValueChange={setValue} value={value}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function DateRangeField<TData, TValue>({
  value,
  setValue,
}: FilterImplProps<DateRange, TData, TValue>) {
  return <DatePickerWithRange dates={value} setDates={setValue} />;
}

type FilterProps<TData, TValue> = {
  column: Column<TData, TValue>;
  data: Row<TData>[];
};

function Filter<TData, TValue>({ column, data }: FilterProps<TData, TValue>) {
  const [value, setValue] = React.useState<TValue | null | undefined>(
    column.getFilterValue() as TValue,
  );
  const [open, setOpen] = React.useState(false);

  const filterFn = column.getFilterFn();
  if (filterFn == null) {
    return null;
  }

  const filterFnString = filterFn.name;

  let FilterComponent: React.FC<FilterImplProps<any, TData, TValue>> | null =
    null;
  let filterValue = column.getFilterValue();
  let valueStr;
  switch (filterFnString) {
    case "includesString":
    case "equalsString":
      FilterComponent = InputField;
      valueStr = filterValue as string;
      break;
    case "inNumberRange":
      FilterComponent = NumberRangeField;
      valueStr = (filterValue as [number, number])?.join(" to ");
      break;
    case "inDateRange":
      FilterComponent = DateRangeField;
      let fromStr = (filterValue as DateRange)?.from?.toLocaleDateString();
      let toStr = (filterValue as DateRange)?.to?.toLocaleDateString();
      valueStr = fromStr && toStr ? `${fromStr} to ${toStr}` : fromStr ?? toStr;
      break;
    case "option":
      FilterComponent = OptionField;
      valueStr = filterValue as string;
      break;
  }

  if (!FilterComponent) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Chip
          label={column.id}
          value={valueStr}
          onClear={() => column.setFilterValue(null)}
        />
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-4">
          <p>Filter by {column.id}</p>
          <FilterComponent
            setValue={setValue}
            value={value}
            data={data}
            column={column}
          />
          <Button
            onClick={() => {
              column.setFilterValue(value);
              setOpen(false);
            }}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DataTableFilters<TData>({ table }: { table: Table<TData> }) {
  return (
    <div className="flex items-center gap-2">
      {table.getAllColumns().map((column) => {
        if (!column.getCanFilter()) {
          return null;
        }

        return (
          <Filter
            key={column.id}
            column={column}
            data={table.getRowModel().rows}
          />
        );
      })}
    </div>
  );
}

export default DataTableFilters;
