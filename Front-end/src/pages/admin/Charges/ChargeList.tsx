import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Tag, Modal, Form, Input, InputNumber, Select, message, Progress, Switch } from 'antd';
import { DollarOutlined, ExclamationCircleOutlined, SendOutlined, UndoOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import DataTable from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import { 
  useGetChargesQuery, 
  useAddChargeMutation, 
  useUpdateChargeMutation, 
  useDeleteChargeMutation,
  useGetBuildingsQuery,
  useDistributeChargeMutation,
  useUndoDistributeChargeMutation
} from '../../../features/api/apiSlice';
import EditButton from '../../../components/common/EditButton';
import DeleteButton from '../../../components/common/DeleteButton';
import AddButton from '../../../components/common/AddButton';
import DistributeButton from '../../../components/common/DistributeButton';

interface Charge {
  id: number;
  type: string;
  montant: number;
  periode: string;
  immeuble: { id: number; nom: string };
  diviser: number;
  locked: boolean;
  progress: number;
  chargeType?: string;
  isRecurring?: boolean;
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
  const [undoDistributeCharge] = useUndoDistributeChargeMutation();
  
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;

  const tableRef = useRef<HTMLTableElement>(null);
  const dataTableInstance = useRef<any>(null);

  useEffect(() => {
    if (!isLoading && charges && tableRef.current) {
        // Destroy existing instance if it exists to prevent re-initialization error
        if (dataTableInstance.current) {
          dataTableInstance.current.destroy();
        }
  
        // Initialize DataTable
        // We use a slight timeout to ensure React has rendered the DOM nodes
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
              destroy: true, // Allow re-initialization
              autoWidth: false,
              stateSave: true, // Remembers page number and length
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
  }, [charges, isLoading]);

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

  const handleDistributeToggle = (record: Charge) => {
    if (record.diviser === 1) {
      // Undo Logic
      Modal.confirm({
        title: 'Annuler la distribution',
        icon: <UndoOutlined />,
        content: `Voulez-vous vraiment annuler la distribution pour "${record.type}" ? Cela supprimera tous les appels de fonds générés.`,
        okText: 'Oui, annuler',
        okType: 'danger',
        cancelText: 'Retour',
        onOk: async () => {
          try {
            await undoDistributeCharge(record.id).unwrap();
            message.success('Distribution annulée avec succès.');
          } catch (error: any) {
             console.error("Failed to undo distribution", error);
             message.error(error?.data?.message || "Erreur lors de l'annulation");
          }
        }
      });
    } else {
      // Distribute Logic
      Modal.confirm({
        title: 'Distribuer la charge',
        icon: <SendOutlined />,
        content: (
          <div>
            Voulez-vous vraiment générer les appels de charges pour "<b>{record.type}</b>" pour tous les appartements de "<b>{record.immeuble?.nom}</b>" ?
            <br /><br />
            <span style={{ fontSize: 16 }}>Montant total : </span>
            <span style={{ color: '#52c41a', fontWeight: 'bold', fontSize: 18 }}>{record.montant} MAD</span>
          </div>
        ),
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
    }
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
         chargeType: values.chargeType,
         isRecurring: values.isRecurring
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

  return (
    <Card title="Gestion des Charges" extra={currentUser?.role !== 'SUPERADMIN' && <AddButton onClick={showModal} />}>
      <div style={{ padding: '20px' }}>
        <table ref={tableRef} id="myTable" className="display" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Catégorie</th>
              <th>Récurrence</th>
              <th>Montant</th>
              <th>Période</th>
              <th>Immeuble</th>
              <th>Progression</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {charges?.map((charge: Charge) => (
              <tr key={charge.id}>
                <td>{charge.id}</td>
                <td><b>{charge.type}</b></td>
                <td>
                  {charge.chargeType && (
                    <Tag color={charge.chargeType === 'MONTHLY' ? 'blue' : (charge.chargeType === 'EXCEPTIONNEL' ? 'red' : 'orange')}>
                      {charge.chargeType}
                    </Tag>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {charge.isRecurring ? 
                    <CheckCircleOutlined style={{ color: 'green', fontSize: '16px' }} /> : 
                    <CloseCircleOutlined style={{ color: '#ccc', fontSize: '16px' }} />
                  }
                </td>
                <td><Tag color="green">{charge.montant} MAD</Tag></td>
                <td>{charge.periode}</td>
                <td><Tag color="blue">{charge.immeuble?.nom || 'N/A'}</Tag></td>
                <td>
                  <Progress 
                    percent={Math.round(charge.progress || 0)} 
                    size="small"
                    steps={5}
                    strokeColor={charge.diviser !== 1 ? '#ccc' : undefined}
                    format={(percent) => charge.diviser !== 1 ? 'ND' : `${percent}%`}
                  />
                </td>
                <td style={{ display: 'flex', gap: '8px' }}>
                   {currentUser?.role === 'SUPERADMIN' && (
                     <DistributeButton 
                        onClick={() => handleDistributeToggle(charge)} 
                        disabled={charge.locked}
                        title={charge.locked ? "Charge verrouillée (paiements existants)" : (charge.diviser === 1 ? "Annuler la distribution" : "Distribuer aux appartements")}
                        label={charge.diviser === 1 ? "Annuler" : "Distribuer"}
                        isUndo={charge.diviser === 1}
                      />
                    )}
                    {currentUser?.role !== 'SUPERADMIN' && (
                      <>
                        <EditButton 
                          onClick={() => handleEdit(charge)} 
                          disabled={charge.locked}
                          title={charge.locked ? "Impossible de modifier (paiements en cours)" : "Modifier"}
                        />
                        <DeleteButton 
                          onClick={() => handleDelete(charge)}
                          disabled={charge.locked}
                          title={charge.locked ? "Impossible de supprimer (paiements en cours)" : "Supprimer"}
                        />
                      </>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

          <Form.Item
            label="Catégorie"
            name="chargeType"
            rules={[{ required: true, message: 'Veuillez sélectionner une catégorie!' }]}
          >
            <Select placeholder="Sélectionner une catégorie">
              <Select.Option value="MONTHLY">MENSUEL (MONTHLY)</Select.Option>
              <Select.Option value="SPECIAL">SPÉCIAL</Select.Option>
              <Select.Option value="EXCEPTIONNEL">EXCEPTIONNEL</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Récurrente ?"
            name="isRecurring"
            valuePropName="checked"
            initialValue={false}
          >
             <Switch checkedChildren="Oui" unCheckedChildren="Non" />
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
