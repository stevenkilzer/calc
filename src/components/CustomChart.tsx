import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatNumber } from "@/lib/utils"

interface DataPoint {
  month: number;
  remainingBalance?: number;
  cumulativeProfit?: number;
  cumulativeCashFlow?: number;
  principalPayment?: number;
  interestPayment?: number;
}

interface CustomChartProps {
  data: DataPoint[];
  title: string;
  showLoanBalance: boolean;
  showCumulativeProfit: boolean;
  showCashFlow: boolean;
  showPrincipalPayment?: boolean;
  showInterestPayment?: boolean;
  isAnnualView: boolean;
  breakEvenMonth?: number | null;
  height?: number;
}

export const CustomChart: React.FC<CustomChartProps> = ({
  data,
  title,
  showLoanBalance,
  showCumulativeProfit,
  showCashFlow,
  showPrincipalPayment,
  showInterestPayment,
  isAnnualView,
  breakEvenMonth,
  height = 400
}) => {
  if (!data || data.length === 0) {
    return <div>No data available for the chart.</div>;
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            label={{ value: isAnnualView ? 'Year' : 'Month', position: 'insideBottomRight', offset: -10 }}
            tickFormatter={(value) => isAnnualView ? Math.ceil(value / 12).toString() : value.toString()}
          />
          <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value: number) => ['$' + formatNumber(value, 2)]}
            labelFormatter={(label: number) => isAnnualView ? `Year ${Math.ceil(label / 12)}` : `Month ${label}`}
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
          {showCumulativeProfit && (
            <Line
              type="monotone"
              dataKey="cumulativeProfit"
              name="Cumulative Profit"
              stroke="hsl(var(--chart-4))"
              dot={false}
              activeDot={{ r: 8 }}
            />
          )}
          {showCashFlow && (
            <Line
              type="monotone"
              dataKey="cumulativeCashFlow"
              name="Cumulative Cash Flow"
              stroke="hsl(var(--chart-3))"
              dot={false}
              activeDot={{ r: 8 }}
            />
          )}
          {showPrincipalPayment && (
            <Line
              type="monotone"
              dataKey="principalPayment"
              name="Principal Payment"
              stroke="hsl(var(--chart-2))"
              dot={false}
              activeDot={{ r: 8 }}
            />
          )}
          {showInterestPayment && (
            <Line
              type="monotone"
              dataKey="interestPayment"
              name="Interest Payment"
              stroke="hsl(var(--chart-1))"
              dot={false}
              activeDot={{ r: 8 }}
            />
          )}
          {breakEvenMonth && (
            <ReferenceLine
              x={breakEvenMonth}
              stroke="red"
              label={{
                value: "Break-even",
                position: 'insideBottomLeft',
                fill: 'hsl(var(--foreground))',
                fontSize: 12
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};