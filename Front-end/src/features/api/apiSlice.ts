import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL}),
  tagTypes: ['Buildings', 'Users', 'Apartments', 'Charges', 'AppelCharges', 'Paiements'],
  endpoints: (builder) => ({
    getBuildings: builder.query({
      query: () => '/immeubles',
      providesTags: ['Buildings'],
    }),
    addBuilding: builder.mutation({
      query: (initialBuilding) => ({
        url: '/immeubles',
        method: 'POST',
        body: initialBuilding,
      }),
      invalidatesTags: ['Buildings'],
    }),
    updateBuilding: builder.mutation({
      query: ({ id, ...initialBuilding }) => ({
        url: `/immeubles/${id}`,
        method: 'PUT',
        body: initialBuilding,
      }),
      invalidatesTags: ['Buildings'],
    }),
    deleteBuilding: builder.mutation({
      query: (id) => ({
        url: `/immeubles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Buildings'],
    }),
    getUsers: builder.query({
      query: () => '/users',
      providesTags: ['Users'],
    }),
    addUser: builder.mutation({
      query: (initialUser) => ({
        url: '/users',
        method: 'POST',
        body: initialUser,
      }),
      invalidatesTags: ['Users'],
    }),
    toggleUserStatus: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/toggle-status`,
        method: 'PUT',
      }),
      invalidatesTags: ['Users'],
    }),
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getApartments: builder.query({
      query: () => '/appartements',
      providesTags: ['Apartments'],
    }),
    addApartment: builder.mutation({
      query: ({ immeubleId, ...initialApartment }) => ({
        url: `/appartements/immeuble/${immeubleId}`,
        method: 'POST',
        body: initialApartment,
      }),
      invalidatesTags: ['Apartments', 'Buildings'],
    }),
    updateApartment: builder.mutation({
      query: ({ id, ...initialApartment }) => ({
        url: `/appartements/${id}`,
        method: 'PUT',
        body: initialApartment,
      }),
      invalidatesTags: ['Apartments'],
    }),
    assignProprietaire: builder.mutation({
      query: ({ id, proprietaireId }) => ({
        url: `/appartements/${id}/proprietaire/${proprietaireId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Apartments'],
    }),
    getCharges: builder.query({
      query: () => '/charges',
      providesTags: ['Charges'],
    }),
    addCharge: builder.mutation({
      query: ({ immeubleId, ...initialCharge }) => ({
        url: `/charges/immeuble/${immeubleId}`,
        method: 'POST',
        body: initialCharge,
      }),
      invalidatesTags: ['Charges'],
    }),
    updateCharge: builder.mutation({
      query: ({ id, ...initialCharge }) => ({
        url: `/charges/${id}`,
        method: 'PUT',
        body: initialCharge,
      }),
      invalidatesTags: ['Charges'],
    }),
    deleteCharge: builder.mutation({
      query: (id) => ({
        url: `/charges/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Charges'],
    }),
    distributeCharge: builder.mutation({
      query: (id) => ({
        url: `/charges/${id}/distribute`,
        method: 'POST',
      }),
      invalidatesTags: ['Charges', 'AppelCharges'],
    }),
    undoDistributeCharge: builder.mutation({
      query: (id) => ({
        url: `/charges/${id}/undo-distribute`,
        method: 'POST',
      }),
      invalidatesTags: ['Charges', 'AppelCharges'],
    }),
    addPayment: builder.mutation({
      query: ({ userId, appartementId, appelChargeId, ...paymentData }) => ({
        url: `/paiements/user/${userId}/appartement/${appartementId}/appel-charge/${appelChargeId}`,
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['AppelCharges', 'Paiements'],
    }),
    getAppelCharges: builder.query({
      query: () => '/appel-charges',
      providesTags: ['AppelCharges'],
    }),
    getPaiements: builder.query({
      query: () => '/paiements',
      providesTags: ['Paiements'],
    }),
    // ─── NEW: Proprietaire Payment Endpoints ───
    getPaiementsByProprietaire: builder.query({
      query: (proprietaireId) => `/paiements/proprietaire/${proprietaireId}`,
      providesTags: ['Paiements'],
    }),
    // ─── NEW: Send Email Notification to Owner ───
    sendNotification: builder.mutation({
      query: (mailRequest) => ({
        url: '/notifications/send-to-owner',
        method: 'POST',
        body: mailRequest,
      }),
    }),
  }),
});

export const {
  useGetBuildingsQuery,
  useAddBuildingMutation,
  useUpdateBuildingMutation,
  useDeleteBuildingMutation,
  useGetUsersQuery,
  useAddUserMutation,
  useToggleUserStatusMutation,
  useGetApartmentsQuery,
  useAddApartmentMutation,
  useUpdateApartmentMutation,
  useAssignProprietaireMutation,
  useGetChargesQuery,
  useAddChargeMutation,
  useUpdateChargeMutation,
  useDeleteChargeMutation,
  useDistributeChargeMutation,
  useUndoDistributeChargeMutation,
  useGetAppelChargesQuery,
  useLoginUserMutation,
  useAddPaymentMutation,
  useGetPaiementsQuery,
  useGetPaiementsByProprietaireQuery,
  useSendNotificationMutation,
} = apiSlice;
