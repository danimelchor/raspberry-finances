"use client";

import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";

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

type RenamedMerchantsResponse = {
  [originalName: string]: string;
};

type RenamedMerchant = {
  originalName: string;
  newName: string;
};

const columns: ColumnDef<RenamedMerchant>[] = [
  {
    header: "Original Name",
    accessorKey: "originalName",
    filterFn: "includesString",
  },
  {
    header: "New Name",
    accessorKey: "newName",
    filterFn: "includesString",
  },
  {
    id: "actions",
    enableHiding: false,
    enableColumnFilter: false,
    cell: ({ row }) => (
      <RenamedMerchant originalName={row.original.originalName} />
    ),
    size: -1,
  },
];

function RenamedPage() {
  const fetchRenamed = async (): Promise<RenamedMerchantsResponse> => {
    const res = await fetch("/api/renamed");
    return res.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["renamed"],
    queryFn: fetchRenamed,
  });
  const rows: RenamedMerchant[] = data
    ? Object.entries(data).map(([originalName, newName]) => ({
        originalName,
        newName,
      }))
    : [];

  return (
    <div className="flex flex-col w-full p-10 gap-6">
      <h1 className="text-4xl font-bold">Renamed</h1>
      {isLoading && <div>Loading...</div>}

      {!isLoading && data && Object.keys(data).length > 0 && (
        <DataTable id="renamed" columns={columns} data={rows} />
      )}
    </div>
  );
}

export default RenamedPage;
