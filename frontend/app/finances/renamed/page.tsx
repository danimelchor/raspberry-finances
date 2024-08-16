"use client";

import { Button } from "@/components/ui/button";
import DataTable, { inDateRange } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import moment from "moment";

function RenamedMerchant({ originalName }: { originalName: string }) {
  const queryClient = useQueryClient();

  const unrename = async () => {
    await fetch("/api/rename", {
      method: "DELETE",
      body: JSON.stringify({ original_merchant: originalName }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const { mutateAsync } = useMutation({
    mutationFn: unrename,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renamed"] });
      toast.success("Merchant unrenamed");
    },
    onError: () => {
      toast.error("Failed to unrename merchant");
    },
  });

  return (
    <Button size="sm" onClick={() => mutateAsync()} variant="secondary">
      Delete
    </Button>
  );
}

type RenamedMerchant = {
  original_merchant: string;
  new_merchant: string;
  updated_at: string;
};

const columns: ColumnDef<RenamedMerchant>[] = [
  {
    accessorKey: "original_merchant",
    filterFn: "includesString",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Original Name" />;
    },
  },
  {
    accessorKey: "new_merchant",
    filterFn: "includesString",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="New Name" />;
    },
  },
  {
    accessorKey: "updated_at",
    filterFn: inDateRange,
    sortDescFirst: true,
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Updated At" />;
    },
    cell: ({ row }) => moment.utc(row.original.updated_at).toISOString(),
  },
  {
    id: "actions",
    enableHiding: false,
    enableColumnFilter: false,
    cell: ({ row }) => (
      <RenamedMerchant originalName={row.original.original_merchant} />
    ),
    size: -1,
  },
];

function RenamedPage() {
  const fetchRenamed = async (): Promise<RenamedMerchant[]> => {
    const res = await fetch("/api/renamed");
    return res.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["renamed"],
    queryFn: fetchRenamed,
  });

  return (
    <div className="flex flex-col w-full p-10 gap-6">
      <h1 className="text-4xl font-bold">Renamed</h1>
      {isLoading && <div>Loading...</div>}

      {!isLoading && data && Object.keys(data).length > 0 && (
        <DataTable
          id="renamed"
          columns={columns}
          data={data || []}
          defaultSort={[{ id: "updated_at", desc: true }]}
        />
      )}
    </div>
  );
}

export default RenamedPage;
