"use client";

import DataTable, { inDateRange } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
  CellContext,
  ColumnDef,
  ColumnDefTemplate,
  FilterFnOption,
} from "@tanstack/react-table";

export const dollarFormat = (n: number): string => {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencySign: "accounting",
  }).format(n);
};

function inferFilter(
  col: string,
  sampleValue: any,
): FilterFnOption<any> | undefined {
  const lowercaseCol = col.toLowerCase();

  if (lowercaseCol.includes("amount")) {
    return "inNumberRange";
  } else if (lowercaseCol.includes("merchant")) {
    return "equalsString";
  } else if (
    lowercaseCol.includes("category") ||
    lowercaseCol.includes("source")
  ) {
    return "includesString";
  } else if (lowercaseCol.includes("date")) {
    return inDateRange;
  }

  if (typeof sampleValue === "number") {
    return "inNumberRange";
  }

  if (typeof sampleValue === "string") {
    try {
      const date = new Date(sampleValue);
      if (!isNaN(date.getTime())) {
        return inDateRange;
      }
    } catch (e) {}

    try {
      const num = parseFloat(sampleValue);
      if (!isNaN(num)) {
        return "inNumberRange";
      }
    } catch (e) {}
  }

  return "includesString";
}

function inferCell<TData, TValue>(
  col: string,
): ColumnDefTemplate<CellContext<TData, TValue>> | undefined {
  const lowercaseCol = col.toLowerCase();

  if (lowercaseCol.includes("amount")) {
    return ({ row }) => {
      let original = row.original as any;
      return dollarFormat(original[col] as number);
    };
  }

  if (lowercaseCol.includes("date")) {
    return ({ row }) => {
      let original = row.original as any;
      return new Date(original[col] as string).toLocaleString();
    };
  }

  return ({ row }) => {
    let original = row.original as any;
    return original[col];
  };
}

function QueryTable<T>({ columns, data }: { columns: string[]; data: T[] }) {
  return (
    <DataTable
      id="dynamic-table"
      data={data}
      columns={columns.map((key) => {
        const col = key as string;
        return {
          id: col,
          accessorKey: col,
          filterFn: inferFilter(col, (data[0] as any)[key]),
          header: ({ column }) => {
            return <DataTableColumnHeader column={column} title={col} />;
          },
          cell: inferCell(col),
        } as ColumnDef<T>;
      })}
    />
  );
}

export default QueryTable;
