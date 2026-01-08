import React, { useState } from 'react';
import { Table, Button, Card, Tag, Space, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { AppstoreOutlined, SaveOutlined } from '@ant-design/icons';
import { 
  useGetApartmentsQuery, 
  useAddApartmentMutation, 
  useUpdateApartmentMutation,
  useAssignProprietaireMutation,
  useGetBuildingsQuery, 
  useGetUsersQuery 
} from '../../../features/api/apiSlice';
import EditButton from '../../../components/common/EditButton';
import AddButton from '../../../components/common/AddButton';

interface Apartment {
  id: number;
  etage: number;
  numero: string;
  surface: number;
  immeuble?: { id: number; nom: string };
  proprietaire?: { id: number; nom: string; prenom: string };
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
  const [assignProprietaire] = useAssignProprietaireMutation();

  const showModal = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Apartment) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      immeuble_id: record.immeuble?.id,
      propretaire_id: record.proprietaire?.id
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    try {
      const { immeuble_id, propretaire_id, ...apartmentData } = values;
      
      if (editingId) {
        await updateApartment({ id: editingId, ...apartmentData }).unwrap();
        if (propretaire_id) {
           await assignProprietaire({ id: editingId, proprietaireId: propretaire_id }).unwrap();
        }
        message.success('Appartement modifié avec succès');
      } else {
        const newAppt = await addApartment({ immeubleId: immeuble_id, ...apartmentData }).unwrap();
        if (propretaire_id) {
           await assignProprietaire({ id: newAppt.id, proprietaireId: propretaire_id }).unwrap();
        }
        message.success('Appartement ajouté avec succès');
      }
      setIsModalOpen(false);
      setEditingId(null);
      form.resetFields();
    } catch (error: any) {
      console.error("Failed to save apartment", error);
      const errorMsg = error?.data?.message || (editingId ? 'Erreur lors de la modification' : 'Erreur lors de l\'ajout de l\'appartement');
      message.error(errorMsg);
    }
  };



  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { 
      title: 'Numéro', dataIndex: 'numero', key: 'numero',
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
      title: 'Immeuble', key: 'immeuble',
      render: (_: any, record: Apartment) => <Tag color="blue">{record.immeuble ? record.immeuble.nom : 'N/A'}</Tag>
    },
    { 
      title: 'Propriétaire', key: 'proprietaire',
      render: (_: any, record: Apartment) => <span>{record.proprietaire ? `${record.proprietaire.nom} ${record.proprietaire.prenom}` : 'Aucun'}</span>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Apartment) => (
        <EditButton 
          onClick={() => handleEdit(record)} 
        />
      ),
    },
  ];

  return (
    <Card title="Gestion des Appartements" extra={<AddButton onClick={showModal} />}>
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
            name="numero"
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
              disabled={!!editingId} // Disable in edit mode as backend doesn't support easy move yet
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
