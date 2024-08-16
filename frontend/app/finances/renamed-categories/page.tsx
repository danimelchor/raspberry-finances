"use client";

import { Button } from "@/components/ui/button";
import DataTable, { inDateRange } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import moment from "moment";

function RenamedCategory({ originalName }: { originalName: string }) {
  const queryClient = useQueryClient();

  const unrename = async () => {
    await fetch("/api/rename/category", {
      method: "DELETE",
      body: JSON.stringify({ original_category: originalName }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const { mutateAsync } = useMutation({
    mutationFn: unrename,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renamed-categories"] });
      toast.success("Category unrenamed");
    },
    onError: () => {
      toast.error("Failed to unrename category");
    },
  });

  return (
    <Button size="sm" onClick={() => mutateAsync()} variant="secondary">
      Delete
    </Button>
  );
}

type RenamedCategory = {
  original_category: string;
  new_category: string;
  updated_at: string;
};

const columns: ColumnDef<RenamedCategory>[] = [
  {
    accessorKey: "original_category",
    filterFn: "includesString",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title="Original Category" />
      );
    },
  },
  {
    accessorKey: "new_category",
    filterFn: "includesString",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="New Category" />;
    },
  },
  {
    accessorKey: "updated_at",
    filterFn: inDateRange,
    sortDescFirst: true,
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Updated At" />;
    },
    cell: ({ row }) => moment.utc(row.original.updated_at).format(),
  },
  {
    id: "actions",
    enableHiding: false,
    enableColumnFilter: false,
    cell: ({ row }) => (
      <RenamedCategory originalName={row.original.original_category} />
    ),
    size: -1,
  },
];

function RenamedPage() {
  const fetchRenamed = async (): Promise<RenamedCategory[]> => {
    const res = await fetch("/api/renamed/categories");
    return res.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["renamed-categories"],
    queryFn: fetchRenamed,
  });

  return (
    <div className="flex flex-col w-full p-10 gap-6">
      <h1 className="text-4xl font-bold">Renamed categories</h1>
      {isLoading && <div>Loading...</div>}

      {!isLoading && data && Object.keys(data).length > 0 && (
        <DataTable
          id="renamed-categories"
          columns={columns}
          data={data || []}
          defaultSort={[{ id: "updated_at", desc: true }]}
        />
      )}
    </div>
  );
}

export default RenamedPage;
