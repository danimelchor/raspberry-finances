"use client";

import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";

function HiddenMerchant({ merchant }: { merchant: string }) {
  const queryClient = useQueryClient();

  const unhide = async () => {
    await fetch("/api/hide", {
      method: "DELETE",
      body: JSON.stringify({ merchant }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const { mutateAsync } = useMutation({
    mutationFn: unhide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hidden"] });
      toast.success("Merchant unhidden");
    },
    onError: () => {
      toast.error("Failed to unhide merchant");
    },
  });

  return (
    <Button size="sm" onClick={() => mutateAsync()} variant="secondary">
      Unhide
    </Button>
  );
}

type HiddenMerchant = {
  merchant: string;
};

const columns: ColumnDef<HiddenMerchant>[] = [
  {
    header: "Merchant",
    accessorKey: "merchant",
    filterFn: "includesString",
  },
  {
    id: "actions",
    enableHiding: false,
    enableColumnFilter: false,
    cell: ({ row }) => <HiddenMerchant merchant={row.original.merchant} />,
    size: -1,
  },
];

function HiddenPage() {
  const fetchHidden = async (): Promise<string[]> => {
    const res = await fetch("/api/hidden");
    return res.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["hidden"],
    queryFn: fetchHidden,
  });
  const rows: HiddenMerchant[] = data
    ? data.map((merchant) => ({ merchant }))
    : [];

  return (
    <div className="flex flex-col w-full p-10 gap-6">
      <h1 className="text-4xl font-bold">Hidden</h1>
      {isLoading && <div>Loading...</div>}

      {!isLoading && data && data.length > 0 && (
        <DataTable id="hidden" columns={columns} data={rows} />
      )}
    </div>
  );
}

export default HiddenPage;
