import React, { useState } from 'react';
import { Table, Button, Card, Tag, Space, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { PlusOutlined, AppstoreOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';
import { 
  useGetApartmentsQuery, 
  useAddApartmentMutation, 
  useUpdateApartmentMutation,
  useGetBuildingsQuery, 
  useGetUsersQuery 
} from '../../features/api/apiSlice';

interface Apartment {
  id: number;
  etage: number;
  nemuro: string;
  surface: number;
  immeuble_id: number;
  propretaire_id: number;
}

const ApartmentList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  // Fetch Data
  const { data: apartments, isLoading: isLoadingApartments } = useGetApartmentsQuery({});
  const { data: buildings } = useGetBuildingsQuery({});
  const { data: users } = useGetUsersQuery({});
  
  const [addApartment] = useAddApartmentMutation();
  const [updateApartment] = useUpdateApartmentMutation();

  const showModal = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Apartment) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    try {
      if (editingId) {
        await updateApartment({ id: editingId, ...values }).unwrap();
        message.success('Appartement modifié avec succès');
      } else {
        await addApartment(values).unwrap();
        message.success('Appartement ajouté avec succès');
      }
      setIsModalOpen(false);
      setEditingId(null);
      form.resetFields();
    } catch (error) {
      console.error("Failed to save apartment", error);
      message.error(editingId ? 'Erreur lors de la modification' : 'Erreur lors de l\'ajout de l\'appartement');
    }
  };

  // Helper functions to get names from IDs
  const getBuildingName = (id: number) => {
    // Note: IDs in JSON server might be strings or numbers. 
    // Using loose equality check (==) or string conversion can be safer if types are inconsistent.
    const building = buildings?.find((b: any) => b.id == id); 
    return building ? building.nom : 'Inconnu';
  };

  const getUserName = (id: number) => {
    const user = users?.find((u: any) => u.id == id);
    return user ? `${user.nom} ${user.prenom}` : 'Inconnu';
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { 
      title: 'Numéro', dataIndex: 'nemuro', key: 'nemuro', // Note: DB uses 'nemuro'
      render: (text: string) => <Space><AppstoreOutlined /> <b>{text}</b></Space>
    },
    { 
      title: 'Étage', dataIndex: 'etage', key: 'etage',
      render: (etage: number) => <Tag color="cyan">{etage} Étage</Tag>
    },
    { 
      title: 'Surface', dataIndex: 'surface', key: 'surface',
      render: (surface: number) => <span>{surface} m²</span>
    },
    { 
      title: 'Immeuble', dataIndex: 'immeuble_id', key: 'immeuble_id',
      render: (id: number) => <Tag color="blue">{getBuildingName(id)}</Tag>
    },
    { 
      title: 'Propriétaire', dataIndex: 'propretaire_id', key: 'propretaire_id',
      render: (id: number) => <span>{getUserName(id)}</span>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Apartment) => (
        <Button 
          icon={<EditOutlined />} 
          onClick={() => handleEdit(record)} 
        >
          Modifier
        </Button>
      ),
    },
  ];

  return (
    <Card title="Gestion des Appartements" extra={<Button type="primary" icon={<PlusOutlined />} onClick={showModal}>Ajouter</Button>}>
      <Table 
        columns={columns} 
        dataSource={apartments} 
        rowKey="id" 
        loading={isLoadingApartments}
      />

      <Modal 
        title={editingId ? "Modifier l'appartement" : "Ajouter un nouvel appartement"} 
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
            label="Numéro"
            name="nemuro"
            rules={[{ required: true, message: 'Veuillez entrer le numéro!' }]}
          >
            <Input placeholder="Ex: A1" />
          </Form.Item>

          <Form.Item
            label="Étage"
            name="etage"
            rules={[{ required: true, message: 'Veuillez entrer l\'étage!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="Ex: 1" />
          </Form.Item>

          <Form.Item
            label="Surface (m²)"
            name="surface"
            rules={[{ required: true, message: 'Veuillez entrer la surface!' }]}
          >
             <InputNumber style={{ width: '100%' }} min={0} placeholder="Ex: 80" />
          </Form.Item>

          <Form.Item
            label="Immeuble"
            name="immeuble_id"
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

          <Form.Item
            label="Propriétaire"
            name="propretaire_id"
            rules={[{ required: true, message: 'Veuillez sélectionner un propriétaire!' }]}
          >
             <Select
              showSearch
              placeholder="Sélectionner un propriétaire"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (String(option?.label ?? '')).toLowerCase().includes(input.toLowerCase())
              }
               options={users?.map((u: any) => ({
                value: u.id,
                label: `${u.nom} ${u.prenom}`,
              }))}
            />
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

export default ApartmentList;
