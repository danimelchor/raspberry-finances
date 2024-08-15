import { Query } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const updateQueryItem = async (item: Query): Promise<Query> => {
  const res = await fetch("/api/history", {
    method: "PUT",
    body: JSON.stringify(item),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error("Failed to update history");
  }
  return res.json();
};

export default function useUpdateHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateQueryItem,
    onSuccess: () => {
      toast.success("Query item updated");
      queryClient.invalidateQueries({ queryKey: ["history-list"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
    onError: () => {
      toast.error("Failed to update history item");
    },
  });
}
