import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Query } from "@/types";

const TABLES = {
  all_data: {
    date: "DATE",
    merchant: "TEXT",
    amount: "REAL",
    source: "TEXT",
    category: "TEXT",
  },
  statements: {
    date: "DATE",
    merchant: "TEXT",
    amount: "REAL",
    source: "TEXT",
  },
  categories: {
    merchant: "TEXT",
    category: "TEXT",
    updated_at: "DATE",
  },
  hidden: {
    merchant: "TEXT",
    updated_at: "DATE",
  },
};

export function TableSelect({
  selected,
  setSelected,
}: {
  selected: keyof typeof TABLES;
  setSelected: (table: keyof typeof TABLES) => void;
}) {
  return (
    <Select onValueChange={setSelected} value={selected}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a table" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Table</SelectLabel>
          {Object.keys(TABLES).map((table) => (
            <SelectItem key={table} value={table}>
              {table}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

const COLORS = {
  TEXT: "blue",
  REAL: "green",
  DATE: "purple",
};

function DataTypeBadge({ type }: { type: string }) {
  const color = COLORS[type as keyof typeof COLORS] || "gray";
  return <Badge variant={color as any}>{type}</Badge>;
}

function TableSchema({ schema }: { schema: { [key: string]: string } }) {
  return (
    <table className="w-full text-left divide-y divide-gray-200">
      <thead>
        <tr>
          <th className="py-2 text-left">Column</th>
          <th className="py-2 text-left">Type</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {Object.entries(schema).map(([column, type]) => (
          <tr key={column}>
            <td className="py-2">{column}</td>
            <td className="py-2">
              <DataTypeBadge type={type} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Schema({ setQuery }: { setQuery: (query: Query) => void }) {
  const [selected, setSelected] = useState<keyof typeof TABLES>("all_data");

  const prefill = () => {
    const columns = Object.keys(TABLES[selected]);
    const query = `SELECT ${columns.join(", ")} FROM ${selected} LIMIT 10;`;
    setQuery({
      sql: query,
      originalSql: query,
      display_type: "table",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <TableSelect selected={selected} setSelected={setSelected} />
          <TableSchema schema={TABLES[selected]} />
        </div>
        <Button
          onClick={prefill}
          variant="secondary"
          size="sm"
          className="w-full mt-4"
        >
          Prefill query
        </Button>
      </CardContent>
    </Card>
  );
}

export default Schema;
