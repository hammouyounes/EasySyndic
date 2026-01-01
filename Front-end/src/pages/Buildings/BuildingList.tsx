import React, { useState } from 'react';
import { Table, Button, Card, Tag, Space, Modal, Form, Input, InputNumber, message } from 'antd';
import { PlusOutlined, HomeOutlined, SaveOutlined } from '@ant-design/icons';
import { useGetBuildingsQuery, useAddBuildingMutation } from '../../features/api/apiSlice';

interface Building {
  id: number;
  nom: string;
  adress: string;
  nombre_appartement: number;
}

const BuildingList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  
  const { data: buildings, isLoading, isError } = useGetBuildingsQuery({});
  const [addBuilding] = useAddBuildingMutation();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    try {
      await addBuilding(values).unwrap();
      message.success('Bâtiment ajouté avec succès');
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
       console.error("Failed to save building", error);
       message.error('Erreur lors de l\'ajout du bâtiment');
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
      title: 'Appartements', dataIndex: 'nombre_appartement', key: 'nombre_appartement',
      render: (count: number) => <Tag color="blue">{count} Appartements</Tag>
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
        title="Ajouter un nouveau bâtiment" 
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

          <Form.Item
            label="Nombre d'appartements"
            name="nombre_appartement"
            rules={[{ required: true, message: 'Veuillez entrer le nombre d\'appartements!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Ex: 10" />
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
