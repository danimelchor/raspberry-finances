"use client";

import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    <div className="flex items-center justify-between gap-6 py-3">
      <div>{merchant}</div>
      <Button size="sm" onClick={() => mutateAsync()} variant="secondary">
        Unhide
      </Button>
    </div>
  );
}

function HiddenPage() {
  const fetchHidden = async (): Promise<string[]> => {
    const res = await fetch("/api/hidden");
    return res.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["hidden"],
    queryFn: fetchHidden,
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl">Hidden</h1>
      {isLoading && <div>Loading...</div>}

      {!isLoading && data && data.length > 0 && (
        <div className="flex flex-col divide-y divide-gray-200">
          {data.map((merchant) => (
            <HiddenMerchant key={merchant} merchant={merchant} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HiddenPage;
