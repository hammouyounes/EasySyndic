import React, { useState } from 'react';
import { Table, Button, Card, Tag, Space } from 'antd';
import { PlusOutlined, AppstoreOutlined } from '@ant-design/icons';

// Define the Shape of your data
interface Apartment {
  id: number;
  etage: number;
  numero: number;
  surface: number;
  immeuble_id: number;
}

const ApartmentList: React.FC = () => {
  // Mock Data
  const [data] = useState<Apartment[]>([
    { id: 1, etage: 1, numero: 101, surface: 85, immeuble_id: 1 },
    { id: 2, etage: 1, numero: 102, surface: 90, immeuble_id: 1 },
    { id: 3, etage: 2, numero: 201, surface: 100, immeuble_id: 2 },
  ]);

  // Define Columns
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { 
      title: 'Numéro', dataIndex: 'numero', key: 'numero',
      render: (text: number) => <Space><AppstoreOutlined /> <b>{text}</b></Space>
    },
    { 
      title: 'Étage', dataIndex: 'etage', key: 'etage',
      render: (etage: number) => <Tag color="cyan">{etage} Étage</Tag>
    },
    { 
      title: 'Surface (m²)', dataIndex: 'surface', key: 'surface',
      render: (surface: number) => <span>{surface} m²</span>
    },
    { title: 'ID Immeuble', dataIndex: 'immeuble_id', key: 'immeuble_id' },
  ];

  return (
    <Card title="Gestion des Appartements" extra={<Button type="primary" icon={<PlusOutlined />}>Ajouter</Button>}>
      <Table columns={columns} dataSource={data} rowKey="id" />
    </Card>
  );
};

export default ApartmentList;
