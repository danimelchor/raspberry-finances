"use client";

import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRightIcon } from "lucide-react";
import { toast } from "react-toastify";

function RenamedMerchant({
  originalName,
  newName,
}: {
  originalName: string;
  newName: string;
}) {
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
    <div className="flex items-center justify-between gap-6 py-3">
      <div className="flex items-center gap-2">
        <div>{originalName}</div>
        <ArrowRightIcon className="w-4 h-4" />
        <div>{newName}</div>
      </div>
      <Button size="sm" onClick={() => mutateAsync()} variant="secondary">
        Delete
      </Button>
    </div>
  );
}

type RenamedMerchants = {
  [originalName: string]: string;
};

function RenamedPage() {
  const fetchRenamed = async (): Promise<RenamedMerchants> => {
    const res = await fetch("/api/renamed");
    return res.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["renamed"],
    queryFn: fetchRenamed,
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl">Renamed</h1>
      {isLoading && <div>Loading...</div>}

      {!isLoading && data && Object.keys(data).length > 0 && (
        <div className="flex flex-col divide-y divide-gray-200">
          {Object.keys(data).map((merchant) => (
            <RenamedMerchant
              key={merchant}
              originalName={merchant}
              newName={data[merchant]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default RenamedPage;
