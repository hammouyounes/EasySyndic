import React, { useState } from 'react';
import { Table, Button, Card, Tag, Space } from 'antd';
import { PlusOutlined, HomeOutlined } from '@ant-design/icons';

interface Building {
  id: number;
  nom: string;
  adress: string;
  nombre_appartement: number;
}

const BuildingList: React.FC = () => {
  const [data] = useState<Building[]>([
    { id: 1, nom: 'Residence Al-Yassmine', adress: '12 Av Mohammed V', nombre_appartement: 5 },
    { id: 2, nom: 'Tour Hassan', adress: '45 Rue de Paris', nombre_appartement: 8 },
    { id: 3, nom: 'Ocean View', adress: 'Corniche Road', nombre_appartement: 3 },
  ]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { 
      title: 'Nom', dataIndex: 'nom', key: 'nom', 
      render: (text: string) => <Space><HomeOutlined /> <b>{text}</b></Space> 
    },
    { title: 'Adresse', dataIndex: 'adress', key: 'adress' },
    { 
      title: 'Appartements', dataIndex: 'nombre_appartement', key: 'nombre_appartement',
      render: (count: number) => <Tag color="blue">{count} Appartements</Tag>
    },
  ];

  return (
    <Card title="Gestion des Bâtiments" extra={<Button type="primary" icon={<PlusOutlined />}>Ajouter</Button>}>
      <Table columns={columns} dataSource={data} rowKey="id" />
    </Card>
  );
};

export default BuildingList;
