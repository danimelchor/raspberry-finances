import { Query } from "@/types";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

const fetchHistoryList = async (query?: string): Promise<Query[]> => {
  const url = query ? `/api/history/list?q=${query}` : "/api/history/list";
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to search history");
  }
  const queries = (await res.json()) as Query[];
  queries.forEach((query) => {
    query.originalSql = query.sql;
  });
  return queries;
};

type UseHistoryListProps = {
  search?: string;
} & Omit<UseQueryOptions<Query[]>, "queryKey" | "queryFn">;

export default function useHistoryList(props?: UseHistoryListProps) {
  const { search, ...rest } = props || {};
  return useQuery({
    queryKey: ["history-list", search],
    queryFn: async () => fetchHistoryList(search),
    ...rest,
  });
}
