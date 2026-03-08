import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, Typography } from "antd";

// Mock data if no real data is passed
const defaultData = [
  { month: "Janvier", income: 186, expense: 80 },
  { month: "Février", income: 305, expense: 200 },
  { month: "Mars", income: 237, expense: 120 },
  { month: "Avril", income: 73, expense: 190 },
];

const { Title, Text } = Typography;

interface ChartProps {
  data?: any[];
}

export function IncomeExpenseChart({ data = defaultData }: ChartProps) {
  // Calculate trend (mock logic)
  const lastMonth = data[data.length - 1] || { income: 0 };
  const prevMonth = data[data.length - 2] || { income: 0 };
  const trend = lastMonth.income > prevMonth.income ? "up" : "down";
  const percentage = prevMonth.income ? ((lastMonth.income - prevMonth.income) / prevMonth.income * 100).toFixed(1) : "0";

  return (
    <Card
      style={{ width: '100%', height: '100%', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
      styles={{ body: { padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' } }}
    >
      <div className="mb-6">
        <Title level={4} style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Revenus vs Dépenses</Title>
        <Text type="secondary" style={{ fontSize: '14px' }}>Transactions des 4 derniers mois</Text>
      </div>

      <div style={{ flex: 1, minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              left: 0,
              right: 0,
              top: 10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              style={{ fontSize: '12px', fill: '#888' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={{ background: 'white', border: '1px solid #eee', padding: '8px 12px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '4px' }}>{label}</p>
                      {payload.map((entry: any, index: number) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }}></div>
                          <span style={{ fontSize: '12px', color: '#555', textTransform: 'capitalize' }}>
                            {entry.name}: <span style={{ fontWeight: 600 }}>{entry.value} MAD</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              dataKey="expense"
              name="Dépenses"
              type="natural"
              fill="#ef4444" // Red/Pink
              fillOpacity={0.2}
              stroke="#ef4444"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="income"
              name="Revenus"
              type="natural"
              fill="#22c55e" // Green
              fillOpacity={0.2}
              stroke="#22c55e"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '14px' }}>
            {trend === 'up' ? 'Tendance à la hausse' : 'Tendance à la baisse'} de {Math.abs(Number(percentage))}% ce mois
            {trend === 'up' ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          </div>
          <div style={{ color: '#888', fontSize: '12px' }}>
            4 derniers mois
          </div>
        </div>
      </div>
    </Card>
  );
}
