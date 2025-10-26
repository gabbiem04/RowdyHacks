
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface ExpenseChartProps {
  income: number;
  expenses: number;
}

const COLORS = ['#10b981', '#ef4444', '#3b82f6'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 p-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
        <p className="label text-gray-800 dark:text-gray-200">{`${payload[0].name} : $${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

const ExpenseChart: React.FC<ExpenseChartProps> = ({ income, expenses }) => {
  const savings = income - expenses;
  const data: ChartData[] = [
    { name: 'Expenses', value: expenses },
    { name: 'Savings', value: savings > 0 ? savings : 0 },
  ];
  
  if (income === 0 && expenses === 0) {
    return (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            Enter your income and expenses to see the chart.
        </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExpenseChart;
