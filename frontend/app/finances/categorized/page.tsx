"use client";

import { Button } from "@/components/ui/button";
import DataTable, { option } from "@/components/ui/data-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowRightIcon } from "lucide-react";
import { toast } from "react-toastify";

function CategorizedMerchant({
  merchant,
  category,
}: {
  merchant: string;
  category: string;
}) {
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

type CategorizedMerchantsResponse = {
  [merchant: string]: string;
};

type CategorizedMerchants = {
  merchant: string;
  category: string;
};

const columns: ColumnDef<CategorizedMerchants>[] = [
  {
    header: "Merchant",
    accessorKey: "merchant",
    filterFn: "includesString",
  },
  {
    header: "Category",
    accessorKey: "category",
    filterFn: option,
  },
  {
    id: "actions",
    enableHiding: false,
    enableColumnFilter: false,
    cell: ({ row }) => (
      <CategorizedMerchant
        merchant={row.original.merchant}
        category={row.original.category}
      />
    ),
    size: -1,
  },
];

function CategorizedPage() {
  const fetchCategorized = async (): Promise<CategorizedMerchantsResponse> => {
    const res = await fetch("/api/categorized");
    return res.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["categorized"],
    queryFn: fetchCategorized,
  });
  const rows: CategorizedMerchants[] = data
    ? Object.entries(data).map(([merchant, category]) => ({
        merchant,
        category,
      }))
    : [];

  return (
    <div className="flex flex-col w-full p-10 gap-6">
      <h1 className="text-4xl font-bold">Categories</h1>
      {isLoading && <div>Loading...</div>}
      {!isLoading && data && Object.keys(data).length > 0 && (
        <div className="flex flex-col divide-y divide-gray-200">
          <DataTable id="categorized" data={rows} columns={columns} />
        </div>
      )}
    </div>
  );
}

export default CategorizedPage;
