import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Tag, Space, Modal, Form, Input, Select, message } from 'antd';
import { UserOutlined, SaveOutlined } from '@ant-design/icons';
import { useGetUsersQuery, useAddUserMutation, useToggleUserStatusMutation } from '../../features/api/apiSlice';
import Switch from '../../components/common/Switch';
import AddButton from '../../components/common/AddButton';
import DataTable from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';

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

  const tableRef = useRef<HTMLTableElement>(null);
  const dataTableInstance = useRef<any>(null);

  useEffect(() => {
    if (!isLoading && filteredUsers && tableRef.current) {
        if (dataTableInstance.current) {
          dataTableInstance.current.destroy();
        }
  
        const timer = setTimeout(() => {
           dataTableInstance.current = new DataTable(tableRef.current!, {
              language: {
                  processing:     "Traitement en cours...",
                  search:         "Rechercher&nbsp;:",
                  lengthMenu:    "Afficher _MENU_ &eacute;l&eacute;ments",
                  info:           "Affichage de l'&eacute;lement _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments",
                  infoEmpty:      "Affichage de l'&eacute;lement 0 &agrave; 0 sur 0 &eacute;l&eacute;ments",
                  infoFiltered:   "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
                  infoPostFix:    "",
                  loadingRecords: "Chargement en cours...",
                  zeroRecords:    "Aucun &eacute;l&eacute;ment &agrave; afficher",
                  emptyTable:     "Aucune donnée disponible dans le tableau",
                  paginate: {
                      first:      "Premier",
                      previous:   "Pr&eacute;c&eacute;dent",
                      next:       "Suivant",
                      last:       "Dernier"
                  },
                  aria: {
                      sortAscending:  ": activer pour trier la colonne par ordre croissant",
                      sortDescending: ": activer pour trier la colonne par ordre décroissant"
                  }
              },
              destroy: true,
              autoWidth: false,
              stateSave: true,
              paging: true,
              pageLength: 5,
              lengthMenu: [5, 10, 25, 50],
              columnDefs: [
                  { className: "dt-head-center dt-body-center", targets: "_all" },
                  { orderable: false, targets: -1, width: '1%' }
              ]
           });
        }, 100);
  
        return () => {
          clearTimeout(timer);
          if (dataTableInstance.current) {
               dataTableInstance.current.destroy();
               dataTableInstance.current = null;
          }
        };
    }
  }, [filteredUsers, isLoading]);

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

  return (
    <Card title="Gestion des Utilisateurs" extra={<AddButton onClick={showModal} />}>
      <div style={{ padding: '20px' }}>
        <table ref={tableRef} id="usersTable" className="display" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Rôle</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers?.map((user: User) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td><Space><UserOutlined /> <b>{user.nom}</b></Space></td>
                <td>{user.prenom}</td>
                <td>
                  <Tag color={user.role === 'ADMIN' ? 'red' : (user.role === 'PROPRIETAIRE' ? 'blue' : 'green')}>
                    {user.role}
                  </Tag>
                </td>
                <td style={{ display: 'flex', justifyContent: 'center' }}>
                  <Switch 
                    checked={user.active} 
                    onChange={() => handleToggleStatus(user.id, user.active)} 
                    disabled={!user.canToggleStatus}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
