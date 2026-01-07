import React from 'react';
import { Area } from '@ant-design/plots';
import { Card, Typography } from 'antd';
import './PaymentChargeChart.css'; 

const { Title, Text } = Typography;

interface DataItem {
  month: string;
  value: number;
  type: 'Charges' | 'Paiements';
}

const PaymentChargeChart: React.FC = () => {
  // 1. Data estimation based on the provided image
  const data: DataItem[] = [
    { month: 'Dec', value: 25000, type: 'Charges' },
    { month: 'Dec', value: 22000, type: 'Paiements' },
    
    { month: 'Jan', value: 24000, type: 'Charges' },
    { month: 'Jan', value: 18000, type: 'Paiements' },

    { month: 'Feb', value: 22000, type: 'Charges' },
    { month: 'Feb', value: 23500, type: 'Paiements' },

    { month: 'Mar', value: 28000, type: 'Charges' },
    { month: 'Mar', value: 21500, type: 'Paiements' },

    { month: 'April', value: 30000, type: 'Charges' }, // Highest Charges
    { month: 'April', value: 26000, type: 'Paiements' },

    { month: 'May', value: 26000, type: 'Charges' },
    { month: 'May', value: 32000, type: 'Paiements' },

    { month: 'Jun', value: 29000, type: 'Charges' },
    { month: 'Jun', value: 35000, type: 'Paiements' }, // Highest Paiements
  ];

  // 2. Chart Configuration
  const config = {
    data,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    smooth: true, // Creates the curvy spline lines
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    // Custom colors to match the image: [Charges (Orange), Paiements (Green)]
    color: ['#D4886A', '#5B8C85'], 
    
    // Style the area fill (using a subtle gradient or opacity)
    areaStyle: () => {
      return {
        fillOpacity: 0.2,
      };
    },
    
    // Y-Axis formatting (10k, 20k, etc.)
    yAxis: {
      label: {
        formatter: (v: string) => `${parseInt(v) / 1000}k`,
      },
      grid: {
        line: {
          style: {
            lineDash: [4, 4], // Dashed grid lines like the image
            stroke: '#e0e0e0',
          },
        },
      },
    },
    
    // Legend hidden in chart area to match image (usually handled by external UI, but can be enabled)
    legend: false as const,

    // 3. Annotations (Removed due to compatibility issues with the current version)
    // annotations: [],
  };

  return (
    <Card className="chart-card" bordered={false}>
      <div className="chart-header">
        <Title level={4} style={{ margin: 0 }}>Paiements vs Charges</Title>
        <Text type="secondary">Last 6 months</Text>
      </div>
      <div className="chart-container">
        {/* @ts-ignore: type definition conflicts sometimes occur in plot versions */}
        <Area {...config} />
      </div>
    </Card>
  );
};

export default PaymentChargeChart;
