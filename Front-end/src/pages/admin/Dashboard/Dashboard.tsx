import React, { useMemo } from "react";
import { Row, Col, Typography, Card, Spin, Table, Tag } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  TeamOutlined,
  ShopOutlined,
  WalletOutlined,
  HistoryOutlined,
  UserOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Select, Button, message, Avatar, List } from "antd";
import { IncomeExpenseChart } from "../../../components/Charts/IncomeExpenseChart";
import { PaymentMethodChart } from "../../../components/Charts/PaymentMethodChart";
import {
  useGetBuildingsQuery,
  useGetApartmentsQuery,
  useGetAppelChargesQuery,
  useGetPaiementsQuery,
  useGetUsersQuery,
  useGetChargesQuery,
  useGetActivityLogsQuery,
} from "../../../features/api/apiSlice";

import "./DashboardStats.css";

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const userString = localStorage.getItem("user");
  const currentUser = userString ? JSON.parse(userString) : null;
  const isSuperAdmin = currentUser?.role === "SUPERADMIN";

  // Fetch data
  const { data: buildings = [], isLoading: loadingBuildings } =
    useGetBuildingsQuery({});
  const { data: apartments = [], isLoading: loadingApartments } =
    useGetApartmentsQuery({});
  const { data: appelCharges = [], isLoading: loadingAppelCharges } =
    useGetAppelChargesQuery({});
  const { data: paiements = [], isLoading: loadingPaiements } =
    useGetPaiementsQuery({});
  const { data: users = [], isLoading: loadingUsers } = useGetUsersQuery({});
  const { data: charges = [], isLoading: loadingCharges } = useGetChargesQuery(
    {},
  );
  const { data: activities = [], isLoading: loadingActivities } =
    useGetActivityLogsQuery(undefined, {
      skip: !isSuperAdmin,
    });

  const isLoading =
    loadingBuildings ||
    loadingApartments ||
    loadingAppelCharges ||
    loadingPaiements ||
    loadingUsers ||
    loadingCharges ||
    (isSuperAdmin && loadingActivities);

  // ─── SuperAdmin Logic ───
  const superAdminData = useMemo(() => {
    if (!isSuperAdmin) return null;

    const syndics = users.filter((u: any) => u.role === "ADMIN");

    // Map syndics to their stats using real backend data
    const syndicStats = syndics.map((s: any) => {
      const sId = String(s.id);

      // Buildings assigned to this syndic
      const syndicBuildings = buildings.filter(
        (b: any) => b.syndic && String(b.syndic.id) === sId,
      );
      const buildingIds = new Set(
        syndicBuildings.map((b: any) => String(b.id)),
      );

      // Charges for these buildings
      const syndicCharges = charges.filter(
        (c: any) => c.immeuble && buildingIds.has(String(c.immeuble.id)),
      );

      // Apartments for these buildings
      const syndicApartments = apartments.filter(
        (a: any) => a.immeuble && buildingIds.has(String(a.immeuble.id)),
      );
      const apartmentIds = new Set(
        syndicApartments.map((a: any) => String(a.id)),
      );

      // Total charge montant (base charges)
      const totalChargeAmount = syndicCharges.reduce(
        (sum: number, c: any) => sum + (Number(c.montant) || 0),
        0,
      );

      // Distributed calls (AppelCharge)
      const syndicAppelCharges = appelCharges.filter(
        (ac: any) =>
          ac.appartement?.id && apartmentIds.has(String(ac.appartement.id)),
      );
      const totalDistributed = syndicAppelCharges.reduce(
        (sum: number, ac: any) => sum + (Number(ac.total) || 0),
        0,
      );

      // Payments received
      const syndicPaiements = paiements.filter(
        (p: any) =>
          p.appartement?.id && apartmentIds.has(String(p.appartement.id)),
      );
      const totalPaid = syndicPaiements.reduce(
        (sum: number, p: any) => sum + (Number(p.montant) || 0),
        0,
      );

      const collectionRate =
        totalDistributed > 0
          ? Math.round((totalPaid / totalDistributed) * 100)
          : 0;
      const proprietaireIds = new Set(
        syndicApartments
          .filter((a: any) => a.proprietaire?.id)
          .map((a: any) => String(a.proprietaire.id)),
      );

      return {
        key: s.id,
        name: `${s.prenom || ""} ${s.nom || ""}`.trim(),
        email: s.email,
        buildingCount: syndicBuildings.length,
        apartmentCount: syndicApartments.length,
        proprietaireCount: proprietaireIds.size,
        chargeCount: syndicCharges.length,
        totalChargeAmount,
        totalPaid,
        totalDistributed,
        collectionRate,
        active: s.active,
      };
    });

    const totalPaidAll = syndicStats.reduce(
      (sum: number, s: any) => sum + s.totalPaid,
      0,
    );
    const totalDistributedAll = syndicStats.reduce(
      (sum: number, s: any) => sum + s.totalDistributed,
      0,
    );
    const globalCollectionRate =
      totalDistributedAll > 0
        ? Math.round((totalPaidAll / totalDistributedAll) * 100)
        : 0;

    return {
      syndicsCount: syndics.length,
      totalBuildings: buildings.length,
      totalCharges: charges.length,
      totalPaidAll,
      totalDistributedAll,
      globalCollectionRate,
      syndicStats,
    };
  }, [
    isSuperAdmin,
    users,
    buildings,
    charges,
    apartments,
    appelCharges,
    paiements,
  ]);

  // ─── Normal Admin (Syndic) Logic ───
  const { stats, recentActivities, chartData, paymentMethodData } =
    useMemo(() => {
      if (isSuperAdmin)
        return {
          stats: {},
          recentActivities: [],
          chartData: [],
          paymentMethodData: [],
        };

      // Filter data to only this syndic's buildings
      const syndicBuildings = buildings.filter(
        (b: any) => b.syndic?.id === currentUser?.id,
      );
      const syndicBuildingIds = new Set(
        syndicBuildings.map((b: any) => String(b.id)),
      );
      const syndicApartments = apartments.filter(
        (a: any) => a.immeuble && syndicBuildingIds.has(String(a.immeuble.id)),
      );
      const syndicApartmentIds = new Set(
        syndicApartments.map((a: any) => String(a.id)),
      );
      const syndicPaiements = paiements.filter(
        (p: any) =>
          p.appartement?.id && syndicApartmentIds.has(String(p.appartement.id)),
      );
      const syndicAppelCharges = appelCharges.filter(
        (ac: any) =>
          ac.appartement?.id &&
          syndicApartmentIds.has(String(ac.appartement.id)),
      );

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const currentMonthRevenue = syndicPaiements
        .filter((p: any) => {
          const pDate = new Date(p.datePaiement);
          return (
            pDate.getMonth() === currentMonth &&
            pDate.getFullYear() === currentYear
          );
        })
        .reduce((sum: number, p: any) => sum + p.montant, 0);

      const outstandingDebt = syndicAppelCharges
        .filter((ac: any) => ac.status?.label !== "PAYÉ")
        .reduce((sum: number, ac: any) => sum + ac.total, 0);

      const activitiesList = [
        ...syndicPaiements.map((p: any) => ({
          id: `p-${p.id}`,
          type: "PAYMENT",
          description: `Paiement reçu de ${p.appartement?.proprietaire?.nom || "Inconnu"}`,
          amount: p.montant,
          date: p.datePaiement,
        })),
        ...syndicAppelCharges.map((ac: any) => ({
          id: `ac-${ac.id}`,
          type: "APPEL",
          description: `Appel de fonds: ${ac.charge?.type || "Charge"}`,
          amount: ac.total,
          date: ac.dateEmission,
        })),
      ];

      const sortedActivities = activitiesList
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      const months = [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Juin",
        "Juil",
        "Août",
        "Sep",
        "Oct",
        "Nov",
        "Déc",
      ];
      const today = new Date();
      const last4Months = [];
      for (let i = 3; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        last4Months.push({
          monthName: months[d.getMonth()],
          monthIndex: d.getMonth(),
          year: d.getFullYear(),
          key: `${d.getFullYear()}-${d.getMonth()}`,
        });
      }

      const aggregatedChartData = last4Months.map((m) => {
        const income = syndicPaiements
          .filter((p: any) => {
            const d = new Date(p.datePaiement);
            return d.getMonth() === m.monthIndex && d.getFullYear() === m.year;
          })
          .reduce((sum: number, p: any) => sum + p.montant, 0);

        const expense = syndicAppelCharges
          .filter((ac: any) => {
            const d = new Date(ac.dateEmission);
            return d.getMonth() === m.monthIndex && d.getFullYear() === m.year;
          })
          .reduce((sum: number, ac: any) => sum + ac.total, 0);

        return { month: m.monthName, income, expense };
      });

      const methodsMapAmount: Record<string, number> = {};
      syndicPaiements.forEach((p: any) => {
        let method = p.modePaiement || "Inconnu";
        if (method === "ESPECE") method = "Espèces";
        else if (method === "VIREMENT") method = "Virement";
        else if (method === "CHEQUE") method = "Chèque";
        methodsMapAmount[method] = (methodsMapAmount[method] || 0) + p.montant;
      });

      const paymentMethodData = Object.keys(methodsMapAmount).map((key) => ({
        name: key,
        value: methodsMapAmount[key],
      }));

      return {
        stats: {
          revenue: currentMonthRevenue,
          debt: outstandingDebt,
          buildingCount: syndicBuildings.length,
          apartmentCount: syndicApartments.length,
        },
        recentActivities: sortedActivities,
        chartData: aggregatedChartData,
        paymentMethodData,
      };
    }, [
      isSuperAdmin,
      currentUser,
      buildings,
      apartments,
      appelCharges,
      paiements,
    ]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Chargement des données..." />
      </div>
    );
  }

  if (isSuperAdmin && superAdminData) {
    return (
      <div style={{ padding: "24px" }}>
        <Title level={2} style={{ marginBottom: "24px" }}>
          Tableau de Bord SuperAdmin
        </Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <Card
              style={{ borderRadius: "16px", borderLeft: "6px solid #8b5cf6" }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <TeamOutlined
                  style={{
                    fontSize: "32px",
                    color: "#8b5cf6",
                    marginRight: "16px",
                  }}
                />
                <div>
                  <Text type="secondary">Total Syndics</Text>
                  <Title level={3} style={{ margin: 0 }}>
                    {superAdminData.syndicsCount}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{ borderRadius: "16px", borderLeft: "6px solid #3b82f6" }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <ShopOutlined
                  style={{
                    fontSize: "32px",
                    color: "#3b82f6",
                    marginRight: "16px",
                  }}
                />
                <div>
                  <Text type="secondary">Total Immeubles</Text>
                  <Title level={3} style={{ margin: 0 }}>
                    {superAdminData.totalBuildings}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{ borderRadius: "16px", borderLeft: "6px solid #10b981" }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <WalletOutlined
                  style={{
                    fontSize: "32px",
                    color: "#10b981",
                    marginRight: "16px",
                  }}
                />
                <div>
                  <Text type="secondary">Total Charges</Text>
                  <Title level={3} style={{ margin: 0 }}>
                    {superAdminData.totalCharges}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
          <Col xs={24} lg={16}>
            <Card
              title="Performance des Syndics (Immeubles & Charges)"
              style={{ borderRadius: "16px" }}
            >
              <div
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  gap: "16px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Tag color="green">
                  Taux de recouvrement global :{" "}
                  {superAdminData.globalCollectionRate}%
                </Tag>
                <Tag color="blue">
                  Total distribué :{" "}
                  {superAdminData.totalDistributedAll.toFixed(2)} MAD
                </Tag>
                <Tag color="gold">
                  Total payé : {superAdminData.totalPaidAll.toFixed(2)} MAD
                </Tag>
              </div>
              <Table
                dataSource={superAdminData.syndicStats}
                pagination={false}
                size="small"
                scroll={{ x: 800 }}
                columns={[
                  {
                    title: "Syndic",
                    dataIndex: "name",
                    key: "name",
                    fixed: "left" as const,
                    width: 140,
                    render: (name: string, record: any) => (
                      <div>
                        <div style={{ fontWeight: 600 }}>{name}</div>
                        <div style={{ fontSize: "11px", color: "#888" }}>
                          {record.email}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "🏢 Immeubles",
                    dataIndex: "buildingCount",
                    key: "buildingCount",
                    width: 100,
                    align: "center" as const,
                  },
                  {
                    title: "🏠 Apparts",
                    dataIndex: "apartmentCount",
                    key: "apartmentCount",
                    width: 90,
                    align: "center" as const,
                  },
                  {
                    title: "👥 Propriét.",
                    dataIndex: "proprietaireCount",
                    key: "proprietaireCount",
                    width: 90,
                    align: "center" as const,
                  },
                  {
                    title: "💰 Charges (MAD)",
                    key: "totalChargeAmount",
                    width: 130,
                    align: "right" as const,
                    render: (_: any, record: any) => (
                      <span style={{ fontWeight: 500 }}>
                        {record.totalChargeAmount.toFixed(2)}
                      </span>
                    ),
                  },
                  {
                    title: "✅ Payé (MAD)",
                    key: "totalPaid",
                    width: 120,
                    align: "right" as const,
                    render: (_: any, record: any) => (
                      <span style={{ fontWeight: 500, color: "#52c41a" }}>
                        {record.totalPaid.toFixed(2)}
                      </span>
                    ),
                  },
                  {
                    title: "Recouvrement",
                    key: "collectionRate",
                    width: 140,
                    render: (_: any, record: any) => (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color:
                                record.collectionRate >= 70
                                  ? "#52c41a"
                                  : record.collectionRate >= 40
                                    ? "#faad14"
                                    : "#ff4d4f",
                            }}
                          >
                            {record.collectionRate}%
                          </span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "8px",
                            background: "#f0f0f0",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${record.collectionRate}%`,
                              height: "100%",
                              background:
                                record.collectionRate >= 70
                                  ? "#52c41a"
                                  : record.collectionRate >= 40
                                    ? "#faad14"
                                    : "#ff4d4f",
                              borderRadius: "4px",
                              transition: "width 0.5s ease",
                            }}
                          ></div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Statut",
                    dataIndex: "active",
                    key: "active",
                    width: 80,
                    align: "center" as const,
                    render: (active: boolean) => (
                      <Tag color={active ? "green" : "red"}>
                        {active ? "Actif" : "Inactif"}
                      </Tag>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card
              title={
                <span>
                  <HistoryOutlined /> Activités Récentes
                </span>
              }
              style={{ borderRadius: "16px", height: "100%" }}
              styles={{ body: { padding: "0 12px" } }}
            >
              {activities?.slice(0, 8).map((log: any) => (
                <div
                  key={log.id}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text strong style={{ fontSize: "13px" }}>
                      {log.action} {log.targetType}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </Text>
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {log.description}
                  </div>
                  <div style={{ fontSize: "11px", color: "#999" }}>
                    Par: {log.performedBy}
                  </div>
                </div>
              ))}
              {(!activities || activities.length === 0) && (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#999",
                  }}
                >
                  Aucune activité récente
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2} style={{ marginBottom: "24px" }}>
        Tableau de Bord Syndic
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={14}>
          <div className="stats-container">
            <div className="stat-card purple">
              <div className="stat-card-header">
                <div className="stat-icon">💰</div>
                <div
                  className="progress-circle"
                  style={
                    {
                      "--percent": 70,
                      "--color": "#6366f1",
                    } as React.CSSProperties
                  }
                >
                  <span>+12%</span>
                </div>
              </div>
              <div className="card-body">
                <p className="stat-label">Revenus du Mois</p>
                <h2 className="stat-value">
                  {Number(stats.revenue || 0).toFixed(2)}{" "}
                  <span className="stat-trend" style={{ fontSize: "14px" }}>
                    MAD
                  </span>
                </h2>
                <p className="stat-subtext">Encaissés ce mois-ci</p>
              </div>
            </div>

            <div className="stat-card blue">
              <div className="stat-card-header">
                <div className="stat-icon">⚠️</div>
                <div
                  className="progress-circle"
                  style={
                    {
                      "--percent": 45,
                      "--color": "#38bdf8",
                    } as React.CSSProperties
                  }
                >
                  <span>Pending</span>
                </div>
              </div>
              <div className="card-body">
                <p className="stat-label">Dettes Impayées</p>
                <h2 className="stat-value">
                  {Number(stats.debt || 0).toFixed(2)}{" "}
                  <span className="stat-trend" style={{ fontSize: "14px" }}>
                    MAD
                  </span>
                </h2>
                <p className="stat-subtext">Reste à payer</p>
              </div>
            </div>

            <div className="stat-card dark-purple">
              <div className="stat-card-header">
                <div className="stat-icon">🏢</div>
                <div
                  className="progress-circle"
                  style={
                    {
                      "--percent": 100,
                      "--color": "#8b5cf6",
                    } as React.CSSProperties
                  }
                >
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
                <div
                  className="progress-circle"
                  style={
                    {
                      "--percent": 85,
                      "--color": "#22c55e",
                    } as React.CSSProperties
                  }
                >
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

        <Col xs={24} xl={10} style={{ display: "flex" }}>
          <Card
            title={
              <span>
                <ClockCircleOutlined /> Activités Gestion
              </span>
            }
            variant="borderless"
            className="activities-card"
            style={{
              width: "100%",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
            styles={{ body: { padding: "0 12px" } }}
          >
            <div>
              {recentActivities.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor:
                        item.type === "PAYMENT" ? "#f6ffed" : "#e6f7ff",
                      color: item.type === "PAYMENT" ? "#52c41a" : "#1890ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                      flexShrink: 0,
                      fontSize: 14,
                    }}
                  >
                    {item.type === "PAYMENT" ? (
                      <CheckCircleOutlined />
                    ) : (
                      <SyncOutlined />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ fontSize: "13px", display: "block" }}>
                      {item.description.slice(0, 30)}...
                    </Text>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                  </div>
                  <div style={{ textAlign: "right", marginLeft: 8 }}>
                    <Text
                      strong
                      style={{
                        fontSize: "12px",
                        color: item.type === "PAYMENT" ? "#52c41a" : "#faad14",
                      }}
                    >
                      {item.type === "PAYMENT" ? "+" : ""}
                      {Number(item.amount).toFixed(2)}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
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
