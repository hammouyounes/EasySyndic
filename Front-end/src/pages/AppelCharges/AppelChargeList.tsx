import React from 'react';
import { Table, Card, Tag } from 'antd';
import { useGetAppelChargesQuery } from '../../features/api/apiSlice';
import { FileTextOutlined } from '@ant-design/icons';

const AppelChargeList: React.FC = () => {
  const { data: appelCharges, isLoading } = useGetAppelChargesQuery({});

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { 
      title: 'Charge', 
      key: 'charge',
      render: (_: any, record: any) => <b>{record.charge?.type}</b> 
    },
    { 
      title: 'Appartement', 
      key: 'appartement',
      render: (_: any, record: any) => (
        <span>
          {record.appartement?.numero} <small>({record.appartement?.immeuble?.nom})</small>
        </span>
      )
    },
    { 
      title: 'Montant à payer', 
      dataIndex: 'total', 
      key: 'total',
      render: (amount: number) => <Tag color="blue">{amount?.toFixed(2)} MAD</Tag>
    },
    { 
      title: 'Statut', 
      key: 'status',
      render: (_: any, record: any) => {
          const color = record.status?.label === 'PAYÉ' ? 'green' : record.status?.label === 'EN_ATTENTE' ? 'orange' : 'red';
          return <Tag color={color}>{record.status?.label}</Tag>;
      }
    },
    { 
      title: 'Date Émission', 
      dataIndex: 'dateEmission', 
      key: 'dateEmission',
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ];

  return (
    <Card title="Appels de Fonds (Paiements)" extra={<FileTextOutlined />}>
      <Table 
        columns={columns} 
        dataSource={appelCharges} 
        rowKey="id" 
        loading={isLoading} 
      />
    </Card>
  );
};

export default AppelChargeList;
