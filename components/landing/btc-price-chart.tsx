"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useSocket } from "@/context/socket-context";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  price: {
    label: "BTC Price",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function ChartContent() {
  const { priceHistory } = useSocket();

  const chartData = priceHistory.map((item) => ({
    timestamp: new Date(item.timestamp).toLocaleTimeString(),
    price: parseFloat(item.price),
  }));

  return (
    <ChartContainer config={chartConfig}>
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 12,
          left: 12,
          right: 12,
          bottom: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
          domain={["dataMin", "dataMax"]}
          padding={{ top: 20, bottom: 20 }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Line
          dataKey="price"
          type="natural"
          stroke="var(--badge-warning)"
          strokeWidth={2}
          isAnimationActive={false}
          dot={false}
          activeDot={{
            r: 6,
          }}
        />
      </LineChart>
    </ChartContainer>
  );
}

function ChartFooter() {
  const { data, isConnected } = useSocket();
  const priceChangePercent = data ? parseFloat(data.priceChangePercent) : 0;

  return (
    <CardFooter className="flex-col items-start gap-2 text-sm">
      <div className="flex gap-2 font-medium leading-none">
        {priceChangePercent > 0 ? (
          <>
            Up by {priceChangePercent.toFixed(2)}%{" "}
            <TrendingUp className="h-4 w-4 text-green-500" />
          </>
        ) : (
          <>
            Down by {Math.abs(priceChangePercent).toFixed(2)}%{" "}
            <TrendingDown className="h-4 w-4 text-red-500" />
          </>
        )}
      </div>
      <div className="leading-none text-muted-foreground">
        {isConnected ? "Connected to real-time price feed" : "Connecting..."}
      </div>
    </CardFooter>
  );
}

export function BtcPriceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bitcoin Price Chart</CardTitle>
        <CardDescription>Real-time BTC/USD price updates</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContent />
      </CardContent>
      <ChartFooter />
    </Card>
  );
}
