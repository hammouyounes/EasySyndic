import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Tag, Space, Modal, Form, Input, InputNumber, message } from 'antd';
import { HomeOutlined, SaveOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useGetBuildingsQuery, useAddBuildingMutation, useUpdateBuildingMutation, useGetApartmentsQuery, useDeleteBuildingMutation, useGetChargesQuery } from '../../../features/api/apiSlice';
import DefaultButton from '../../../components/common/DefaultButton';
import EditButton from '../../../components/common/EditButton';
import DeleteButton from '../../../components/common/DeleteButton';
import AddButton from '../../../components/common/AddButton';
import DataTable from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';

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

  const tableRef = useRef<HTMLTableElement>(null);
  const dataTableInstance = useRef<any>(null);

  useEffect(() => {
    if (!isLoading && buildings && tableRef.current) {
        if (dataTableInstance.current) {
          dataTableInstance.current.destroy();
        }
  
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
  }, [buildings, isLoading]);

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

  return (
    <Card title="Gestion des Bâtiments" extra={<AddButton onClick={showModal} />}>
      <div style={{ padding: '20px' }}>
        <table ref={tableRef} id="buildingsTable" className="display" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Adresse</th>
              <th>Appartements</th>
              <th>Étages</th>
              <th>Total Charges</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buildings?.map((building: Building) => {
               const count = apartments?.filter((appt: any) => String(appt.immeuble?.id) === String(building.id)).length ?? building.nombreAppartement ?? 0;
               const buildingCharges = charges?.filter((c: any) => c.immeuble?.id === building.id) || [];
               const total = buildingCharges.reduce((sum: number, c: any) => sum + (c.montant || 0), 0);

               return (
                <tr key={building.id}>
                  <td>{building.id}</td>
                  <td><Space><HomeOutlined /> <b>{building.nom}</b></Space></td>
                  <td>{building.adress}</td>
                  <td><Tag color="blue">{count} / {building.nombreAppartementsMax || '?'} </Tag></td>
                  <td>{building.nombreEtages}</td>
                  <td><DefaultButton>{total} MAD</DefaultButton></td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <EditButton onClick={() => handleEdit(building)} />
                      <DeleteButton 
                        onClick={() => handleDelete(building)}
                        style={{ marginLeft: 8 }}
                      />
                    </div>
                  </td>
                </tr>
               )
            })}
          </tbody>
        </table>
      </div>

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
              rules={[
                { required: true, message: 'Requis!' },
                () => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.resolve();
                    }
                    if (editingId && apartments) {
                      const currentCount = apartments.filter((appt: any) => String(appt.immeuble?.id) === String(editingId)).length;
                      if (value < currentCount) {
                        return Promise.reject(new Error(`Le max doit être >= au nombre actuel (${currentCount})`));
                      }
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
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