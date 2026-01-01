// import React, { useState } from 'react';
// import { Table, Button, Card, Tag, Space } from 'antd';
// import { PlusOutlined, HomeOutlined } from '@ant-design/icons';

// // 1. Define the Shape of your data
// interface Building {
//   id: number;
//   name: string;
//   address: string;
//   floors: number;
// }

// const BuildingList: React.FC = () => {
//   // 2. Create FAKE Data (This replaces the Database for now)
//   const [data, setData] = useState<Building[]>([
//     { id: 1, name: 'Residence Al-Yassmine', address: '12 Av Mohammed V', floors: 5 },
//     { id: 2, name: 'Tour Hassan', address: '45 Rue de Paris', floors: 8 },
//     { id: 3, name: 'Ocean View', address: 'Corniche Road', floors: 3 },
//   ]);

//   // 3. Define Columns
//   const columns = [
//     { title: 'ID', dataIndex: 'id', key: 'id' },
//     { 
//       title: 'Name', dataIndex: 'name', key: 'name', 
//       render: (text: string) => <Space><HomeOutlined /> <b>{text}</b></Space> 
//     },
//     { title: 'Address', dataIndex: 'address', key: 'address' },
//     { 
//       title: 'Floors', dataIndex: 'floors', key: 'floors',
//       render: (floors: number) => <Tag color="blue">{floors} Floors</Tag>
//     },
//   ];

//   return (
//     <Card title="My Buildings" extra={<Button type="primary" icon={<PlusOutlined />}>Add New</Button>}>
//       <Table columns={columns} dataSource={data} rowKey="id" />
//     </Card>
//   );
// };

// export default BuildingList;
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
