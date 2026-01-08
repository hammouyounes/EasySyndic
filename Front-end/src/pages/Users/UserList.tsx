import React, { useState } from 'react';
import { Table, Button, Card, Tag, Space, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, UserOutlined, SaveOutlined } from '@ant-design/icons';
import { useGetUsersQuery, useAddUserMutation, useToggleUserStatusMutation } from '../../features/api/apiSlice';
import Switch from '../../components/Common/Switch';

interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  active: boolean;
  canToggleStatus: boolean;
}

const UserList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: users, isLoading } = useGetUsersQuery({});
  const [addUser] = useAddUserMutation();
  const [toggleUserStatus] = useToggleUserStatusMutation();

  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;

  const filteredUsers = users?.filter((user: User) => user.id !== currentUser?.id);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
     try {
       const userPayload = {
         ...values,
         motDePasse: values.mot_de_passe,
         active: false
       };
       await addUser(userPayload).unwrap();
       message.success('Utilisateur ajouté avec succès');
       setIsModalOpen(false);
       form.resetFields();
     } catch (error) {
        console.error("Failed to save user", error);
        message.error('Erreur lors de l\'ajout de l\'utilisateur');
     }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await toggleUserStatus(id).unwrap();
      message.success(`Utilisateur ${currentStatus ? 'désactivé' : 'activé'} avec succès`);
    } catch (error) {
      console.error("Failed to toggle user status", error);
      message.error("Erreur lors du changement de statut");
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { 
      title: 'Email', dataIndex: 'email', key: 'email',
    },
    { 
        title: 'Nom', dataIndex: 'nom', key: 'nom',
        render: (text: string) => <Space><UserOutlined /> <b>{text}</b></Space> 
    },
    { title: 'Prénom', dataIndex: 'prenom', key: 'prenom' },
    { 
      title: 'Rôle', dataIndex: 'role', key: 'role',
      render: (role: string) => {
        let color = role === 'ADMIN' ? 'red' : 'green';
        if (role === 'PROPRIETAIRE') color = 'blue';
        return <Tag color={color}>{role ? role : 'N/A'}</Tag>;
      }
    },
    {
      title: 'Statut',
      key: 'active',
      render: (record: User) => (
        <Switch 
          checked={record.active} 
          onChange={() => handleToggleStatus(record.id, record.active)} 
          disabled={!record.canToggleStatus}
        />
      ),
    },
  ];

  return (
    <Card title="Gestion des Utilisateurs" extra={<Button type="primary" icon={<PlusOutlined />} onClick={showModal}>Ajouter</Button>}>
      <Table 
        columns={columns} 
        dataSource={filteredUsers} 
        rowKey="id" 
        loading={isLoading}
      />

      <Modal 
        title="Ajouter un nouvel utilisateur" 
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
            label="Nom"
            name="nom"
            rules={[{ required: true, message: 'Veuillez entrer le nom!' }]}
          >
            <Input placeholder="Ex: Dupont" />
          </Form.Item>

          <Form.Item
            label="Prénom"
            name="prenom"
            rules={[{ required: true, message: 'Veuillez entrer le prénom!' }]}
          >
            <Input placeholder="Ex: Jean" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Veuillez entrer l\'email!' },
              { type: 'email', message: 'Email invalide!' }
            ]}
          >
            <Input placeholder="Ex: jean.dupont@example.com" />
          </Form.Item>

          <Form.Item
             label="Mot de passe"
             name="mot_de_passe"
             rules={[{ required: true, message: 'Veuillez entrer le mot de passe!' }]}
          >
            <Input.Password placeholder="********" />
          </Form.Item>

          <Form.Item
            label="Rôle"
            name="role"
            rules={[{ required: true, message: 'Veuillez sélectionner un rôle!' }]}
          >
            <Select placeholder="Sélectionner un rôle">
              <Select.Option value="ADMIN">Administrateur</Select.Option>
              <Select.Option value="PROPRIETAIRE">Propriétaire</Select.Option>
              <Select.Option value="LOCATAIRE">Locataire</Select.Option>
            </Select>
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

export default UserList;
