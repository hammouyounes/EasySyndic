import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Progress,
  Switch,
  Tooltip,
  Spin,
  Upload,
} from "antd";
import {
  DollarOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
  UndoOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import DataTable from "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import {
  useGetChargesQuery,
  useAddChargeMutation,
  useUpdateChargeMutation,
  useDeleteChargeMutation,
  useGetBuildingsQuery,
  useDistributeChargeMutation,
  useUndoDistributeChargeMutation,
  useGetUsersQuery,
  useGetApartmentsQuery,
  useSendNotificationMutation,
  useGenerateEmailMutation,
} from "../../../features/api/apiSlice";
import EditButton from "../../../components/common/EditButton";
import DeleteButton from "../../../components/common/DeleteButton";
import AddButton from "../../../components/common/AddButton";
import DistributeButton from "../../../components/common/DistributeButton";

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
  recu?: string;
}

interface UserInfo {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  active: boolean;
}

interface Appartement {
  id: number;
  immeuble: { id: number };
  proprietaire?: UserInfo;
}

const ChargeList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  // ─── Email Modal State ───
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailForm] = Form.useForm();
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);

  // ─── Receipt State ───
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<string | null>(null);
  const [recuBase64, setRecuBase64] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const { data: allCharges, isLoading } = useGetChargesQuery({});
  const { data: allBuildings } = useGetBuildingsQuery({});
  const { data: users } = useGetUsersQuery({});
  const { data: apartments } = useGetApartmentsQuery({});

  const [addCharge, { isLoading: isLoadingAdd }] = useAddChargeMutation();
  const [updateCharge, { isLoading: isLoadingUpdate }] =
    useUpdateChargeMutation();
  const [deleteCharge] = useDeleteChargeMutation();
  const [distributeCharge] = useDistributeChargeMutation();
  const [undoDistributeCharge] = useUndoDistributeChargeMutation();
  const userString = localStorage.getItem("user");
  const currentUser = userString ? JSON.parse(userString) : null;

  // Filter buildings and charges for ADMIN (syndic) users
  const buildings =
    currentUser?.role === "ADMIN"
      ? allBuildings?.filter((b: any) => b.syndic?.id === currentUser?.id)
      : allBuildings;
  const syndicBuildingIds = buildings?.map((b: any) => b.id) || [];
  const charges =
    currentUser?.role === "ADMIN"
      ? allCharges?.filter((c: any) =>
          syndicBuildingIds.includes(c.immeuble?.id),
        )
      : allCharges;
  const [sendNotification, { isLoading: isSendingEmail }] =
    useSendNotificationMutation();
  const [generateEmail, { isLoading: isGeneratingAI }] =
    useGenerateEmailMutation();

  const tableRef = useRef<HTMLTableElement>(null);
  const dataTableInstance = useRef<any>(null);

  useEffect(() => {
    if (!isLoading && charges && tableRef.current) {
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
      }

      const timer = setTimeout(() => {
        dataTableInstance.current = new DataTable(tableRef.current!, {
          language: {
            processing: "Traitement en cours...",
            search: "Rechercher&nbsp;:",
            lengthMenu: "Afficher _MENU_ &eacute;l&eacute;ments",
            info: "Affichage de l'&eacute;lement _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments",
            infoEmpty:
              "Affichage de l'&eacute;lement 0 &agrave; 0 sur 0 &eacute;l&eacute;ments",
            infoFiltered:
              "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
            loadingRecords: "Chargement en cours...",
            zeroRecords: "Aucun &eacute;l&eacute;ment &agrave; afficher",
            emptyTable: "Aucune donnée disponible dans le tableau",
            paginate: {
              first: "Premier",
              previous: "Pr&eacute;c&eacute;dent",
              next: "Suivant",
              last: "Dernier",
            },
          },
          destroy: true,
          autoWidth: false,
          stateSave: true,
          paging: true,
          pageLength: 5,
          lengthMenu: [5, 10, 25, 50],
          columnDefs: [
            { className: "dt-head-center dt-body-center", targets: "_all" },
            { orderable: false, targets: -1, width: "1%" },
          ],
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
    setRecuBase64(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Charge) => {
    setEditingId(record.id);
    setRecuBase64(record.recu || null);
    form.setFieldsValue({
      ...record,
      immeubleId: record.immeuble?.id,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (file: any) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("Le fichier doit être inférieur à 10 Mo");
      return Upload.LIST_IGNORE;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setRecuBase64(reader.result as string);
      messageApi.success(`${file.name} chargé avec succès`);
    };
    reader.readAsDataURL(file);
    return false; // Empêcher l'upload automatique
  };

  const handleViewReceipt = (recu: string) => {
    setCurrentReceipt(recu);
    setIsReceiptModalOpen(true);
  };

  const handleDelete = (record: Charge) => {
    Modal.confirm({
      title: "Êtes-vous sûr de vouloir supprimer cette charge ?",
      icon: <ExclamationCircleOutlined />,
      content: "Cette action est irréversible.",
      okText: "Oui, supprimer",
      okType: "danger",
      cancelText: "Annuler",
      onOk: async () => {
        try {
          await deleteCharge(record.id).unwrap();
          messageApi.success("Charge supprimée avec succès");
        } catch (error) {
          console.error("Failed to delete charge", error);
          messageApi.error("Erreur lors de la suppression de la charge");
        }
      },
    });
  };

  const handleDistributeToggle = (record: Charge) => {
    if (record.diviser === 1) {
      // Undo Logic
      Modal.confirm({
        title: "Annuler la distribution",
        icon: <UndoOutlined />,
        content: `Voulez-vous vraiment annuler la distribution pour "${record.type}" ? Cela supprimera tous les appels de fonds générés.`,
        okText: "Oui, annuler",
        okType: "danger",
        cancelText: "Retour",
        onOk: async () => {
          try {
            await undoDistributeCharge(record.id).unwrap();
            message.success("Distribution annulée avec succès.");
          } catch (error: any) {
            console.error("Failed to undo distribution", error);
            message.error(
              error?.data?.message || "Erreur lors de l'annulation",
            );
          }
        },
      });
    } else {
      // Distribute Logic
      Modal.confirm({
        title: "Distribuer la charge",
        icon: <SendOutlined />,
        content: (
          <div>
            Voulez-vous vraiment générer les appels de charges pour "
            <b>{record.type}</b>" pour tous les appartements de "
            <b>{record.immeuble?.nom}</b>" ?
            <br />
            <br />
            <span style={{ fontSize: 16 }}>Montant total : </span>
            <span
              style={{ color: "#52c41a", fontWeight: "bold", fontSize: 18 }}
            >
              {record.montant} MAD
            </span>
          </div>
        ),
        okText: "Oui, distribuer",
        cancelText: "Annuler",
        onOk: async () => {
          try {
            await distributeCharge(record.id).unwrap();
            message.success(
              "Charge distribuée avec succès! Appels de fonds générés.",
            );
          } catch (error: any) {
            console.error("Failed to distribute charge", error);
            message.error(
              error?.data?.message ||
                "Erreur lors de la distribution de la charge",
            );
          }
        },
      });
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setRecuBase64(null);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    const payload = {
      type: values.type,
      montant: Number(values.montant),
      periode: values.periode,
      chargeType: values.chargeType,
      isRecurring: !!values.isRecurring,
      recu: recuBase64,
      immeuble: values.immeubleId
        ? { id: Number(values.immeubleId) }
        : undefined,
    };
    console.log("Final Payload for save:", payload);

    try {
      if (editingId) {
        await updateCharge({ id: editingId, ...payload }).unwrap();
        messageApi.success("Charge modifiée avec succès");
      } else {
        await addCharge({ immeubleId: values.immeubleId, ...payload }).unwrap();
        messageApi.success("Charge ajoutée avec succès");
      }
      setIsModalOpen(false);
      setEditingId(null);
      setRecuBase64(null);
      form.resetFields();
    } catch (error: any) {
      console.error("Failed to save charge", error);
      messageApi.error(
        error?.data?.message ||
          (editingId
            ? "Erreur lors de la modification"
            : "Erreur lors de l'ajout de la charge"),
      );
    }
  };

  // ─── Email Notification Logic ───
  const getProprietairesForCharge = (charge: Charge): UserInfo[] => {
    if (!apartments || !users) return [];
    const immeubleId = charge.immeuble?.id;
    if (!immeubleId) return [];

    // Get proprietaire IDs from apartments in this building
    const proprietaireIds = new Set<number>();
    apartments.forEach((apt: Appartement) => {
      if (apt.immeuble?.id === immeubleId && apt.proprietaire?.id) {
        proprietaireIds.add(apt.proprietaire.id);
      }
    });

    // Filter users: active PROPRIETAIRE only
    return users.filter(
      (u: UserInfo) =>
        proprietaireIds.has(u.id) && u.active && u.role === "PROPRIETAIRE",
    );
  };

  const handleOpenEmailModal = (charge: Charge) => {
    setSelectedCharge(charge);
    emailForm.resetFields();
    emailForm.setFieldsValue({
      subject: `Avis de Charge - ${charge.type}`,
      body: `Bonjour, vous avez une nouvelle charge de ${charge.montant} DH pour ${charge.type}.`,
    });
    setIsEmailModalOpen(true);
  };

  const handleOwnerSelect = async (userId: number) => {
    if (!users || !selectedCharge) return;
    const owner = users.find((u: UserInfo) => u.id === userId);
    if (owner) {
      emailForm.setFieldsValue({ targetEmail: owner.email });
      try {
        const aiResponse = await generateEmail({
          ownerName: `${owner.prenom} ${owner.nom}`,
          chargeType: selectedCharge.type,
          amount: selectedCharge.montant,
          periode: selectedCharge.periode,
        }).unwrap();

        emailForm.setFieldsValue({
          body: aiResponse.content,
        });
      } catch (error) {
        console.error("AI Generation failed", error);
        // Fallback to simple French if AI fails
        emailForm.setFieldsValue({
          body: `Bonjour ${owner.prenom}, vous avez une nouvelle charge de ${selectedCharge.montant} DH pour ${selectedCharge.type}.`,
        });
      }
    }
  };
  const handleSendEmail = async (values: any) => {
    try {
      await sendNotification({
        targetEmail: values.targetEmail,
        subject: values.subject,
        body: values.body,
      }).unwrap();
      messageApi.success("Email envoyé avec succès !");
      setIsEmailModalOpen(false);
      emailForm.resetFields();
      setSelectedCharge(null);
    } catch (error: any) {
      console.error("Failed to send email", error);
      messageApi.error(
        error?.data?.error || "Erreur lors de l'envoi de l'email.",
      );
    }
  };

  return (
    <>
      {contextHolder}
      <Card
        title="Gestion des Charges"
        extra={
          currentUser?.role !== "SUPERADMIN" && (
            <AddButton onClick={showModal} />
          )
        }
      >
        <div style={{ padding: "20px" }}>
          <table
            ref={tableRef}
            id="myTable"
            className="display"
            style={{ width: "100%" }}
          >
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
                <th>Reçu</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {charges?.map((charge: Charge) => (
                <tr key={charge.id}>
                  <td>{charge.id}</td>
                  <td>
                    <b>{charge.type}</b>
                  </td>
                  <td>
                    {charge.chargeType && (
                      <Tag
                        color={
                          charge.chargeType === "MONTHLY"
                            ? "blue"
                            : charge.chargeType === "EXCEPTIONNEL"
                              ? "red"
                              : "orange"
                        }
                      >
                        {charge.chargeType}
                      </Tag>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {charge.isRecurring ? (
                      <CheckCircleOutlined
                        style={{ color: "green", fontSize: "16px" }}
                      />
                    ) : (
                      <CloseCircleOutlined
                        style={{ color: "#ccc", fontSize: "16px" }}
                      />
                    )}
                  </td>
                  <td>
                    <Tag color="green">{charge.montant} MAD</Tag>
                  </td>
                  <td>{charge.periode}</td>
                  <td>
                    <Tag color="blue">{charge.immeuble?.nom || "N/A"}</Tag>
                  </td>
                  <td>
                    <Progress
                      percent={Math.round(charge.progress || 0)}
                      size="small"
                      steps={5}
                      strokeColor={charge.diviser !== 1 ? "#ccc" : undefined}
                      format={(percent) =>
                        charge.diviser !== 1 ? "ND" : `${percent}%`
                      }
                    />
                  </td>
                  <td>
                    {charge.recu ? (
                      <Tooltip title="Voir le reçu (Photo/PDF)">
                        <Button
                          icon={<EyeOutlined />}
                          onClick={() => handleViewReceipt(charge.recu!)}
                          style={{ color: "#eb2f96", borderColor: "#eb2f96" }}
                        />
                      </Tooltip>
                    ) : (
                      <span
                        style={{
                          color: "#999",
                          fontSize: "12px",
                          fontStyle: "italic",
                        }}
                      >
                        Aucun reçu
                      </span>
                    )}
                  </td>
                  <td style={{ display: "flex", gap: "8px" }}>
                    {/* Distribute & Email: SUPERADMIN only */}
                    {currentUser?.role === "SUPERADMIN" && (
                      <>
                        <DistributeButton
                          onClick={() => handleDistributeToggle(charge)}
                          disabled={charge.locked}
                          title={
                            charge.locked
                              ? "Charge verrouillée (paiements existants)"
                              : charge.diviser === 1
                                ? "Annuler la distribution"
                                : "Distribuer aux appartements"
                          }
                          label={
                            charge.diviser === 1 ? "Annuler" : "Distribuer"
                          }
                          isUndo={charge.diviser === 1}
                        />
                        <Tooltip title="Envoyer par email">
                          <Button
                            type="primary"
                            ghost
                            icon={<MailOutlined />}
                            onClick={() => handleOpenEmailModal(charge)}
                            style={{ borderColor: "#1890ff", color: "#1890ff" }}
                            disabled={charge.diviser !== 1}
                          />
                        </Tooltip>
                      </>
                    )}

                    {/* Edit & Delete: Syndic (ADMIN) only */}
                    {currentUser?.role !== "SUPERADMIN" && (
                      <>
                        <EditButton
                          onClick={() => handleEdit(charge)}
                          disabled={charge.locked || charge.diviser === 1}
                          title={
                            charge.locked
                              ? "Paiements en cours"
                              : charge.diviser === 1
                                ? "Charge déjà distribuée"
                                : "Modifier"
                          }
                        />
                        <DeleteButton
                          onClick={() => handleDelete(charge)}
                          disabled={charge.locked || charge.diviser === 1}
                          title={
                            charge.locked
                              ? "Paiements en cours"
                              : charge.diviser === 1
                                ? "Charge déjà distribuée"
                                : "Supprimer"
                          }
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
          title={
            editingId ? "Modifier la charge" : "Ajouter une nouvelle charge"
          }
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
              rules={[
                {
                  required: true,
                  message: "Veuillez entrer le type (ex: Eau, Électricité)!",
                },
              ]}
            >
              <Input placeholder="Ex: Électricité" />
            </Form.Item>

            <Form.Item
              label="Montant (MAD)"
              name="montant"
              rules={[
                { required: true, message: "Veuillez entrer le montant!" },
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Ex: 500"
              />
            </Form.Item>

            <Form.Item
              label="Période"
              name="periode"
              rules={[
                { required: true, message: "Veuillez entrer la période!" },
              ]}
            >
              <Input placeholder="Ex: Janvier 2024" />
            </Form.Item>

            <Form.Item
              label="Immeuble"
              name="immeubleId"
              rules={[
                {
                  required: true,
                  message: "Veuillez sélectionner un immeuble!",
                },
              ]}
            >
              <Select
                showSearch
                placeholder="Sélectionner un immeuble"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
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
              rules={[
                {
                  required: true,
                  message: "Veuillez sélectionner une catégorie!",
                },
              ]}
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

            <Form.Item label="Pièce jointe (Reçu PDF/Image)">
              <Upload
                beforeUpload={handleFileUpload}
                maxCount={1}
                showUploadList={false}
                accept=".pdf,image/*"
              >
                <Button icon={<UploadOutlined />}>
                  {recuBase64 ? "Remplacer le fichier" : "Choisir un fichier"}
                </Button>
              </Upload>
              {recuBase64 && (
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <span style={{ color: "#52c41a" }}>Fichier chargé</span>
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={() => setRecuBase64(null)}
                    style={{ padding: 0 }}
                  >
                    Supprimer
                  </Button>
                </div>
              )}
            </Form.Item>

            <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
              <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                Annuler
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<DollarOutlined />}
                loading={isLoadingAdd || isLoadingUpdate}
              >
                Enregistrer
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* ─── Email Notification Modal ─── */}
        <Modal
          title={
            <span>
              <MailOutlined style={{ marginRight: 8, color: "#1890ff" }} />
              Envoyer une notification par email
            </span>
          }
          open={isEmailModalOpen}
          onCancel={() => {
            setIsEmailModalOpen(false);
            emailForm.resetFields();
            setSelectedCharge(null);
          }}
          footer={null}
          width={600}
        >
          <Form
            form={emailForm}
            layout="vertical"
            onFinish={handleSendEmail}
            autoComplete="off"
          >
            {/* Owner Select */}
            <Form.Item
              label="Propriétaire"
              name="ownerId"
              rules={[
                {
                  required: true,
                  message: "Veuillez sélectionner un propriétaire!",
                },
              ]}
            >
              <Select
                showSearch
                placeholder="Sélectionner un propriétaire"
                optionFilterProp="children"
                onChange={(value: number) => handleOwnerSelect(value)}
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={
                  selectedCharge
                    ? getProprietairesForCharge(selectedCharge).map(
                        (u: UserInfo) => ({
                          value: u.id,
                          label: `${u.prenom} ${u.nom} (${u.email})`,
                        }),
                      )
                    : []
                }
              />
            </Form.Item>

            {/* Target Email (auto-filled, read-only) */}
            <Form.Item
              label="Email du destinataire"
              name="targetEmail"
              rules={[
                { required: true, message: "L'email est obligatoire!" },
                { type: "email", message: "Veuillez entrer un email valide!" },
              ]}
            >
              <Input
                readOnly
                placeholder="Sélectionnez un propriétaire ci-dessus"
              />
            </Form.Item>

            {/* Subject */}
            <Form.Item
              label="Sujet"
              name="subject"
              rules={[{ required: true, message: "Le sujet est obligatoire!" }]}
            >
              <Input placeholder="Sujet de l'email" />
            </Form.Item>

            {/* Message Body */}
            <Form.Item
              label="Message"
              name="body"
              rules={[
                { required: true, message: "Le message est obligatoire!" },
              ]}
            >
              <Spin
                spinning={isGeneratingAI}
                tip="IA génère le message en arabe..."
              >
                <Input.TextArea
                  rows={5}
                  placeholder="Votre message..."
                  style={{ resize: "vertical" }}
                />
              </Spin>
            </Form.Item>

            <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
              <Button
                onClick={() => {
                  setIsEmailModalOpen(false);
                  emailForm.resetFields();
                  setSelectedCharge(null);
                }}
                style={{ marginRight: 8 }}
              >
                Annuler
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSendingEmail || isGeneratingAI}
                icon={<SendOutlined />}
                style={{ background: "#1890ff" }}
              >
                {isSendingEmail ? "Envoi en cours..." : "Envoyer"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Card>

      {/* ─── Receipt Modal (Preview) ─── */}
      <Modal
        title="Justificatif de la Charge"
        open={isReceiptModalOpen}
        onCancel={() => setIsReceiptModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsReceiptModalOpen(false)}>
            Fermer
          </Button>,
        ]}
        width={800}
      >
        {currentReceipt ? (
          <div style={{ textAlign: "center" }}>
            {currentReceipt.startsWith("data:application/pdf") ? (
              <iframe
                src={currentReceipt}
                width="100%"
                height="600px"
                style={{ border: "none" }}
                title="Reçu PDF"
              />
            ) : (
              <img
                src={currentReceipt}
                alt="Justificatif"
                style={{ maxWidth: "100%", maxHeight: "70vh" }}
              />
            )}
          </div>
        ) : (
          <p>Aucun document à afficher.</p>
        )}
      </Modal>
    </>
  );
};

export default ChargeList;
