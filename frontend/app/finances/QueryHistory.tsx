import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { DisplayType } from "./QueryResults";
import { Input } from "@/components/ui/input";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EditIcon,
  PinIcon,
  PinOffIcon,
  PlayIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DisplayTypeSelect from "./DisplayTypeSelect";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type History = {
  query: string;
  created_at: string;
  pinned: boolean;
  title: string;
  display_type: DisplayType;
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

const updateHistoryItem = async (item: History): Promise<History> => {
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

function EditDialog({
  mutateAsync,
  item: _item,
}: {
  mutateAsync: (item: History) => void;
  item: History;
}) {
  const [item, setItem] = useState(_item);
  useEffect(() => {
    setItem(_item);
  }, [_item]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutateAsync(item);
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button size="sm" variant="ghost" className="px-1">
          <EditIcon className="w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <form onSubmit={onSubmit} className="flex flex-col gap-2">
            <DialogTitle>Edit history item</DialogTitle>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                name="title"
                value={item.title}
                onChange={(e) => setItem({ ...item, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="display_type">Display type</Label>
              <DisplayTypeSelect
                name="display_type"
                value={item.display_type}
                setValue={(v) => setItem({ ...item, display_type: v })}
                fullSize
              />
            </div>
            <Button onClick={onSubmit} type="submit">
              Save
            </Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function CollapsibleSql({ sql }: { sql: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="text-sm text-gray-500 cursor-pointer flex items-center">
        {open ? (
          <ChevronDownIcon className="w-5" />
        ) : (
          <ChevronUpIcon className="w-5" />
        )}
        {open ? "Hide" : "Show"} query
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="text-sm text-gray-500 bg-gray-100 border border-gray-200 p-2 overflow-x-auto">
          {sql}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}

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
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: updateHistoryItem,
    onSuccess: () => {
      toast.success("History item updated");
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
    onError: () => {
      toast.error("Failed to update history item");
    },
  });

  const togglePinned = () => {
    let newItem = { ...item, pinned: !item.pinned };
    mutateAsync(newItem);
  };

  return (
    <div className="py-5 cursor-pointer flex flex-col gap-1">
      <div className="flex justify-between items-center gap-1">
        <span
          className={cn("text-sm", {
            "font-semibold": item.title,
            "italic text-gray-400": !item.title,
          })}
        >
          {item.title || "Untitled"}
        </span>

        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              togglePinned();
            }}
            className="px-1"
          >
            {item.pinned ? (
              <PinIcon className="w-5 fill-red-400" />
            ) : (
              <PinIcon className="w-5" />
            )}
          </Button>
          <EditDialog item={item} mutateAsync={mutateAsync} />
          <Button
            onClick={() => {
              setQuery(item.query);
              setDisplayType(item.display_type);
              submitQuery(item.query);
            }}
            size="sm"
            variant="ghost"
            className="px-1"
          >
            <PlayIcon className="w-5" />
          </Button>
        </div>
      </div>

      <CollapsibleSql sql={item.query} />
      <div className="text-sm text-gray-500">
        Last run: {new Date(item.created_at).toLocaleString()}
      </div>
      <div className="text-sm text-gray-500">
        Display type: {item.display_type}
      </div>
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
    <div className="pt-6 flex flex-col gap-5">
      <Input
        type="text"
        placeholder="Search history"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="overflow-y-auto divide-y divide-gray-200 p-1 h-[60vh]">
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
    <Card className="p-6">
      <CardTitle>Query history</CardTitle>
      <HistoryTable
        setQuery={setQuery}
        setDisplayType={setDisplayType}
        submitQuery={submitQuery}
      />
    </Card>
  );
}

export default QueryHistory;
