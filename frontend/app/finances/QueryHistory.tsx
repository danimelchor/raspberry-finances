import { Card, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon, PlayIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { Query } from "@/types";
import useHistoryList from "@/hooks/useHistoryList";
import EditQueryDialog from "./EditQueryDialog";
import TogglePinnedButton from "./TogglePinnedButton";
import moment from "moment";
import humanizeDuration from "humanize-duration";

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

function QueryItem({
  setQuery,
  item,
}: {
  setQuery: (query: Query) => void;
  item: Query;
}) {
  const getLatestRunStr = () => {
    const lastRun = moment.utc(item.updated_at!).diff(moment.utc());
    return humanizeDuration(lastRun, {
      largest: 2,
      round: true,
    });
  };

  const [lastRunStr, setLastRunStr] = useState(getLatestRunStr);
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRunStr(getLatestRunStr());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-5 cursor-pointer flex flex-col gap-1">
      <div className="flex justify-between items-center gap-1">
        <span
          className={cn("text-sm", {
            "font-semibold": item.title,
            "italic text-gray-400": !item.title,
          })}
        >
          {item.title || "Untitled query"}
        </span>

        <div className="flex gap-1">
          <TogglePinnedButton item={item} />
          <EditQueryDialog item={item} />
          <Button
            onClick={() => {
              setQuery(item);
            }}
            size="sm"
            variant="ghost"
            className="px-1"
          >
            <PlayIcon className="w-5" />
          </Button>
        </div>
      </div>

      <CollapsibleSql sql={item.sql} />
      <div className="text-sm text-gray-500">Last run: {lastRunStr} ago</div>
      <div className="text-sm text-gray-500">
        Display type: {item.display_type}
      </div>
    </div>
  );
}

function QueryTable({ setQuery }: { setQuery: (query: Query) => void }) {
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");
  const { data: history, isLoading } = useHistoryList({ search });

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
          <QueryItem setQuery={setQuery} item={h} key={h.sql} />
        ))}
      </div>
    </div>
  );
}

function QueryQuery({ setQuery }: { setQuery: (query: Query) => void }) {
  return (
    <Card className="p-6">
      <CardTitle>Query history</CardTitle>
      <QueryTable setQuery={setQuery} />
    </Card>
  );
}

export default QueryQuery;
