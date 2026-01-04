import React, { useState } from 'react';
import { Table, Button, Card, Tag, Space, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { PlusOutlined, DollarOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, SendOutlined } from '@ant-design/icons';
import { 
  useGetChargesQuery, 
  useAddChargeMutation, 
  useUpdateChargeMutation, 
  useDeleteChargeMutation,
  useGetBuildingsQuery,
  useDistributeChargeMutation
} from '../../features/api/apiSlice';

interface Charge {
  id: number;
  type: string;
  montant: number;
  periode: string;
  immeuble: { id: number; nom: string };
  diviser: number;
}

const ChargeList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  
  const { data: charges, isLoading } = useGetChargesQuery({});
  const { data: buildings } = useGetBuildingsQuery({});
  
  const [addCharge] = useAddChargeMutation();
  const [updateCharge] = useUpdateChargeMutation();
  const [deleteCharge] = useDeleteChargeMutation();
  const [distributeCharge] = useDistributeChargeMutation();

  const showModal = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Charge) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      immeubleId: record.immeuble?.id
    });
    setIsModalOpen(true);
  };

  const handleDelete = (record: Charge) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cette charge ?',
      icon: <ExclamationCircleOutlined />,
      content: 'Cette action est irréversible.',
      okText: 'Oui, supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await deleteCharge(record.id).unwrap();
          message.success('Charge supprimée avec succès');
        } catch (error) {
          console.error("Failed to delete charge", error);
          message.error("Erreur lors de la suppression de la charge");
        }
      },
    });
  };

  const handleDistribute = (record: Charge) => {
    Modal.confirm({
      title: 'Distribuer la charge',
      icon: <SendOutlined />,
      content: `Voulez-vous vraiment générer les appels de charges pour "${record.type}" pour tous les appartements de "${record.immeuble?.nom}" ?`,
      okText: 'Oui, distribuer',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await distributeCharge(record.id).unwrap();
          message.success('Charge distribuée avec succès! Appels de fonds générés.');
        } catch (error: any) {
          console.error("Failed to distribute charge", error);
          message.error(error?.data?.message || "Erreur lors de la distribution de la charge");
        }
      },
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    console.log("Form Values:", values);
    try {
      const payload = {
         type: values.type,
         montant: Number(values.montant),
         periode: values.periode,
      };

      if (editingId) {
        await updateCharge({ id: editingId, ...payload, immeubleId: values.immeubleId }).unwrap();
        message.success('Charge modifiée avec succès');
      } else {
        await addCharge({ immeubleId: values.immeubleId, ...payload }).unwrap();
        message.success('Charge ajoutée avec succès');
      }
      setIsModalOpen(false);
      setEditingId(null);
      form.resetFields();
    } catch (error) {
       console.error("Failed to save charge", error);
       message.error(editingId ? 'Erreur lors de la modification' : 'Erreur lors de l\'ajout de la charge');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { 
      title: 'Type', dataIndex: 'type', key: 'type',
      render: (text: string) => <b>{text}</b>
    },
    { 
      title: 'Montant', dataIndex: 'montant', key: 'montant',
      render: (montant: number) => <Tag color="green">{montant} MAD</Tag>
    },
    { title: 'Période', dataIndex: 'periode', key: 'periode' },
    { 
      title: 'Immeuble', key: 'immeuble',
      render: (_: any, record: Charge) => <Tag color="blue">{record.immeuble ? record.immeuble.nom : 'N/A'}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Charge) => (
        <Space>
          <Button 
            type="primary"
            ghost
            icon={<SendOutlined />} 
            onClick={() => handleDistribute(record)} 
            disabled={record.diviser === 1}
            title={record.diviser === 1 ? "Déjà distribué" : "Distribuer aux appartements"}
          >
            {record.diviser === 1 ? "Déjà Distribué" : "Distribuer"}
          </Button>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)} 
          >
            Modifier
          </Button>
          <Button 
            danger
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record)}
          >
            Supprimer
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Gestion des Charges" extra={<Button type="primary" icon={<PlusOutlined />} onClick={showModal}>Ajouter</Button>}>
      <Table 
        columns={columns} 
        dataSource={charges} 
        rowKey="id" 
        loading={isLoading}
      />

      <Modal 
        title={editingId ? "Modifier la charge" : "Ajouter une nouvelle charge"} 
        open={isModalOpen} 
        onCancel={handleCancel}
        footer={null} 
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Type de charge"
            name="type"
            rules={[{ required: true, message: 'Veuillez entrer le type (ex: Eau, Électricité)!' }]}
          >
            <Input placeholder="Ex: Électricité" />
          </Form.Item>

          <Form.Item
            label="Montant (MAD)"
            name="montant"
            rules={[{ required: true, message: 'Veuillez entrer le montant!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Ex: 500" />
          </Form.Item>

          <Form.Item
             label="Période"
             name="periode"
             rules={[{ required: true, message: 'Veuillez entrer la période!' }]}
          >
            <Input placeholder="Ex: Janvier 2024" />
          </Form.Item>

          <Form.Item
            label="Immeuble"
            name="immeubleId"
            rules={[{ required: true, message: 'Veuillez sélectionner un immeuble!' }]}
          >
            <Select
              showSearch
              placeholder="Sélectionner un immeuble"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (String(option?.label ?? '')).toLowerCase().includes(input.toLowerCase())
              }
              options={buildings?.map((b: any) => ({
                value: b.id,
                label: b.nom,
              }))}
            />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
             <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Annuler
            </Button>
            <Button type="primary" htmlType="submit" icon={<DollarOutlined />}>
              Enregistrer
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ChargeList;
