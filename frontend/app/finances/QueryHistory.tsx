import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DisplayType } from "./QueryResults";
import { Input } from "@/components/ui/input";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import { PinIcon, PinOffIcon } from "lucide-react";

type History = {
  query: string;
  created_at: string;
  pinned: boolean;
  title: string;
};

const fetchHistory = async (): Promise<History[]> => {
  const res = await fetch("/api/history");
  if (!res.ok) {
    throw new Error("Failed to fetch history");
  }
  return res.json();
};

const searchHistory = async (query: string): Promise<History[]> => {
  const res = await fetch(`/api/history?q=${query}`);
  if (!res.ok) {
    throw new Error("Failed to search history");
  }
  return res.json();
};

function Query({
  setQuery,
  setDisplayType,
  item,
  submitQuery,
}: {
  setQuery: (query: string) => void;
  setDisplayType: Dispatch<SetStateAction<DisplayType>>;
  item: History;
  submitQuery: (query: string) => void;
}) {
  return (
    <div
      className="py-5 cursor-pointer flex flex-col gap-2"
      onClick={() => {
        setQuery(item.query);
        setDisplayType("line");
        submitQuery(item.query);
      }}
    >
      <div className="flex justify-between">
        <Input type="text" value={item.title} />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            item.pinned = !item.pinned;
          }}
        >
          {item.pinned ? <PinOffIcon /> : <PinIcon />}
        </Button>
      </div>

      <pre className="text-sm text-gray-500 bg-gray-100 border border-gray-200 p-2 overflow-x-auto">
        {item.query}
      </pre>
      <div className="text-sm text-gray-500">{item.created_at}</div>
    </div>
  );
}

function HistoryTable({
  setQuery,
  setDisplayType,
  submitQuery,
}: {
  setQuery: (query: string) => void;
  setDisplayType: Dispatch<SetStateAction<DisplayType>>;
  submitQuery: (query: string) => void;
}) {
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");
  const { data: history, isLoading } = useQuery({
    queryKey: ["history", search],
    queryFn: search ? () => searchHistory(search) : fetchHistory,
  });

  useEffect(() => {
    const debounced = _.debounce(() => setSearch(value), 500);
    debounced();
    return debounced.cancel;
  }, [value]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col">
      <Input
        type="text"
        placeholder="Search history"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="overflow-y-auto divide-y divide-gray-200">
        {history?.map((h) => (
          <Query
            setQuery={setQuery}
            setDisplayType={setDisplayType}
            submitQuery={submitQuery}
            item={h}
            key={h.query}
          />
        ))}
      </div>
    </div>
  );
}

function QueryHistory({
  setQuery,
  setDisplayType,
  submitQuery,
}: {
  setQuery: (query: string) => void;
  setDisplayType: Dispatch<SetStateAction<DisplayType>>;
  submitQuery: (query: string) => void;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Query history</CardTitle>
      </CardHeader>
      <CardContent>
        <HistoryTable
          setQuery={setQuery}
          setDisplayType={setDisplayType}
          submitQuery={submitQuery}
        />
      </CardContent>
    </Card>
  );
}

export default QueryHistory;
