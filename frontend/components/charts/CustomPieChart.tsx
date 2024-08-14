"use client";

import { Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo } from "react";
import _ from "lodash";

const generateHsl = (perc: number) => {
  return `hsl(${perc * 360}, 70%, 60%)`;
};

const generateHsls = (count: number) => {
  const sorted = Array.from({ length: count }, (_, index) => {
    return generateHsl(index / count);
  });
  return _.shuffle(sorted);
};

function CustomPieChart({
  data,
  xKey,
  yKey,
}: {
  data: any;
  xKey: string;
  yKey: string;
}) {
  const categories = useMemo(() => {
    return _.uniq(data.map((d: any) => d[xKey]));
  }, [data, xKey]);

  const chartConfig = useMemo(() => {
    const colors = generateHsls(categories.length);
    return categories.reduce((acc: any, category: any, index: number) => {
      acc[category] = {
        label: category,
        color: colors[index],
      };
      return acc;
    }, {}) as ChartConfig;
  }, [categories]);

  const chartData = useMemo(() => {
    return data.map((d: any) => {
      return {
        ...d,
        fill: chartConfig[d[xKey]].color,
      };
    });
  }, [data, chartConfig, xKey]);

  return (
    <div className="w-full h-full">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[450px]"
      >
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Pie dataKey={yKey} nameKey={xKey} data={chartData} stroke="0" />
        </PieChart>
      </ChartContainer>
    </div>
  );
}

export default CustomPieChart;
