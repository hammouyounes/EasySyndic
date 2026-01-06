import React, { useState } from 'react';
import { Table, Button, Card, Tag, Space, Modal, Form, Input, InputNumber, message } from 'antd';
import { PlusOutlined, HomeOutlined, SaveOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useGetBuildingsQuery, useAddBuildingMutation, useUpdateBuildingMutation, useGetApartmentsQuery, useDeleteBuildingMutation, useGetChargesQuery } from '../../../features/api/apiSlice';
import GradientButton from '../../../components/common/GradientButton';
import DefaultButton from '../../../components/common/DefaultButton';

interface Building {
  id: number;
  nom: string;
  adress: string;
  nombreAppartement: number;
  nombreEtages: number;
  nombreAppartementsMax: number;
}

const BuildingList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  
  const { data: buildings, isLoading, isError } = useGetBuildingsQuery({});
  const { data: apartments } = useGetApartmentsQuery({});
  const { data: charges } = useGetChargesQuery({}); // Fetch charges
  
  const [addBuilding] = useAddBuildingMutation();
  const [updateBuilding] = useUpdateBuildingMutation();
  const [deleteBuilding] = useDeleteBuildingMutation();

  const showModal = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Building) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (record: Building) => {
    // Check for linked apartments
    const linkedApartments = apartments?.filter((appt: any) => String(appt.immeuble?.id) === String(record.id));
    
    if (linkedApartments && linkedApartments.length > 0) {
      Modal.error({
        title: 'Action impossible',
        icon: <ExclamationCircleOutlined />,
        content: `Ce bâtiment contient ${linkedApartments.length} appartement(s). Veuillez d'abord les supprimer.`,
      });
      return;
    }

    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer ce bâtiment ?',
      icon: <ExclamationCircleOutlined />,
      content: 'Cette action est irréversible.',
      okText: 'Oui, supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await deleteBuilding(record.id).unwrap();
          message.success('Bâtiment supprimé avec succès');
        } catch (error) {
          console.error("Failed to delete building", error);
          message.error("Erreur lors de la suppression du bâtiment");
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
        nom: values.nom,
        adress: values.adress,
        nombreEtages: Number(values.nombreEtages),
        nombreAppartementsMax: Number(values.nombreAppartementsMax),
        nombreAppartement: 0 // Initialize to 0 for new buildings
      };
      
      console.log("Sending Payload:", payload);

      if (editingId) {
        await updateBuilding({ id: editingId, ...payload }).unwrap();
        message.success('Bâtiment modifié avec succès');
      } else {
        await addBuilding(payload).unwrap();
        message.success('Bâtiment ajouté avec succès');
      }
      setIsModalOpen(false);
      setEditingId(null);
      form.resetFields();
    } catch (error) {
       console.error("Failed to save building", error);
       message.error(editingId ? 'Erreur lors de la modification' : 'Erreur lors de l\'ajout du bâtiment');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { 
      title: 'Nom', dataIndex: 'nom', key: 'nom', 
      render: (text: string) => <Space><HomeOutlined /> <b>{text}</b></Space> 
    },
    { title: 'Adresse', dataIndex: 'adress', key: 'adress' },
    { 
      title: 'Appartements', 
      key: 'nombreAppartement',
      render: (_: any, record: Building) => {
        // Calculate count dynamically from apartments list if available, otherwise use record count
        const count = apartments?.filter((appt: any) => String(appt.immeuble?.id) === String(record.id)).length ?? record.nombreAppartement ?? 0;
        return <Tag color="blue">{count} / {record.nombreAppartementsMax || '?'} </Tag>;
      }
    },
    { title: 'Étages', dataIndex: 'nombreEtages', key: 'nombreEtages' },
    {
      title: 'Total Charges',
      key: 'totalCharges',
      render: (_: any, record: Building) => {
        // Calculate total charges for this building
        const buildingCharges = charges?.filter((c: any) => c.immeuble?.id === record.id) || [];
        const total = buildingCharges.reduce((sum: number, c: any) => sum + (c.montant || 0), 0);
        
        return (
          <DefaultButton>
            {total} MAD
          </DefaultButton>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Building) => (
        <>
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
            style={{ marginLeft: 8 }}
          >
            Supprimer
          </Button>
        </>
      ),
    },
  ];

  return (
    <Card title="Gestion des Bâtiments" extra={<GradientButton type="primary" icon={<PlusOutlined />} onClick={showModal}>Ajouter</GradientButton>}>
      <Table 
        columns={columns} 
        dataSource={buildings} 
        rowKey="id" 
        loading={isLoading}
      />

      <Modal 
        title={editingId ? "Modifier le bâtiment" : "Ajouter un nouveau bâtiment"} 
        open={isModalOpen} 
        onCancel={handleCancel}
        footer={null} // We use the form submit button
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Nom du bâtiment"
            name="nom"
            rules={[{ required: true, message: 'Veuillez entrer le nom du bâtiment!' }]}
          >
            <Input placeholder="Ex: Residence Al-Yassmine" />
          </Form.Item>

          <Form.Item
            label="Adresse"
            name="adress"
            rules={[{ required: true, message: 'Veuillez entrer l\'adresse!' }]}
          >
            <Input placeholder="Ex: 12 Av Mohammed V" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              label="Nombre d'étages"
              name="nombreEtages"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Requis!' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Ex: 5" />
            </Form.Item>

            <Form.Item
              label="Max Appartements"
              name="nombreAppartementsMax"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Requis!' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Ex: 20" />
            </Form.Item>
          </div>



          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
             <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Annuler
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Enregistrer
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default BuildingList;