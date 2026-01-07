import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface PaymentMethodChartProps {
    data: { name: string; value: number }[];
}

export function PaymentMethodChart({ data }: PaymentMethodChartProps) {
    // If no data, provide simplified mock or empty state
    const chartData = data && data.length > 0 ? data : [
        { name: 'Espèces', value: 400 },
        { name: 'Virement', value: 300 },
        { name: 'Chèque', value: 300 },
    ];

    return (
        <Card 
            style={{ width: '100%', height: '100%', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            bodyStyle={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <div className="mb-6">
                <Title level={4} style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Méthodes de Paiement</Title>
                <Text type="secondary" style={{ fontSize: '14px' }}>Distribution par type</Text>
            </div>

            <div style={{ flex: 1, minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number | undefined) => `${value} MAD`} />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
             <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>Total des transactions analysées</Text>
            </div>
        </Card>
    );
}
