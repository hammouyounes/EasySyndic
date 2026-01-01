import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3001' }),
  tagTypes: ['Buildings', 'Users', 'Apartments'],
  endpoints: (builder) => ({
    getBuildings: builder.query({
      query: () => '/immeuble',
      providesTags: ['Buildings'],
    }),
    addBuilding: builder.mutation({
      query: (initialBuilding) => ({
        url: '/immeuble',
        method: 'POST',
        body: initialBuilding,
      }),
      invalidatesTags: ['Buildings'],
    }),
    getUsers: builder.query({
      query: () => '/user',
      providesTags: ['Users'],
    }),
    addUser: builder.mutation({
      query: (initialUser) => ({
        url: '/user',
        method: 'POST',
        body: initialUser,
      }),
      invalidatesTags: ['Users'],
    }),
    getApartments: builder.query({
      query: () => '/appartement',
      providesTags: ['Apartments'],
    }),
    addApartment: builder.mutation({
      query: (initialApartment) => ({
        url: '/appartement',
        method: 'POST',
        body: initialApartment,
      }),
      invalidatesTags: ['Apartments'],
    }),
  }),
});

export const { 
  useGetBuildingsQuery, 
  useAddBuildingMutation,
  useGetUsersQuery,
  useAddUserMutation,
  useGetApartmentsQuery,
  useAddApartmentMutation
} = apiSlice;
