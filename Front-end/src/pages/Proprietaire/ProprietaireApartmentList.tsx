import React, { useMemo } from 'react';
import { Card, Table, Tag, Empty, Spin } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useGetApartmentsQuery } from '../../features/api/apiSlice';

const ProprietaireApartmentList: React.FC = () => {
  // 1. Get Logged-in User
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // 2. Fetch Data
  const { data: allApartments, isLoading } = useGetApartmentsQuery({});

  // 3. Filter Data
  const myApartments = useMemo(() => {
    if (!allApartments || !user) return [];
    return allApartments.filter((appt: any) => appt.proprietaire?.id === user.id);
  }, [allApartments, user]);

  const columns = [
    { 
      title: 'Numéro', 
      dataIndex: 'numero', 
      key: 'numero', 
      render: (text: string) => <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}><HomeOutlined style={{ marginRight: 8 }} />{text}</div> 
    },
    { 
      title: 'Immeuble', 
      dataIndex: ['immeuble', 'nom'], 
      key: 'immeuble' 
    },
    { 
      title: 'Étage', 
      dataIndex: 'etage', 
      key: 'etage',
      render: (val: number) => <Tag color="blue">{val === 0 ? 'RDC' : `${val} ème`}</Tag>
    },
    { 
      title: 'Surface', 
      dataIndex: 'surface', 
      key: 'surface', 
      render: (val: number) => <span>{val} m²</span> 
    },
  ];

  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" tip="Chargement de vos appartements..." /></div>;
  }

  if (!user) {
    return <Empty description="Veuillez vous reconnecter" />;
  }

  return (
    <div className="site-layout-content">
      <Card 
        title={`Mes Appartements (${myApartments.length})`} 
        bordered={false} 
        style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      >
        <Table 
          dataSource={myApartments} 
          columns={columns} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="Vous n'avez aucun appartement enregistré." /> }}
        />
      </Card>
    </div>
  );
};

export default ProprietaireApartmentList;
