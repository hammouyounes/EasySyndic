import React from 'react';
import { Table, Card, Tag, Button, Modal, Form, Input, InputNumber, Select, message, Space } from 'antd';
import { useGetAppelChargesQuery, useAddPaymentMutation } from '../../../features/api/apiSlice';
import { FileTextOutlined, DollarOutlined } from '@ant-design/icons';

const AppelChargeList: React.FC = () => {
  const { data: appelCharges, isLoading } = useGetAppelChargesQuery({});

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedAppelCharge, setSelectedAppelCharge] = React.useState<any>(null);
  const [form] = Form.useForm();
  const [addPayment] = useAddPaymentMutation();

  const handlePaymentClick = (record: any) => {
    setSelectedAppelCharge(record);
    form.setFieldsValue({
      appelChargeId: record.id,
      amount: record.total,
      datePaiement: new Date().toISOString().split('T')[0],
      modePaiement: 'ESPECES' // Default to Cash/Espèces as per request "chooses Cash or Check" implied commonality
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedAppelCharge(null);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    if (!selectedAppelCharge) return;

    try {
      const userId = selectedAppelCharge.appartement?.proprietaire?.id;
      
      if (!userId) {
        message.error("Impossible de trouver le propriétaire de cet appartement.");
        return;
      }

      await addPayment({
        userId: userId,
        appartementId: selectedAppelCharge.appartement?.id,
        appelChargeId: selectedAppelCharge.id,
        montant: values.amount,
        datePaiement: values.datePaiement,
        modePaiement: values.modePaiement,
        reference: values.reference
      }).unwrap();

      message.success('Paiement enregistré avec succès');
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Failed to add payment", error);
      message.error("Erreur lors de l'enregistrement du paiement");
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { 
      title: 'Charge', 
      key: 'charge',
      render: (_: any, record: any) => <b>{record.charge?.type}</b> 
    },
    { 
      title: 'Appartement', 
      key: 'appartement',
      render: (_: any, record: any) => (
        <span>
          {record.appartement?.numero} <small>({record.appartement?.immeuble?.nom})</small>
        </span>
      )
    },
    { 
      title: 'Montant à payer', 
      dataIndex: 'total', 
      key: 'total',
      render: (amount: number) => <Tag color="blue">{amount?.toFixed(2)} MAD</Tag>
    },
    { 
      title: 'Statut', 
      key: 'status',
      render: (_: any, record: any) => {
          const color = record.status?.label === 'PAYÉ' ? 'green' : record.status?.label === 'EN_ATTENTE' ? 'orange' : 'red';
          return <Tag color={color}>{record.status?.label}</Tag>;
      }
    },
    { 
      title: 'Date Émission', 
      dataIndex: 'dateEmission', 
      key: 'dateEmission',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
         record.status?.label !== 'PAYÉ' && (
            <Button 
              type="primary" 
              size="small" 
              icon={<DollarOutlined />}
              onClick={() => handlePaymentClick(record)}
            >
              Payer
            </Button>
         )
      )
    }
  ];

  return (
    <Card title="Appels de Fonds (Paiements)" extra={<FileTextOutlined />}>
      <Table 
        columns={columns} 
        dataSource={appelCharges} 
        rowKey="id" 
        loading={isLoading} 
      />

      <Modal
        title="Enregistrer un Paiement"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
             label="Appel Charge ID"
             name="appelChargeId"
          >
             <Input disabled />
          </Form.Item>

          <Form.Item
            label="Montant (MAD)"
            name="amount"
            rules={[
              { required: true, message: 'Veuillez entrer le montant' },
              { 
                type: 'number', 
                max: selectedAppelCharge?.total, 
                message: `Le montant ne peut pas dépasser ${selectedAppelCharge?.total} MAD` 
              }
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0} max={selectedAppelCharge?.total} />
          </Form.Item>

          <Form.Item
            label="Date de Paiement"
            name="datePaiement"
            rules={[{ required: true, message: 'Veuillez choisir la date' }]}
          >
             <input type="date" className="ant-input" /> 
          </Form.Item>

          <Form.Item
            label="Mode de Paiement"
            name="modePaiement"
            rules={[{ required: true, message: 'Veuillez choisir le mode' }]}
          >
            <Select>
              <Select.Option value="ESPECES">Espèces</Select.Option>
              <Select.Option value="VIREMENT">Virement</Select.Option>
              <Select.Option value="CHEQUE">Chèque</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Référence (Optionnel)"
            name="reference"
          >
            <Input placeholder="Numéro de chèque, transaction..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>Annuler</Button>
              <Button type="primary" htmlType="submit">
                Confirmer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AppelChargeList;
