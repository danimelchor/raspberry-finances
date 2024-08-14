"use client";

import { CartesianGrid, Bar, BarChart, XAxis, LabelList } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

function CustomBarChart({
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
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  const xAxisLabelNumChars = data[0][xKey].length;

  return (
    <div className="w-full h-full">
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={data}>
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
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey={yKey} fill="hsl(var(--primary))" radius={2}>
            {data.length <= 20 && (
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            )}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export default CustomBarChart;
