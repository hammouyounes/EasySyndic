import React, { useMemo } from 'react';
import { Row, Col, Typography, Card, Spin, List, Avatar } from 'antd';
import { 
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { IncomeExpenseChart } from '../../../components/Charts/IncomeExpenseChart';
import { PaymentMethodChart } from '../../../components/Charts/PaymentMethodChart';
import { 
  useGetBuildingsQuery, 
  useGetApartmentsQuery, 
  useGetAppelChargesQuery, 
  useGetPaiementsQuery 
} from '../../../features/api/apiSlice';

import './DashboardStats.css';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  // Fetch data
  const { data: buildings = [], isLoading: loadingBuildings } = useGetBuildingsQuery({});
  const { data: apartments = [], isLoading: loadingApartments } = useGetApartmentsQuery({});
  const { data: appelCharges = [], isLoading: loadingAppelCharges } = useGetAppelChargesQuery({});
  const { data: paiements = [], isLoading: loadingPaiements } = useGetPaiementsQuery({});

  const isLoading = loadingBuildings || loadingApartments || loadingAppelCharges || loadingPaiements;

  // Calculate Statistics & Recent Activities
  const { stats, recentActivities, chartData, paymentMethodData } = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // 1. Stats Calculations
    const currentMonthRevenue = paiements
      .filter((p: any) => {
        const pDate = new Date(p.datePaiement);
        return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
      })
      .reduce((sum: number, p: any) => sum + p.montant, 0);

    const outstandingDebt = appelCharges
      .filter((ac: any) => ac.status?.label !== 'PAYÉ')
      .reduce((sum: number, ac: any) => sum + ac.total, 0);

    // 2. Recent Activities (Merge Payments & New Charges/Appels)
    const activities = [
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

    // Sort by date desc and take top 5
    const sortedActivities = activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    // 3. Chart Data Aggregation (Last 4 Months)
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    const today = new Date();
    const lastMonthsLen = 4; // User requested 4 months
    const last4Months = [];
    for (let i = lastMonthsLen - 1; i >= 0; i--) {
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

    // 4. Payment Method Distribution
    const methodsMapAmount: Record<string, number> = {};
     paiements.forEach((p: any) => {
        let method = p.modePaiement || 'Inconnu';
        // Map to display names
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
  }, [buildings, apartments, appelCharges, paiements]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Chargement des données..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Tableau de Bord</Title>
      
      {/* Top Section: Stats + Activities */}
      <Row gutter={[24, 24]}>
        {/* Left Column: Statistics Cards (Now 2x2 grid) */}
        <Col xs={24} xl={14}>
          <div className="stats-container">
            {/* Card 1: Revenue (Purple) */}
            <div className="stat-card purple">
              <div className="stat-card-header">
                <div className="stat-icon">💰</div>
                <div className="progress-circle" style={{ '--percent': 70, '--color': '#6366f1' } as React.CSSProperties}>
                  <span>+12%</span>
                </div>
              </div>
              <div className="card-body">
                <p className="stat-label">Revenus du Mois</p>
                <h2 className="stat-value">{Number(stats.revenue).toFixed(2)} <span className="stat-trend" style={{fontSize: '14px'}}>MAD</span></h2>
                <p className="stat-subtext">Encaissés ce mois-ci</p>
              </div>
            </div>

            {/* Card 2: Debt (Blue) */}
            <div className="stat-card blue">
              <div className="stat-card-header">
                <div className="stat-icon">⚠️</div>
                <div className="progress-circle" style={{ '--percent': 45, '--color': '#38bdf8' } as React.CSSProperties}>
                  <span>Pending</span>
                </div>
              </div>
              <div className="card-body">
                <p className="stat-label">Dettes Impayées</p>
                <h2 className="stat-value">{Number(stats.debt).toFixed(2)} <span className="stat-trend" style={{fontSize: '14px'}}>MAD</span></h2>
                <p className="stat-subtext">Reste à payer</p>
              </div>
            </div>

            {/* Card 3: Buildings (Dark Purple) */}
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

            {/* Card 4: Apartments (Green) */}
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

        {/* Right Column: Recent Activities Table */}
        <Col xs={24} xl={10} style={{ display: 'flex' }}>
          <Card 
            title={<span><ClockCircleOutlined /> Activités Récentes</span>} 
            bordered={false} 
            className="activities-card"
            style={{ width: '100%', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '0 12px' }}
          >
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={item.type === 'PAYMENT' ? <CheckCircleOutlined /> : <SyncOutlined />} 
                        style={{ backgroundColor: item.type === 'PAYMENT' ? '#f6ffed' : '#e6f7ff', color: item.type === 'PAYMENT' ? '#52c41a' : '#1890ff' }}
                        size="small"
                      />
                    }
                    title={<Text strong style={{ fontSize: '13px' }}>{item.description.slice(0, 30)}...</Text>}
                    description={<Text type="secondary" style={{ fontSize: '11px' }}>{new Date(item.date).toLocaleDateString()}</Text>}
                  />
                  <div style={{ textAlign: 'right' }}>
                    <Text strong style={{ fontSize: '12px', color: item.type === 'PAYMENT' ? '#52c41a' : '#faad14' }}>
                      {item.type === 'PAYMENT' ? '+' : ''}{Number(item.amount).toFixed(2)}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
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
