// import React from 'react';
// import { Card, Row, Col, Statistic, Table } from 'antd';
// import { WalletOutlined, HomeOutlined, CheckCircleOutlined } from '@ant-design/icons';

import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Spin, Empty } from 'antd';
import { WalletOutlined, HomeOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useGetApartmentsQuery, useGetAppelChargesQuery } from '../../features/api/apiSlice';

const ProprietaireDashboard: React.FC = () => {
  // 1. Get Logged-in User
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // 2. Fetch Data
  const { data: allApartments, isLoading: loadingApartments } = useGetApartmentsQuery({});
  const { data: allAppelCharges, isLoading: loadingCharges } = useGetAppelChargesQuery({});

  // 3. Filter Data for Current User
  const myApartments = useMemo(() => {
    if (!allApartments || !user) return [];
    return allApartments.filter((appt: any) => appt.proprietaire?.id === user.id);
  }, [allApartments, user]);

  const myCharges = useMemo(() => {
    if (!allAppelCharges || !myApartments.length) return [];
    const myApartmentIds = myApartments.map((a: any) => a.id);
    return allAppelCharges.filter((c: any) => myApartmentIds.includes(c.appartement?.id));
  }, [allAppelCharges, myApartments]);

  // 4. Calculate Statistics
  const totalToPay = useMemo(() => {
    return myCharges
      .filter((c: any) => c.status?.label !== 'PAYÉ')
      .reduce((sum: number, c: any) => sum + (c.total || 0), 0);
  }, [myCharges]);

  const totalPaid = useMemo(() => {
    return myCharges
      .filter((c: any) => c.status?.label === 'PAYÉ')
      .reduce((sum: number, c: any) => sum + (c.total || 0), 0);
  }, [myCharges]);

  // Columns for Apartments Table
  const apartmentColumns = [
    { title: 'Numéro', dataIndex: 'numero', key: 'numero', render: (text: string) => <b>{text}</b> },
    { title: 'Immeuble', dataIndex: ['immeuble', 'nom'], key: 'immeuble' },
    { title: 'Étage', dataIndex: 'etage', key: 'etage' },
    { title: 'Surface', dataIndex: 'surface', key: 'surface', render: (val: number) => `${val} m²` },
  ];

  // Columns for Charges/Payments Table
  const chargeColumns = [
    { title: 'Appartement', dataIndex: ['appartement', 'numero'], key: 'appt' },
    { title: 'Type de Charge', dataIndex: ['charge', 'type'], key: 'type' },
    { 
      title: 'Montant', 
      dataIndex: 'total', 
      key: 'total',
      render: (amount: number) => <Tag color="blue">{amount?.toFixed(2)} DH</Tag>
    },
    { 
      title: 'Date', 
      dataIndex: 'dateEmission', 
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    { 
      title: 'Statut', 
      key: 'status',
      render: (_: any, record: any) => {
        const label = record.status?.label;
        const color = label === 'PAYÉ' ? 'green' : label === 'EN_ATTENTE' ? 'orange' : 'red';
        return <Tag color={color}>{label}</Tag>;
      }
    },
  ];

  if (loadingApartments || loadingCharges) {
    return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;
  }

  if (!user) {
    return <Empty description="Utilisateur non identifié" />;
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Bienvenue, {user.nom} {user.prenom}</h1>
      
      {/* Top Statistics Cards */}
      <Row gutter={[24, 24]}>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic 
              title="Mes Appartements" 
              value={myApartments.length} 
              prefix={<HomeOutlined />} 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic 
              title="Total Payé" 
              value={totalPaid} 
              precision={2}
              suffix="DH" 
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} 
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic 
              title="Reste à Payer" 
              value={totalToPay} 
              precision={2}
              suffix="DH" 
              prefix={<WalletOutlined style={{ color: '#f5222d' }} />} 
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Areas */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        
        {/* Left Column: Apartments List */}
        <Col xs={24} lg={10}>
          <Card title="Mes Appartements" bordered={false} className="criclebox">
             <Table 
              dataSource={myApartments} 
              columns={apartmentColumns} 
              pagination={false}
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>

        {/* Right Column: Charges/Payments List */}
        <Col xs={24} lg={14}>
          <Card title="Mes Charges & Paiements" bordered={false} className="criclebox">
            <Table 
              dataSource={myCharges} 
              columns={chargeColumns} 
              pagination={{ pageSize: 5 }}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProprietaireDashboard;
