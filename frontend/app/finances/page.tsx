"use client";

import { useState } from "react";

import Spinner from "@/components/Spinner";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import QueryEditor from "./QueryEditor";
import QueryTable from "./QueryTable";
import Schema from "./Schema";
import { useStorage } from "@/hooks/useStorage";
import { format } from "sql-formatter";

type QueryResultPre = {
  columns: string[];
  rows: any[][];
};

function DynamicPage<T>() {
  const [error, setError] = useState<string>();
  const [data, setData] = useState<T[]>([]);
  const [columns, setColumns] = useState<string[]>();

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
    onSettled: (data, error) => {
      if (error) {
        setError(error.message);
        return;
      } else if (!data) {
        setError("No data returned");
        return;
      }

      setError(undefined);
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
    },
  });

  return (
    <div className="flex flex-col h-screen w-full p-10 gap-6">
      <h1 className="text-4xl font-bold">Dynamic Queries</h1>
      <div className="flex gap-5 w-full h-full">
        <div className="flex flex-col w-full gap-4">
          <QueryEditor
            query={query}
            setQuery={setQuery}
            onFormat={handleFormat}
            onSubmit={() => handleSubmitMut(query)}
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
            <div>
              <QueryTable
                data={data}
                columns={columns}
                resubmit={() => handleSubmitMut(query)}
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
        <Schema setQuery={(q) => setQuery(formatSql(q))} />
      </div>
    </div>
  );
}

export default DynamicPage;
