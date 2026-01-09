import React, { useState, useEffect, useRef } from 'react';
import { Card, Tag, Button, Modal, Form, Input, InputNumber, Select, message, Space } from 'antd';
import { useGetAppelChargesQuery, useAddPaymentMutation } from '../../../features/api/apiSlice';
import { FileTextOutlined, DollarOutlined } from '@ant-design/icons';
import DataTable from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';

const AppelChargeList: React.FC = () => {
  const { data: appelCharges, isLoading } = useGetAppelChargesQuery({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppelCharge, setSelectedAppelCharge] = useState<any>(null);
  const [form] = Form.useForm();
  const [addPayment] = useAddPaymentMutation();

  const tableRef = useRef<HTMLTableElement>(null);
  const dataTableInstance = useRef<any>(null);

  useEffect(() => {
    if (!isLoading && appelCharges && tableRef.current) {
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
  }, [appelCharges, isLoading]);

  const handlePaymentClick = (record: any) => {
    setSelectedAppelCharge(record);
    form.setFieldsValue({
      appelChargeId: record.id,
      amount: record.total,
      datePaiement: new Date().toISOString().split('T')[0],
      modePaiement: 'ESPECES' // Default to Cash/Espèces as per request "chooses Cash or Check" implied commonality
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedAppelCharge(null);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    if (!selectedAppelCharge) return;

    try {
      const userId = selectedAppelCharge.appartement?.proprietaire?.id;
      
      if (!userId) {
        message.error("Impossible de trouver le propriétaire de cet appartement.");
        return;
      }

      await addPayment({
        userId: userId,
        appartementId: selectedAppelCharge.appartement?.id,
        appelChargeId: selectedAppelCharge.id,
        montant: values.amount,
        datePaiement: values.datePaiement,
        modePaiement: values.modePaiement,
        reference: values.reference
      }).unwrap();

      message.success('Paiement enregistré avec succès');
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Failed to add payment", error);
      message.error("Erreur lors de l'enregistrement du paiement");
    }
  };

  return (
    <Card title="Appels de Fonds (Paiements)" extra={<FileTextOutlined />}>
      <div style={{ padding: '20px' }}>
        <table ref={tableRef} id="appelChargesTable" className="display" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Charge</th>
              <th>Appartement</th>
              <th>Montant à payer</th>
              <th>Statut</th>
              <th>Date Émission</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appelCharges?.map((record: any) => (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td><b>{record.charge?.type}</b></td>
                <td>
                  <span>
                    {record.appartement?.numero} <small>({record.appartement?.immeuble?.nom})</small>
                  </span>
                </td>
                <td><Tag color="blue">{record.total?.toFixed(2)} MAD</Tag></td>
                <td>
                  <Tag color={record.status?.label === 'PAYÉ' ? 'green' : record.status?.label === 'EN_ATTENTE' ? 'orange' : 'red'}>
                    {record.status?.label}
                  </Tag>
                </td>
                <td>{new Date(record.dateEmission).toLocaleDateString()}</td>
                <td style={{ display: 'flex', justifyContent: 'center' }}>
                  {record.status?.label !== 'PAYÉ' && (
                    <Button 
                      type="primary" 
                      size="small" 
                      icon={<DollarOutlined />}
                      onClick={() => handlePaymentClick(record)}
                    >
                      Payer
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        title="Enregistrer un Paiement"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
             label="Appel Charge ID"
             name="appelChargeId"
          >
             <Input disabled />
          </Form.Item>

          <Form.Item
            label="Montant (MAD)"
            name="amount"
            rules={[
              { required: true, message: 'Veuillez entrer le montant' },
              { 
                type: 'number', 
                max: selectedAppelCharge?.total, 
                message: `Le montant ne peut pas dépasser ${selectedAppelCharge?.total} MAD` 
              }
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0} max={selectedAppelCharge?.total} />
          </Form.Item>

          <Form.Item
            label="Date de Paiement"
            name="datePaiement"
            rules={[{ required: true, message: 'Veuillez choisir la date' }]}
          >
             <input type="date" className="ant-input" /> 
          </Form.Item>

          <Form.Item
            label="Mode de Paiement"
            name="modePaiement"
            rules={[{ required: true, message: 'Veuillez choisir le mode' }]}
          >
            <Select>
              <Select.Option value="ESPECES">Espèces</Select.Option>
              <Select.Option value="VIREMENT">Virement</Select.Option>
              <Select.Option value="CHEQUE">Chèque</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Référence (Optionnel)"
            name="reference"
          >
            <Input placeholder="Numéro de chèque, transaction..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>Annuler</Button>
              <Button type="primary" htmlType="submit">
                Confirmer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AppelChargeList;
