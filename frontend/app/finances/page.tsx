"use client";

import { useEffect, useState } from "react";

import Spinner from "@/components/Spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import QueryEditor from "./QueryEditor";
import { format } from "sql-formatter";
import QueryResults from "./QueryResults";
import RightPannel from "./RightPannel";
import type { Query } from "@/types";
import Header from "./Header";
import { useHotkeys } from "react-hotkeys-hook";

type QueryResultPre = {
  columns: string[];
  rows: any[][];
};

const EMPTY_QUERY: Query = {
  sql: "",
  display_type: "table",
};

function DynamicPage<T>() {
  const queryClient = useQueryClient();

  const [error, setError] = useState<string>();
  const [data, setData] = useState<T[]>([]);
  const [columns, setColumns] = useState<string[]>();

  const [currentQuery, setCurrentQuery] = useState<Query>(EMPTY_QUERY);

  useEffect(() => {
    setError(undefined);
    setData([]);
    setColumns(undefined);
  }, []);

  const submit = async (query: Query) => {
    if (query.id && query.sql !== query.originalSql) {
      let confirm = window.confirm(
        "You are about to update a saved query. Are you sure you want to do this?",
      );
      if (!confirm) {
        return;
      }
    }

    const res = await fetch("/api/run", {
      method: "POST",
      body: JSON.stringify(query),
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
    setCurrentQuery((q) => {
      if (q) {
        return { ...q, sql: formatSql(q.sql) };
      }
      return q;
    });
  };

  const {
    mutateAsync: handleSubmitMut,
    isPending: running,
    isSuccess,
  } = useMutation({
    mutationFn: submit,
    onSuccess: (data) => {
      if (!data) {
        return;
      }

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
      queryClient.invalidateQueries({ queryKey: ["history-list"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  useHotkeys("mod+enter", () => handleSubmitMut(currentQuery), [currentQuery]);
  useHotkeys("mod+;", handleFormat);
  useHotkeys("mod+backspace", () => setCurrentQuery(EMPTY_QUERY));

  return (
    <div className="flex flex-col h-screen w-full p-10 border-box gap-6">
      <h1 className="text-4xl font-bold">Dynamic Queries</h1>
      <div className="flex gap-5 w-full h-full">
        <div className="flex flex-col gap-4 w-full h-full">
          <Header query={currentQuery} />

          <QueryEditor
            query={currentQuery}
            setQuery={setCurrentQuery}
            onFormat={handleFormat}
            onSubmit={() => handleSubmitMut(currentQuery)}
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
                resubmit={() => handleSubmitMut(currentQuery)}
                displayType={currentQuery.display_type}
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
          formatSql={formatSql}
          setQuery={(q: Query) => {
            setCurrentQuery(q);
            handleSubmitMut(q);
          }}
        />
      </div>
    </div>
  );
}

export default DynamicPage;
