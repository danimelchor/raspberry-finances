import { Dispatch, SetStateAction, useState } from "react";
import { DisplayType } from "./QueryResults";
import Schema from "./Schema";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QueryHistory from "./QueryHistory";

function RightPannel({
  submitQuery,
  setQuery,
  setDisplayType,
}: {
  submitQuery: (query: string) => void;
  setQuery: (query: string) => void;
  setDisplayType: Dispatch<SetStateAction<DisplayType>>;
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
        <QueryHistory
          setQuery={setQuery}
          setDisplayType={setDisplayType}
          submitQuery={submitQuery}
        />
      ) : (
        <Schema setQuery={setQuery} />
      )}
    </Tabs>
  );
}

export default RightPannel;
