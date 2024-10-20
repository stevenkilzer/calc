import React, { useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';
import { formatNumber } from "@/lib/utils"

interface DataPoint {
  month: number;
  remainingBalance?: number;
  monthlyNetIncome?: number;
  monthlyCashFlow?: number;
  cumulativeProfit?: number;
}

interface CustomChartProps {
  data: DataPoint[];
  title: string;
  showLoanBalance: boolean;
  showMonthlyNetIncome: boolean;
  showMonthlyCashFlow: boolean;
  showCumulativeProfit: boolean;
  breakEvenMonth?: number | null;
  height?: number;
}

export const CustomChart: React.FC<CustomChartProps> = ({
  data,
  title,
  showLoanBalance,
  showMonthlyNetIncome,
  showMonthlyCashFlow,
  showCumulativeProfit,
  breakEvenMonth,
  height = 400
}) => {
  const [xDomain, setXDomain] = useState<[number, number]>([0, data.length - 1]);

  const handleBrushChange = useCallback((brushData: any) => {
    if (Array.isArray(brushData)) {
      setXDomain(brushData as [number, number]);
    } else if (brushData && typeof brushData === 'object' && 'startIndex' in brushData && 'endIndex' in brushData) {
      setXDomain([brushData.startIndex, brushData.endIndex]);
    }
  }, []);

  if (!data || data.length === 0) {
    return <div>No data available for the chart.</div>;
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 32, left: 24, bottom: 24 }}
        >
          <CartesianGrid strokeDasharray="8 8" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
            domain={xDomain}
            type="number"
            label={{ value: '', position: 'insideBottomRight', offset: -40 }}
          />
          <YAxis
            label={{ value: '', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: number) => ['$' + formatNumber(value, 2)]}
            labelFormatter={(label: number) => `Month ${label}`}
          />
          <Legend />
          {showLoanBalance && (
            <Line
              type="monotone"
              dataKey="remainingBalance"
              name="Remaining Balance"
              stroke="hsl(var(--chart-5))"
              dot={false}
              activeDot={{ r: 8 }}
            />
          )}
          {showMonthlyNetIncome && (
            <Line
              type="monotone"
              dataKey="monthlyNetIncome"
              name="Monthly Net Income"
              stroke="hsl(var(--chart-4))"
              dot={false}
              activeDot={{ r: 8 }}
            />
          )}
          {showMonthlyCashFlow && (
            <Line
              type="monotone"
              dataKey="monthlyCashFlow"
              name="Monthly Cash Flow"
              stroke="hsl(var(--chart-3))"
              dot={false}
              activeDot={{ r: 8 }}
            />
          )}
          {showCumulativeProfit && (
            <Line
              type="monotone"
              dataKey="cumulativeProfit"
              name="Cumulative Profit"
              stroke="hsl(var(--chart-2))"
              dot={false}
              activeDot={{ r: 8 }}
            />
          )}
          {breakEvenMonth && (
            <ReferenceLine
              x={breakEvenMonth}
              stroke="hsl(var(--chart-1))"
              label={{
                value: "Break-Even",
                position: 'insideBottomLeft',
                fill: 'hsl(var(--foreground))',
                fontSize: 14
              }}
            />
          )}
          <Brush
            dataKey="month"
            height={24}
            stroke="hsl(var(--muted-foreground))"
            onChange={handleBrushChange}
            startIndex={xDomain[0]}
            endIndex={xDomain[1]}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};