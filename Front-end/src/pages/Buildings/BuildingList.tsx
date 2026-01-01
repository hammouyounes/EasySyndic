import React, { useState } from 'react';
import { Table, Button, Card, Tag, Space, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, HomeOutlined, SaveOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useGetBuildingsQuery, useAddBuildingMutation, useUpdateBuildingMutation, useGetApartmentsQuery, useDeleteBuildingMutation } from '../../features/api/apiSlice';

interface Building {
  id: number;
  nom: string;
  adress: string;
  nombre_appartement: number;
}

const BuildingList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  
  const { data: buildings, isLoading, isError } = useGetBuildingsQuery({});
  const { data: apartments } = useGetApartmentsQuery({});
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
    const linkedApartments = apartments?.filter((appt: any) => String(appt.immeuble_id) === String(record.id));
    
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
    try {
      if (editingId) {
        await updateBuilding({ id: editingId, ...values }).unwrap();
        message.success('Bâtiment modifié avec succès');
      } else {
        await addBuilding(values).unwrap();
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
      key: 'nombre_appartement',
      render: (_: any, record: Building) => {
        // Calculate count dynamically
        const count = apartments?.filter((appt: any) => String(appt.immeuble_id) === String(record.id)).length || 0;
        return <Tag color="blue">{count} Appartements</Tag>;
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
    <Card title="Gestion des Bâtiments" extra={<Button type="primary" icon={<PlusOutlined />} onClick={showModal}>Ajouter</Button>}>
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
