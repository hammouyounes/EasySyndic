import React, { useState } from 'react';
import { Table, Button, Card, Tag, Space } from 'antd';
import { PlusOutlined, AppstoreOutlined } from '@ant-design/icons';

const ApartmentList = () => {
  const [data] = useState([
    { id: 1, number: 'A1', floor: 1, building: 'Residence Al-Yassmine', owner: 'M. Ahmed' },
    { id: 2, number: 'B3', floor: 2, building: 'Tour Hassan', owner: 'Mme. Fatima' },
    { id: 3, number: 'C5', floor: 3, building: 'Ocean View', owner: 'M. Karim' },
  ]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { 
      title: 'Numéro', dataIndex: 'number', key: 'number', 
      render: (text) => <Space><AppstoreOutlined /> <b>{text}</b></Space> 
    },
    { title: 'Étage', dataIndex: 'floor', key: 'floor' },
    { title: 'Bâtiment', dataIndex: 'building', key: 'building' },
    { 
        title: 'Propriétaire', dataIndex: 'owner', key: 'owner',
        render: (text) => <Tag color="green">{text}</Tag>
    },
  ];

  return (
    <Card title="Gestion des Appartements" extra={<Button type="primary" icon={<PlusOutlined />}>Ajouter</Button>}>
      <Table columns={columns} dataSource={data} rowKey="id" />
    </Card>
  );
};

export default ApartmentList;
