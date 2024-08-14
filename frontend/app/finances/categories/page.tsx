"use client";

import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    <div className="flex items-center justify-between gap-6 py-3">
      <div className="flex items-center gap-2">
        <div>{merchant}</div>
        <ArrowRightIcon className="w-4 h-4" />
        <div>{category}</div>
      </div>
      <Button size="sm" onClick={() => mutateAsync()} variant="secondary">
        Delete
      </Button>
    </div>
  );
}

type CategorizedMerchants = {
  [merchant: string]: string;
};

function CategorizedPage() {
  const fetchCategorized = async (): Promise<CategorizedMerchants> => {
    const res = await fetch("/api/categorized");
    return res.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["categorized"],
    queryFn: fetchCategorized,
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl">Categorized</h1>
      {isLoading && <div>Loading...</div>}

      {!isLoading && data && Object.keys(data).length > 0 && (
        <div className="flex flex-col divide-y divide-gray-200">
          {Object.keys(data).map((merchant) => (
            <CategorizedMerchant
              key={merchant}
              merchant={merchant}
              category={data[merchant]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CategorizedPage;
