import React, { useMemo } from 'react';
import { Card, Row, Col, Typography, Spin, Empty, List, Avatar, Tag, Table } from 'antd';
import {
  WalletOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useGetApartmentsQuery, useGetAppelChargesQuery } from '../../features/api/apiSlice';
import '../admin/Dashboard/DashboardStats.css'; // Reuse Admin Dashboard CSS

const { Title, Text } = Typography;

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
    return allAppelCharges
      .filter((c: any) => myApartmentIds.includes(c.appartement?.id))
      .sort((a: any, b: any) => new Date(b.dateEmission).getTime() - new Date(a.dateEmission).getTime()); // Sort desc
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

  // Columns for Charges/Payments Table
  const chargeColumns = [
    { title: 'Appartement', dataIndex: ['appartement', 'numero'], key: 'appt', render: (text: string) => <b>{text}</b> },
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
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" description="Chargement des données..." />
      </div>
    );
  }

  if (!user) {
    return <Empty description="Utilisateur non identifié" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>Bonjour, {user.prenom}</Title>
        <Text type="secondary">Voici un aperçu de votre situation financière et immobilière.</Text>
      </div>

      {/* Top Section: Stats Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={24}>
          <div className="stats-container" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {/* Card 1: Total Payé (Purple -> Reusing Admin Style) */}
            <div className="stat-card purple">
              <div className="stat-card-header">
                <div className="stat-icon">✅</div>
                <div className="progress-circle" style={{ '--percent': 100, '--color': '#6366f1' } as React.CSSProperties}>
                  <span>Paid</span>
                </div>
              </div>
              <div className="card-body">
                <p className="stat-label">Total Payé</p>
                <h2 className="stat-value">{totalPaid.toFixed(2)} <span className="stat-trend" style={{ fontSize: '14px' }}>MAD</span></h2>
                <p className="stat-subtext">Depuis le début</p>
              </div>
            </div>

            {/* Card 2: Reste à Payer (Red/Blue Style) */}
            <div className="stat-card blue">
              <div className="stat-card-header">
                <div className="stat-icon">⏳</div>
                <div className="progress-circle" style={{ '--percent': 45, '--color': '#38bdf8' } as React.CSSProperties}>
                  <span>Due</span>
                </div>
              </div>
              <div className="card-body">
                <p className="stat-label">Reste à Payer</p>
                <h2 className="stat-value">{totalToPay.toFixed(2)} <span className="stat-trend" style={{ fontSize: '14px' }}>MAD</span></h2>
                <p className="stat-subtext">Montant dû</p>
              </div>
            </div>

            {/* Card 3: Appartements (Green) */}
            <div className="stat-card green">
              <div className="stat-card-header">
                <div className="stat-icon">🏡</div>
                <div className="progress-circle" style={{ '--percent': 100, '--color': '#22c55e' } as React.CSSProperties}>
                  <span>{myApartments.length}</span>
                </div>
              </div>
              <div className="card-body">
                <p className="stat-label">Mes Biens</p>
                <h2 className="stat-value">{myApartments.length}</h2>
                <p className="stat-subtext">Appartements</p>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Main Content Areas: Recent Transactions/Charges */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={<span><DollarOutlined /> Historique des Charges & Paiements</span>}
            variant="borderless"
            className="criclebox"
            style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
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
