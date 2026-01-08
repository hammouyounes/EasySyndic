import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Tag, Space, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { AppstoreOutlined, SaveOutlined } from '@ant-design/icons';
import DataTable from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';
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

  const tableRef = useRef<HTMLTableElement>(null);
  const dataTableInstance = useRef<any>(null);

  useEffect(() => {
    if (!isLoadingApartments && apartments && tableRef.current) {
        // Destroy existing instance if it exists to prevent re-initialization error
        if (dataTableInstance.current) {
          dataTableInstance.current.destroy();
        }
  
        // Initialize DataTable
        const timer = setTimeout(() => {
           dataTableInstance.current = new DataTable(tableRef.current!, {
              language: {
                  url: '//cdn.datatables.net/plug-ins/1.13.3/i18n/fr-FR.json'
              },
              destroy: true,
              autoWidth: false,
              stateSave: true,
              paging: true,
              pageLength: 5,
              lengthMenu: [5, 10, 25, 50],
              columnDefs: [
                  { className: "dt-head-center dt-body-center", targets: "_all" },
                  { orderable: false, targets: -1, width: '1%' } // Disable sorting and minimize width on Actions column
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
  }, [apartments, isLoadingApartments]);

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

  return (
    <Card title="Gestion des Appartements" extra={<AddButton onClick={showModal} />}>
      <div style={{ padding: '20px' }}>
        <table ref={tableRef} id="apartmentsTable" className="display" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Numéro</th>
              <th>Étage</th>
              <th>Surface</th>
              <th>Immeuble</th>
              <th>Propriétaire</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apartments?.map((appt: Apartment) => (
              <tr key={appt.id}>
                <td>{appt.id}</td>
                <td><Space><AppstoreOutlined /> <b>{appt.numero}</b></Space></td>
                <td><Tag color="cyan">{appt.etage} Étage</Tag></td>
                <td><span>{appt.surface} m²</span></td>
                <td><Tag color="blue">{appt.immeuble ? appt.immeuble.nom : 'N/A'}</Tag></td>
                <td><span>{appt.proprietaire ? `${appt.proprietaire.nom} ${appt.proprietaire.prenom}` : 'Aucun'}</span></td>
                <td>
                   <EditButton onClick={() => handleEdit(appt)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
