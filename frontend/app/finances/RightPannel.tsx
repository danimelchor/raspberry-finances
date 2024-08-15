import { useState } from "react";
import Schema from "./Schema";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QueryHistory from "./QueryHistory";
import { Query } from "@/types";

function RightPannel({
  setQuery,
  formatSql,
}: {
  setQuery: (query: Query) => void;
  formatSql: (sql: string) => string;
}) {
  const [tab, setTab] = useState("history");

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="w-[350px] shrink-0 flex flex-col gap-2"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="schema">Schema</TabsTrigger>
      </TabsList>
      {tab === "history" ? (
        <QueryHistory setQuery={setQuery} />
      ) : (
        <Schema setQuery={(q) => setQuery({ ...q, sql: formatSql(q.sql) })} />
      )}
    </Tabs>
  );
}

export default RightPannel;
