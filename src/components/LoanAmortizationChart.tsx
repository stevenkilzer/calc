import React, { useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';
import { formatNumber } from "@/lib/utils"

interface AmortizationScheduleItem {
  month: number;
  remainingBalance: number;
  principalPayment: number;
  interestPayment: number;
}

interface LoanAmortizationChartProps {
  data: AmortizationScheduleItem[];
  showPrincipalPayment: boolean;
  showInterestPayment: boolean;
  height?: number;
}

export const LoanAmortizationChart: React.FC<LoanAmortizationChartProps> = ({
  data,
  showPrincipalPayment,
  showInterestPayment,
  height = 400
}) => {
  const [xDomain, setXDomain] = useState<[number, number]>([0, data.length - 1]);

  const handleBrushChange = useCallback((newDomain: any) => {
    setXDomain(newDomain);
  }, []);

  return (
    <div className="w-full">
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
            label={{ value: 'Month', position: 'insideBottomRight', offset: -10 }}
          />
          <YAxis
            label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: number) => ['$' + formatNumber(value, 2)]}
            labelFormatter={(label: number) => `Month ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="remainingBalance"
            name="Remaining Balance"
            stroke="hsl(var(--chart-5))"
            dot={false}
            activeDot={{ r: 8 }}
          />
          {showPrincipalPayment && (
            <Line
              type="monotone"
              dataKey="principalPayment"
              name="Principal Payment"
              stroke="hsl(var(--chart-4))"
              dot={false}
              activeDot={{ r: 8 }}
            />
          )}
          {showInterestPayment && (
            <Line
              type="monotone"
              dataKey="interestPayment"
              name="Interest Payment"
              stroke="hsl(var(--chart-3))"
              dot={false}
              activeDot={{ r: 8 }}
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