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

const TABLES = {
  statements: {
    date: "DATE",
    merchant: "TEXT",
    amount: "REAL",
    category: "TEXT",
    source: "TEXT",
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

function Schema() {
  const [selected, setSelected] = useState<keyof typeof TABLES>("statements");
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Schema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <TableSelect selected={selected} setSelected={setSelected} />
          <TableSchema schema={TABLES[selected]} />
        </div>
      </CardContent>
    </Card>
  );
}

export default Schema;
