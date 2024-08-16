"use client";

import { Button } from "@/components/ui/button";
import DataTable, { inDateRange } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
  CellContext,
  ColumnDef,
  ColumnDefTemplate,
  FilterFnOption,
} from "@tanstack/react-table";
import { EditIcon, EyeOffIcon, PieChartIcon } from "lucide-react";
import React, { useMemo } from "react";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import moment from "moment";

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
  } else if (
    lowercaseCol.includes("date") ||
    lowercaseCol.includes("updated_at")
  ) {
    return inDateRange;
  }

  if (typeof sampleValue === "number") {
    return "inNumberRange";
  }

  if (typeof sampleValue === "string") {
    try {
      const date = moment.utc(sampleValue);
      if (date.isValid()) {
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
      return moment.utc(original[col] as string).toISOString();
    };
  }

  return ({ row }) => {
    let original = row.original as any;
    return original[col];
  };
}

function HideMerchantButton({
  merchant,
  resubmit,
}: {
  merchant: string;
  resubmit: () => void;
}) {
  const queryClient = useQueryClient();
  const onClick = () => {
    return fetch("/api/hide", {
      method: "POST",
      body: JSON.stringify({ merchant }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const { mutateAsync } = useMutation({
    mutationFn: onClick,
    onSuccess: () => {
      toast.success("Merchant hidden");
      queryClient.invalidateQueries({ queryKey: ["hidden"] });
      resubmit();
    },
    onError: () => {
      toast.error("Failed to hide merchant");
    },
  });

  return (
    <Button
      onClick={() => mutateAsync()}
      variant="ghost"
      aria-label="Hide merchant"
      className="p-2 h-auto"
    >
      <EyeOffIcon className="w-4 h-4" />
    </Button>
  );
}

function RenameMerchantButton({
  merchant,
  resubmit,
}: {
  merchant: string;
  resubmit: () => void;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [new_merchant, setNewMerchant] = React.useState<string>(merchant);

  const onClick = () => {
    return fetch("/api/rename", {
      method: "POST",
      body: JSON.stringify({ original_merchant: merchant, new_merchant }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const { mutateAsync } = useMutation({
    mutationFn: onClick,
    onSuccess: () => {
      toast.success("Merchant renamed");
      queryClient.invalidateQueries({ queryKey: ["renamed"] });
      resubmit();
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to rename merchant");
    },
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (new_merchant === merchant) {
      toast.error("New merchant name must be different");
      return;
    }
    mutateAsync();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          variant="ghost"
          aria-label="Rename merchant"
          className="p-2 h-auto"
        >
          <EditIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <form onSubmit={onSubmit}>
            <DialogTitle>Rename Merchant</DialogTitle>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="original_merchant">Original name</Label>
                <Input
                  type="text"
                  name="original_merchant"
                  value={merchant}
                  className="border border-gray-300 rounded-md p-1"
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="new_merchant">New name</Label>
                <Input
                  type="text"
                  value={new_merchant}
                  onChange={(e) => setNewMerchant(e.target.value)}
                  className="border border-gray-300 rounded-md p-1"
                />
              </div>
              <Button type="submit">Rename</Button>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function CategorizeMerchantButton({
  merchant,
  category,
  resubmit,
}: {
  merchant: string;
  category: string | undefined | null;
  resubmit: () => void;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState<string>(category || "");

  const onClick = () => {
    return fetch("/api/categorize", {
      method: "POST",
      body: JSON.stringify({ merchant, category: newCategory }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const { mutateAsync } = useMutation({
    mutationFn: onClick,
    onSuccess: () => {
      toast.success("Merchant categorized");
      queryClient.invalidateQueries({ queryKey: ["categorized"] });
      resubmit();
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to categorize merchant");
    },
  });

  if (category == null) {
    return null;
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (category === newCategory) {
      toast.error("New merchant name must be different");
      return;
    }
    mutateAsync();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          variant="ghost"
          aria-label="Rename merchant"
          className="p-2 h-auto"
        >
          <PieChartIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <form onSubmit={onSubmit}>
            <DialogTitle>Categorize Merchant</DialogTitle>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="merchant">Merchant</Label>
                <Input
                  type="text"
                  name="merchant"
                  value={merchant}
                  className="border border-gray-300 rounded-md p-1"
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="original_category">Original category</Label>
                <Input
                  type="text"
                  name="original_category"
                  value={category || "None"}
                  className="border border-gray-300 rounded-md p-1"
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="new_category">New category</Label>
                <Input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="border border-gray-300 rounded-md p-1"
                />
              </div>
              <Button type="submit">Categorize</Button>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function QueryTable<T>({
  columns,
  data,
  resubmit,
}: {
  columns: string[];
  data: T[];
  resubmit: () => void;
}) {
  const tableColumns = useMemo(() => {
    let tableColumns = columns.map((key) => {
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
    });

    // If merchant column exists, add actions
    if (columns.includes("merchant")) {
      tableColumns.push({
        id: "hide-merchant",
        enableHiding: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const val = row.original as any;
          return (
            <div className="flex">
              <HideMerchantButton merchant={val.merchant} resubmit={resubmit} />
              <RenameMerchantButton
                merchant={val.merchant}
                resubmit={resubmit}
              />
              <CategorizeMerchantButton
                merchant={val.merchant}
                category={val.category}
                resubmit={resubmit}
              />
            </div>
          );
        },
        size: -1,
      });
    }

    return tableColumns;
  }, [columns, data]);

  return <DataTable id="dynamic-table" data={data} columns={tableColumns} />;
}

export default QueryTable;
