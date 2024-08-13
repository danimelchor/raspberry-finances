"use client";

import React from "react";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
  FilterFn,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableColumnVisibility } from "./data-table-column-toggle";
import { useStorage } from "@/hooks/useStorage";
import DataTableFilters from "./data-table-filters";
import { DateRange } from "react-day-picker";

interface DataTableProps<TData, TValue> {
  id: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  defaultSort?: SortingState;
}

export const inDateRange: FilterFn<any> = (
  row,
  columnId: string,
  filterValue: DateRange,
) => {
  const val = row.getValue<string>(columnId);
  const date = new Date(val as string);
  const from = filterValue?.from;
  const to = filterValue?.to;
  let result = true;
  if (from) {
    result = result && date >= from;
  }
  if (to) {
    result = result && date <= to;
  }
  return result;
};

// Duplicate the includesString filter so that
// we can later on get the filterFn as 'option'
// instead of 'includesString'
export const option: FilterFn<any> = (
  row,
  columnId: string,
  filterValue?: string,
) => {
  if (!filterValue) return true;
  const search = filterValue.toLowerCase();
  return Boolean(
    row
      .getValue<string | null>(columnId)
      ?.toString()
      ?.toLowerCase()
      ?.includes(search),
  );
};

function DataTable<TData, TValue>({
  id,
  columns,
  data,
  defaultSort,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(defaultSort || []);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] = useStorage<VisibilityState>(
    id,
    {},
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    filterFns: {
      inDateRange: inDateRange,
      option: option,
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center overflow-x-auto justify-between gap-5">
        <DataTableFilters table={table} />
        <DataTableColumnVisibility table={table} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

export default DataTable;
