import React, { useMemo } from 'react';
import { Row, Col, Typography, Card, Spin, Table, Tag } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  TeamOutlined,
  ShopOutlined,
  WalletOutlined,
  HistoryOutlined,
  UserOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { Select, Button, message, Avatar, List } from 'antd';
import { IncomeExpenseChart } from '../../../components/Charts/IncomeExpenseChart';
import { PaymentMethodChart } from '../../../components/Charts/PaymentMethodChart';
import {
  useGetBuildingsQuery,
  useGetApartmentsQuery,
  useGetAppelChargesQuery,
  useGetPaiementsQuery,
  useGetUsersQuery,
  useGetChargesQuery,
  useGetActivityLogsQuery
} from '../../../features/api/apiSlice';

import './DashboardStats.css';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  const isSuperAdmin = currentUser?.role === 'SUPERADMIN';


  // Fetch data
  const { data: buildings = [], isLoading: loadingBuildings } = useGetBuildingsQuery({});
  const { data: apartments = [], isLoading: loadingApartments } = useGetApartmentsQuery({});
  const { data: appelCharges = [], isLoading: loadingAppelCharges } = useGetAppelChargesQuery({});
  const { data: paiements = [], isLoading: loadingPaiements } = useGetPaiementsQuery({});
  const { data: users = [], isLoading: loadingUsers } = useGetUsersQuery({});
  const { data: charges = [], isLoading: loadingCharges } = useGetChargesQuery({});
  const { data: activities = [], isLoading: loadingActivities } = useGetActivityLogsQuery(undefined, {
    skip: !isSuperAdmin
  });

  const isLoading = loadingBuildings || loadingApartments || loadingAppelCharges || loadingPaiements || loadingUsers || loadingCharges || (isSuperAdmin && loadingActivities);

  // ─── SuperAdmin Logic ───
  const superAdminData = useMemo(() => {
    if (!isSuperAdmin) return null;

    const syndics = users.filter((u: any) => u.role === 'ADMIN');
    
    // Map syndics to their stats
    const syndicStats = syndics.map((s: any) => {
      const syndicBuildings = buildings.filter((b: any) => b.syndic?.id === s.id);
      const buildingIds = new Set(syndicBuildings.map((b: any) => b.id));
      const syndicCharges = charges.filter((c: any) => buildingIds.has(c.immeuble?.id));
      
      return {
        key: s.id,
        name: `${s.prenom} ${s.nom}`,
        email: s.email,
        buildingCount: syndicBuildings.length,
        chargeCount: syndicCharges.length,
        active: s.active
      };
    });

    // Chart Data: Buildings per Syndic
    const syndicChartData = syndicStats.map((s: any) => ({
      name: s.name.split(' ')[0],
      buildings: s.buildingCount,
      charges: s.chargeCount
    }));

    return {
      syndicsCount: syndics.length,
      totalBuildings: buildings.length,
      totalCharges: charges.length,
      syndicStats,
      syndicChartData
    };
  }, [isSuperAdmin, users, buildings, charges]);

  // ─── Normal Admin (Syndic) Logic ───
  const { stats, recentActivities, chartData, paymentMethodData } = useMemo(() => {
    if (isSuperAdmin) return { stats: {}, recentActivities: [], chartData: [], paymentMethodData: [] };

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthRevenue = paiements
      .filter((p: any) => {
        const pDate = new Date(p.datePaiement);
        return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
      })
      .reduce((sum: number, p: any) => sum + p.montant, 0);

    const outstandingDebt = appelCharges
      .filter((ac: any) => ac.status?.label !== 'PAYÉ')
      .reduce((sum: number, ac: any) => sum + ac.total, 0);

    const activitiesList = [
      ...paiements.map((p: any) => ({
        id: `p-${p.id}`,
        type: 'PAYMENT',
        description: `Paiement reçu de ${p.appartement?.proprietaire?.nom || 'Inconnu'}`,
        amount: p.montant,
        date: p.datePaiement,
      })),
      ...appelCharges.map((ac: any) => ({
        id: `ac-${ac.id}`,
        type: 'APPEL',
        description: `Appel de fonds: ${ac.charge?.type || 'Charge'}`,
        amount: ac.total,
        date: ac.dateEmission,
      }))
    ];

    const sortedActivities = activitiesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    const today = new Date();
    const last4Months = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      last4Months.push({
        monthName: months[d.getMonth()],
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        key: `${d.getFullYear()}-${d.getMonth()}`
      });
    }

    const aggregatedChartData = last4Months.map(m => {
      const income = paiements
        .filter((p: any) => {
          const d = new Date(p.datePaiement);
          return d.getMonth() === m.monthIndex && d.getFullYear() === m.year;
        })
        .reduce((sum: number, p: any) => sum + p.montant, 0);

      const expense = appelCharges
        .filter((ac: any) => {
          const d = new Date(ac.dateEmission);
          return d.getMonth() === m.monthIndex && d.getFullYear() === m.year;
        })
        .reduce((sum: number, ac: any) => sum + ac.total, 0);

      return { month: m.monthName, income, expense };
    });

    const methodsMapAmount: Record<string, number> = {};
    paiements.forEach((p: any) => {
      let method = p.modePaiement || 'Inconnu';
      if (method === 'ESPECE') method = 'Espèces';
      else if (method === 'VIREMENT') method = 'Virement';
      else if (method === 'CHEQUE') method = 'Chèque';
      methodsMapAmount[method] = (methodsMapAmount[method] || 0) + p.montant;
    });

    const paymentMethodData = Object.keys(methodsMapAmount).map(key => ({
      name: key,
      value: methodsMapAmount[key]
    }));

    return {
      stats: {
        revenue: currentMonthRevenue,
        debt: outstandingDebt,
        buildingCount: buildings.length,
        apartmentCount: apartments.length,
      },
      recentActivities: sortedActivities,
      chartData: aggregatedChartData,
      paymentMethodData
    };
  }, [isSuperAdmin, buildings, apartments, appelCharges, paiements]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Chargement des données..." />
      </div>
    );
  }

  if (isSuperAdmin && superAdminData) {
    return (
      <div style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>Tableau de Bord SuperAdmin</Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: '16px', borderLeft: '6px solid #8b5cf6' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TeamOutlined style={{ fontSize: '32px', color: '#8b5cf6', marginRight: '16px' }} />
                <div>
                  <Text type="secondary">Total Syndics</Text>
                  <Title level={3} style={{ margin: 0 }}>{superAdminData.syndicsCount}</Title>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: '16px', borderLeft: '6px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ShopOutlined style={{ fontSize: '32px', color: '#3b82f6', marginRight: '16px' }} />
                <div>
                  <Text type="secondary">Total Immeubles</Text>
                  <Title level={3} style={{ margin: 0 }}>{superAdminData.totalBuildings}</Title>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: '16px', borderLeft: '6px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <WalletOutlined style={{ fontSize: '32px', color: '#10b981', marginRight: '16px' }} />
                <div>
                  <Text type="secondary">Total Charges</Text>
                  <Title level={3} style={{ margin: 0 }}>{superAdminData.totalCharges}</Title>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
          <Col xs={24} lg={16}>
            <Card title="Performance des Syndics (Immeubles & Charges)" style={{ borderRadius: '16px' }}>
              <div style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
                 <Tag color="blue">Immeubles</Tag>
                 <Tag color="cyan">Charges</Tag>
              </div>
              <Table 
                dataSource={superAdminData.syndicStats} 
                pagination={false}
                size="small"
                columns={[
                  { title: 'Syndic', dataIndex: 'name', key: 'name' },
                  { title: 'Immeubles', dataIndex: 'buildingCount', key: 'buildingCount' },
                  { title: 'Charges', dataIndex: 'chargeCount', key: 'chargeCount' },
                  { title: 'Progression', key: 'progress', render: (_, record: any) => (
                    <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                       <div style={{ width: `${(record.buildingCount / (superAdminData.totalBuildings || 1)) * 100}%`, background: '#3b82f6' }}></div>
                       <div style={{ width: `${(record.chargeCount / (superAdminData.totalCharges || 1)) * 100}%`, background: '#06b6d4', opacity: 0.6 }}></div>
                    </div>
                  )},
                  { title: 'Statut', dataIndex: 'active', key: 'active', render: (active) => (
                    <Tag color={active ? 'green' : 'red'}>{active ? 'Actif' : 'Inactif'}</Tag>
                  )},
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card 
              title={<span><HistoryOutlined /> Activités Récentes</span>} 
              style={{ borderRadius: '16px', height: '100%' }}
              styles={{ body: { padding: '0 12px' } }}
            >
              {activities?.slice(0, 8).map((log: any) => (
                <div key={log.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong style={{ fontSize: '13px' }}>{log.action} {log.targetType}</Text>
                      <Text type="secondary" style={{ fontSize: '11px' }}>{new Date(log.timestamp).toLocaleTimeString()}</Text>
                   </div>
                   <div style={{ fontSize: '12px', color: '#666' }}>{log.description}</div>
                   <div style={{ fontSize: '11px', color: '#999' }}>Par: {log.performedBy}</div>
                </div>
              ))}
              {(!activities || activities.length === 0) && <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Aucune activité récente</div>}
            </Card>
          </Col>
        </Row>

      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Tableau de Bord Syndic</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={14}>
          <div className="stats-container">
            <div className="stat-card purple">
              <div className="stat-card-header">
                <div className="stat-icon">💰</div>
                <div className="progress-circle" style={{ '--percent': 70, '--color': '#6366f1' } as React.CSSProperties}>
                  <span>+12%</span>
                </div>
              </div>
              <div className="card-body">
                <p className="stat-label">Revenus du Mois</p>
                <h2 className="stat-value">{Number(stats.revenue || 0).toFixed(2)} <span className="stat-trend" style={{ fontSize: '14px' }}>MAD</span></h2>
                <p className="stat-subtext">Encaissés ce mois-ci</p>
              </div>
            </div>

            <div className="stat-card blue">
              <div className="stat-card-header">
                <div className="stat-icon">⚠️</div>
                <div className="progress-circle" style={{ '--percent': 45, '--color': '#38bdf8' } as React.CSSProperties}>
                  <span>Pending</span>
                </div>
              </div>
              <div className="card-body">
                <p className="stat-label">Dettes Impayées</p>
                <h2 className="stat-value">{Number(stats.debt || 0).toFixed(2)} <span className="stat-trend" style={{ fontSize: '14px' }}>MAD</span></h2>
                <p className="stat-subtext">Reste à payer</p>
              </div>
            </div>

            <div className="stat-card dark-purple">
              <div className="stat-card-header">
                <div className="stat-icon">🏢</div>
                <div className="progress-circle" style={{ '--percent': 100, '--color': '#8b5cf6' } as React.CSSProperties}>
                  <span>Total</span>
                </div>
              </div>
              <div className="card-body">
                <p className="stat-label">Immeubles</p>
                <h2 className="stat-value">{stats.buildingCount}</h2>
                <p className="stat-subtext">Gérés actuellement</p>
              </div>
            </div>

            <div className="stat-card green">
              <div className="stat-card-header">
                <div className="stat-icon">🏠</div>
                <div className="progress-circle" style={{ '--percent': 85, '--color': '#22c55e' } as React.CSSProperties}>
                  <span>Active</span>
                </div>
              </div>
              <div className="card-body">
                <p className="stat-label">Appartements</p>
                <h2 className="stat-value">{stats.apartmentCount}</h2>
                <p className="stat-subtext">Enregistrés</p>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} xl={10} style={{ display: 'flex' }}>
          <Card
            title={<span><ClockCircleOutlined /> Activités Gestion</span>}
            variant="borderless"
            className="activities-card"
            style={{ width: '100%', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: '0 12px' } }}
          >
            <div>
              {recentActivities.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    backgroundColor: item.type === 'PAYMENT' ? '#f6ffed' : '#e6f7ff',
                    color: item.type === 'PAYMENT' ? '#52c41a' : '#1890ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginRight: 12, flexShrink: 0, fontSize: 14
                  }}>
                    {item.type === 'PAYMENT' ? <CheckCircleOutlined /> : <SyncOutlined />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ fontSize: '13px', display: 'block' }}>{item.description.slice(0, 30)}...</Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>{new Date(item.date).toLocaleDateString()}</Text>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: 8 }}>
                    <Text strong style={{ fontSize: '12px', color: item.type === 'PAYMENT' ? '#52c41a' : '#faad14' }}>
                      {item.type === 'PAYMENT' ? '+' : ''}{Number(item.amount).toFixed(2)}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <IncomeExpenseChart data={chartData} />
        </Col>
        <Col xs={24} lg={8}>
          <PaymentMethodChart data={paymentMethodData} />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

