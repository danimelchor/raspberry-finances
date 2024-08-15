import { Query } from "@/types";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

const fetchHistory = async (id: number): Promise<Query> => {
  const url = `/api/history?id=${id}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to search history");
  }
  return res.json();
};

type UseHistoryProps = {
  id: number;
} & Omit<UseQueryOptions<Query>, "queryKey" | "queryFn">;

export default function useHistory(props: UseHistoryProps) {
  const { id, ...rest } = props;
  return useQuery({
    queryKey: ["history", id],
    queryFn: async () => fetchHistory(id),
    ...rest,
  });
}
