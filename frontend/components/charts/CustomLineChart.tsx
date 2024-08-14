"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

function CustomLineChart({
  data,
  xKey,
  yKey,
  legend,
}: {
  data: any;
  xKey: string;
  yKey: string;
  legend: string;
}) {
  const chartConfig = {
    [yKey]: {
      label: legend,
      color: "hsb(var(--primary))",
    },
  } satisfies ChartConfig;

  const xAxisLabelNumChars = data[0][xKey].length;

  return (
    <div className="w-full h-full">
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={data}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            angle={-45}
            textAnchor="end"
            height={xAxisLabelNumChars * 8}
          />
          <YAxis
            dataKey={yKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Line
            dataKey={yKey}
            type="linear"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

export default CustomLineChart;
