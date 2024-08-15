"use client";

import { useState } from "react";

import Spinner from "@/components/Spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import QueryEditor from "./QueryEditor";
import { useStorage } from "@/hooks/useStorage";
import { format } from "sql-formatter";
import QueryResults, { type DisplayType } from "./QueryResults";
import RightPannel from "./RightPannel";
import { useHotkeys } from "react-hotkeys-hook";

type QueryResultPre = {
  columns: string[];
  rows: any[][];
};

function DynamicPage<T>() {
  const queryClient = useQueryClient();

  const [error, setError] = useState<string>();
  const [data, setData] = useState<T[]>([]);
  const [columns, setColumns] = useState<string[]>();
  const [displayType, setDisplayType] = useState<DisplayType>("table");

  const [query, setQuery] = useStorage<string>(
    "dynamic-query",
    "SELECT merchant, date, amount\nFROM statements\nLIMIT 1",
  );

  const handleSubmit = async (query: string) => {
    const res = await fetch("/api/run", {
      method: "POST",
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    const data = await res.json();
    return data as QueryResultPre;
  };

  const formatSql = (sql: string) => {
    return format(sql, {
      language: "postgresql",
    });
  };

  const handleFormat = () => {
    setQuery((q) => formatSql(q));
  };

  const {
    mutateAsync: handleSubmitMut,
    isPending: running,
    isSuccess,
  } = useMutation({
    mutationFn: handleSubmit,
    onSuccess: (data) => {
      setColumns(data.columns);
      setData(
        data.rows.map((row) => {
          return row.reduce(
            (acc, val, i) => {
              acc[data.columns[i]] = val;
              return acc;
            },
            {} as { [key: string]: any },
          );
        }),
      );
      setError(undefined);
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  useHotkeys("mod+;", handleFormat);
  useHotkeys("mod+enter", () => handleSubmitMut(query));
  useHotkeys("mod+backspace", () => setQuery(""));

  return (
    <div className="flex flex-col h-screen w-full p-10 border-box gap-6">
      <h1 className="text-4xl font-bold">Dynamic Queries</h1>
      <div className="flex gap-5 w-full h-full">
        <div className="flex flex-col gap-4 w-full h-full">
          <QueryEditor
            query={query}
            setQuery={setQuery}
            onFormat={handleFormat}
            onSubmit={() => handleSubmitMut(query)}
            displayType={displayType}
            setDisplayType={setDisplayType}
          />
          {running && <Spinner />}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                An error occurred while running the query: {error}
              </AlertDescription>
            </Alert>
          )}

          {data.length > 0 && columns && (
            <div className="flex items-center w-full">
              <QueryResults
                data={data}
                columns={columns}
                resubmit={() => handleSubmitMut(query)}
                displayType={displayType}
              />
            </div>
          )}

          {data.length === 0 &&
            !running &&
            !error &&
            (isSuccess ? (
              <div className="flex flex-col items-center gap-4">
                <p>Your query returned no results</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p>Run a query to see the results here</p>
              </div>
            ))}
        </div>
        <RightPannel
          setQuery={(q) => setQuery(formatSql(q))}
          setDisplayType={setDisplayType}
          submitQuery={(q) => handleSubmitMut(q)}
        />
      </div>
    </div>
  );
}

export default DynamicPage;
