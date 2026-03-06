import React, { useMemo, useState } from 'react';
import { Card, Table, Tag, Empty, Spin, Typography, Row, Col, Statistic, Button, Modal, Descriptions, Input, DatePicker, Select, message, Tooltip } from 'antd';
import {
    WalletOutlined,
    DownloadOutlined,
    EyeOutlined,
    SearchOutlined,
    FilePdfOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useGetPaiementsByProprietaireQuery } from '../../features/api/apiSlice';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ProprietairePaymentHistory: React.FC = () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const { data: payments = [], isLoading, isError } = useGetPaiementsByProprietaireQuery(
        user?.id,
        { skip: !user?.id }
    );

    // ─── State ───
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    // ─── Filtered Data ───
    const filteredPayments = useMemo(() => {
        let filtered = [...payments];

        // Search filter
        if (searchText) {
            const lower = searchText.toLowerCase();
            filtered = filtered.filter((p: any) =>
                p.reference?.toLowerCase().includes(lower) ||
                p.appartement?.numero?.toLowerCase().includes(lower) ||
                p.appartement?.immeuble?.nom?.toLowerCase().includes(lower) ||
                p.modePaiement?.toLowerCase().includes(lower)
            );
        }

        // Status filter
        if (statusFilter) {
            filtered = filtered.filter((p: any) => {
                const status = p.appelCharge?.status?.label || 'PAYÉ';
                return status === statusFilter;
            });
        }

        // Sort by date descending
        filtered.sort((a: any, b: any) => {
            const dateA = a.datePaiement ? new Date(a.datePaiement).getTime() : 0;
            const dateB = b.datePaiement ? new Date(b.datePaiement).getTime() : 0;
            return dateB - dateA;
        });

        return filtered;
    }, [payments, searchText, statusFilter]);

    // ─── Statistics ───
    const stats = useMemo(() => {
        const total = payments.reduce((sum: number, p: any) => sum + (p.montant || 0), 0);
        const count = payments.length;
        const thisMonth = payments.filter((p: any) => {
            if (!p.datePaiement) return false;
            const d = new Date(p.datePaiement);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const thisMonthTotal = thisMonth.reduce((sum: number, p: any) => sum + (p.montant || 0), 0);
        return { total, count, thisMonthTotal, thisMonthCount: thisMonth.length };
    }, [payments]);

    // ─── PDF Download ───
    const handleDownloadPDF = async (paiementId: number) => {
        setDownloadingId(paiementId);
        try {
            const response = await fetch(`/api/quittances/paiement/${paiementId}`);
            if (!response.ok) throw new Error('PDF generation failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Recu_Paiement_${paiementId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            message.success('Quittance téléchargée avec succès !');
        } catch (error) {
            console.error('Download error:', error);
            message.error('Erreur lors du téléchargement de la quittance.');
        } finally {
            setDownloadingId(null);
        }
    };

    // ─── View Details ───
    const showPaymentDetail = (payment: any) => {
        setSelectedPayment(payment);
        setDetailModalVisible(true);
    };

    // ─── Table Columns ───
    const columns = [
        {
            title: 'Référence',
            dataIndex: 'reference',
            key: 'reference',
            render: (text: string, record: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 14, fontWeight: 600
                    }}>
                        <DollarOutlined />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary, #1B2559)' }}>{text || `PAY-${record.id}`}</div>
                        <div style={{ fontSize: 11, color: '#a0aec0' }}>ID: #{record.id}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'datePaiement',
            key: 'datePaiement',
            sorter: (a: any, b: any) => new Date(a.datePaiement).getTime() - new Date(b.datePaiement).getTime(),
            render: (date: string) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary, #1B2559)' }}>
                    <CalendarOutlined style={{ color: '#a0aec0' }} />
                    {date ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </div>
            ),
        },
        {
            title: 'Montant',
            dataIndex: 'montant',
            key: 'montant',
            sorter: (a: any, b: any) => (a.montant || 0) - (b.montant || 0),
            render: (amount: number) => (
                <span style={{
                    fontWeight: 700, fontSize: '1.05em',
                    color: '#10b981',
                }}>
                    {amount?.toFixed(2)} <span style={{ fontSize: '0.8em', fontWeight: 400 }}>MAD</span>
                </span>
            ),
        },
        {
            title: 'Immeuble',
            key: 'immeuble',
            render: (_: any, record: any) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{record.appartement?.immeuble?.nom || 'N/A'}</div>
                    <div style={{ fontSize: 11, color: '#a0aec0' }}>Appt: {record.appartement?.numero || 'N/A'}</div>
                </div>
            ),
        },
        {
            title: 'Mode',
            dataIndex: 'modePaiement',
            key: 'modePaiement',
            render: (mode: string) => {
                const modeColors: Record<string, string> = {
                    'Espèces': '#f59e0b', 'Virement': '#3b82f6', 'Chèque': '#8b5cf6',
                    'Carte': '#ec4899', 'Cash': '#f59e0b',
                };
                return (
                    <Tag color={modeColors[mode] || '#6b7280'} style={{ borderRadius: 6, fontWeight: 500 }}>
                        {mode || 'N/A'}
                    </Tag>
                );
            },
        },
        {
            title: 'Statut',
            key: 'status',
            render: (_: any, record: any) => {
                const label = record.appelCharge?.status?.label || 'PAYÉ';
                const config: Record<string, { color: string; icon: React.ReactNode }> = {
                    'PAYÉ': { color: 'green', icon: <CheckCircleOutlined /> },
                    'EN_ATTENTE': { color: 'orange', icon: <ClockCircleOutlined /> },
                    'IMPAYÉ': { color: 'red', icon: <ClockCircleOutlined /> },
                    'EN_RETARD': { color: 'red', icon: <ClockCircleOutlined /> },
                };
                const cfg = config[label] || config['PAYÉ'];
                return (
                    <Tag color={cfg.color} icon={cfg.icon} style={{ borderRadius: 6, fontWeight: 500 }}>
                        {label}
                    </Tag>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <Tooltip title="Voir les détails">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => showPaymentDetail(record)}
                            style={{ color: '#3b82f6' }}
                        />
                    </Tooltip>
                    <Tooltip title="Télécharger la quittance PDF">
                        <Button
                            type="text"
                            icon={<FilePdfOutlined />}
                            loading={downloadingId === record.id}
                            onClick={() => handleDownloadPDF(record.id)}
                            style={{ color: '#10b981' }}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    // ─── Loading / Error States ───
    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spin size="large" tip="Chargement de votre historique de paiements..." />
            </div>
        );
    }

    if (!user) {
        return <Empty description="Veuillez vous reconnecter" />;
    }

    return (
        <div style={{ padding: '24px' }}>
            {/* ─── Page Title ─── */}
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>
                    <WalletOutlined style={{ marginRight: 12, color: '#10b981' }} />
                    Historique des Paiements
                </Title>
                <Text type="secondary">Consultez tous vos paiements et téléchargez vos quittances.</Text>
            </div>

            {/* ─── Stats Cards ─── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card
                        style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}
                        styles={{ body: { padding: '20px 24px' } }}
                    >
                        <Statistic
                            title={<span style={{ color: '#a0aec0', fontWeight: 500 }}>Total Payé</span>}
                            value={stats.total}
                            precision={2}
                            suffix="MAD"
                            valueStyle={{ color: '#10b981', fontWeight: 700 }}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card
                        style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}
                        styles={{ body: { padding: '20px 24px' } }}
                    >
                        <Statistic
                            title={<span style={{ color: '#a0aec0', fontWeight: 500 }}>Nombre de Paiements</span>}
                            value={stats.count}
                            valueStyle={{ color: '#3b82f6', fontWeight: 700 }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card
                        style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}
                        styles={{ body: { padding: '20px 24px' } }}
                    >
                        <Statistic
                            title={<span style={{ color: '#a0aec0', fontWeight: 500 }}>Ce Mois-ci</span>}
                            value={stats.thisMonthTotal}
                            precision={2}
                            suffix="MAD"
                            valueStyle={{ color: '#8b5cf6', fontWeight: 700 }}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* ─── Filters ─── */}
            <Card
                style={{ borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}
                styles={{ body: { padding: '16px 24px' } }}
            >
                <Row gutter={[16, 12]} align="middle">
                    <Col xs={24} sm={12} md={10}>
                        <Input
                            placeholder="Rechercher par référence, immeuble, appartement..."
                            prefix={<SearchOutlined style={{ color: '#a0aec0' }} />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            style={{ borderRadius: 10 }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder="Filtrer par statut"
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val)}
                            allowClear
                            style={{ width: '100%', borderRadius: 10 }}
                        >
                            <Option value="PAYÉ">✅ Payé</Option>
                            <Option value="EN_ATTENTE">⏳ En attente</Option>
                            <Option value="IMPAYÉ">❌ Impayé</Option>
                            <Option value="EN_RETARD">⚠️ En retard</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={8} style={{ textAlign: 'right' }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            {filteredPayments.length} paiement{filteredPayments.length > 1 ? 's' : ''} trouvé{filteredPayments.length > 1 ? 's' : ''}
                        </Text>
                    </Col>
                </Row>
            </Card>

            {/* ─── Payments Table ─── */}
            <Card
                bordered={false}
                style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            >
                <Table
                    dataSource={filteredPayments}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        pageSize: 8,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '8', '15', '25'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} paiements`,
                    }}
                    locale={{ emptyText: <Empty description="Aucun paiement trouvé" /> }}
                    style={{ borderRadius: 16 }}
                />
            </Card>

            {/* ─── Detail Modal ─── */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 18,
                        }}>
                            <WalletOutlined />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700 }}>Détails du Paiement</div>
                            <div style={{ fontSize: 12, color: '#a0aec0', fontWeight: 400 }}>
                                {selectedPayment?.reference || `PAY-${selectedPayment?.id}`}
                            </div>
                        </div>
                    </div>
                }
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                width={640}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Fermer
                    </Button>,
                    <Button
                        key="download"
                        type="primary"
                        icon={<DownloadOutlined />}
                        style={{ background: '#10b981', borderColor: '#10b981' }}
                        loading={downloadingId === selectedPayment?.id}
                        onClick={() => selectedPayment && handleDownloadPDF(selectedPayment.id)}
                    >
                        Télécharger la Quittance
                    </Button>,
                ]}
            >
                {selectedPayment && (
                    <div style={{ padding: '8px 0' }}>
                        {/* Amount highlight */}
                        <div style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            borderRadius: 16, padding: '20px 24px',
                            marginBottom: 24, color: '#fff',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontSize: 13, opacity: 0.85 }}>Montant payé</div>
                                <div style={{ fontSize: 32, fontWeight: 800 }}>
                                    {selectedPayment.montant?.toFixed(2)} <span style={{ fontSize: 16, fontWeight: 400 }}>MAD</span>
                                </div>
                            </div>
                            <DollarOutlined style={{ fontSize: 48, opacity: 0.3 }} />
                        </div>

                        <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}
                            labelStyle={{ fontWeight: 600, width: '40%' }}
                        >
                            <Descriptions.Item label="Référence">
                                {selectedPayment.reference || `PAY-${selectedPayment.id}`}
                            </Descriptions.Item>
                            <Descriptions.Item label="Date de Paiement">
                                {selectedPayment.datePaiement
                                    ? new Date(selectedPayment.datePaiement).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
                                    : 'N/A'
                                }
                            </Descriptions.Item>
                            <Descriptions.Item label="Mode de Paiement">
                                <Tag color="blue" style={{ borderRadius: 6 }}>{selectedPayment.modePaiement || 'N/A'}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Statut">
                                <Tag color="green" icon={<CheckCircleOutlined />} style={{ borderRadius: 6 }}>
                                    {selectedPayment.appelCharge?.status?.label || 'PAYÉ'}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        <Descriptions bordered column={1} size="small" title="Informations du Bien"
                            labelStyle={{ fontWeight: 600, width: '40%' }}
                        >
                            <Descriptions.Item label="Immeuble">
                                {selectedPayment.appartement?.immeuble?.nom || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Adresse">
                                {selectedPayment.appartement?.immeuble?.adress || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Appartement">
                                {selectedPayment.appartement?.numero || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Étage">
                                {selectedPayment.appartement?.etage === 0 ? 'RDC' : (selectedPayment.appartement?.etage ? `${selectedPayment.appartement.etage} ème` : 'N/A')}
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedPayment.appelCharge && (
                            <Descriptions bordered column={1} size="small" title="Charge Associée" style={{ marginTop: 16 }}
                                labelStyle={{ fontWeight: 600, width: '40%' }}
                            >
                                <Descriptions.Item label="Type de Charge">
                                    {selectedPayment.appelCharge?.charge?.type || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Montant de la Charge">
                                    {selectedPayment.appelCharge?.total?.toFixed(2) || 'N/A'} MAD
                                </Descriptions.Item>
                                <Descriptions.Item label="Date d'Émission">
                                    {selectedPayment.appelCharge?.dateEmission
                                        ? new Date(selectedPayment.appelCharge.dateEmission).toLocaleDateString('fr-FR')
                                        : 'N/A'
                                    }
                                </Descriptions.Item>
                            </Descriptions>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProprietairePaymentHistory;
