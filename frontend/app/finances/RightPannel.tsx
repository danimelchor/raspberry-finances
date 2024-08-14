import { Dispatch, SetStateAction } from "react";
import { DisplayType } from "./QueryResults";
import Schema from "./Schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  return (
    <Tabs defaultValue="schema" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="schema">Schema</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      <TabsContent value="schema">
        <Schema setQuery={setQuery} />
      </TabsContent>
      <TabsContent value="history">
        <QueryHistory
          setQuery={setQuery}
          setDisplayType={setDisplayType}
          submitQuery={submitQuery}
        />
      </TabsContent>
    </Tabs>
  );
}

export default RightPannel;
