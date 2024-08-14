import QueryTable from "./QueryTable";
import CustomLineChart from "@/components/charts/CustomLineChart";
import CustomBarChart from "@/components/charts/CustomBarChart";
import CustomPieChart from "@/components/charts/CustomPieChart";

export type DisplayType = "line" | "bar" | "pie" | "table";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function QueryResults<T>({
  columns,
  data,
  resubmit,
  displayType,
}: {
  columns: string[];
  data: T[];
  resubmit: () => void;
  displayType?: DisplayType;
}) {
  const xKey = columns[0];
  const yKey = columns[1];

  if (displayType === "line") {
    return (
      <CustomLineChart
        data={data}
        xKey={xKey}
        yKey={yKey}
        legend={capitalize(yKey)}
      />
    );
  }
  if (displayType === "bar") {
    return (
      <CustomBarChart
        data={data}
        xKey={xKey}
        yKey={yKey}
        legend={capitalize(yKey)}
      />
    );
  }
  if (displayType === "pie") {
    return <CustomPieChart data={data} xKey={xKey} yKey={yKey} />;
  }
  return <QueryTable data={data} columns={columns} resubmit={resubmit} />;
}

export default QueryResults;
