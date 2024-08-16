"use client";

import { Button } from "@/components/ui/button";
import DataTable, { inDateRange, option } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import moment from "moment";

function CategorizedMerchant({ merchant }: { merchant: string }) {
  const queryClient = useQueryClient();

  const uncategorize = async () => {
    await fetch("/api/categorize", {
      method: "DELETE",
      body: JSON.stringify({ merchant }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const { mutateAsync } = useMutation({
    mutationFn: uncategorize,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorized"] });
      toast.success("Merchant uncategorized");
    },
    onError: () => {
      toast.error("Failed to uncategorize merchant");
    },
  });

  return (
    <Button size="sm" onClick={() => mutateAsync()} variant="secondary">
      Delete
    </Button>
  );
}

type CategorizedMerchants = {
  merchant: string;
  category: string;
  updated_at: string;
};

const columns: ColumnDef<CategorizedMerchants>[] = [
  {
    accessorKey: "merchant",
    filterFn: "includesString",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Merchant" />;
    },
  },
  {
    accessorKey: "category",
    filterFn: option,
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Category" />;
    },
  },
  {
    accessorKey: "updated_at",
    filterFn: inDateRange,
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Updated At" />;
    },
    cell: ({ row }) => moment.utc(row.original.updated_at).toISOString(),
  },
  {
    id: "actions",
    enableHiding: false,
    enableColumnFilter: false,
    cell: ({ row }) => <CategorizedMerchant merchant={row.original.merchant} />,
    size: -1,
  },
];

function CategorizedPage() {
  const fetchCategorized = async (): Promise<CategorizedMerchants[]> => {
    const res = await fetch("/api/categorized");
    return res.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["categorized"],
    queryFn: fetchCategorized,
  });

  return (
    <div className="flex flex-col w-full p-10 gap-6">
      <h1 className="text-4xl font-bold">Categories</h1>
      {isLoading && <div>Loading...</div>}
      {!isLoading && data && Object.keys(data).length > 0 && (
        <div className="flex flex-col divide-y divide-gray-200">
          <DataTable
            id="categorized"
            data={data || []}
            columns={columns}
            defaultSort={[{ id: "updated_at", desc: true }]}
          />
        </div>
      )}
    </div>
  );
}

export default CategorizedPage;
