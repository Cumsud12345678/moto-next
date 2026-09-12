'use client'
import { Metadata } from "@/types/metadata"
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react"
import { api } from '@/lib/axios';

export const useMetadata = () => {

  async function fetchMetadata(): Promise<Metadata> {
    const { data } = await api.get<{data: Metadata, success: boolean}>('/api/metadata');
    return data.data;
  }

  const { data: metadata, isLoading, error } = useQuery<Metadata, Error>({
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
  });

  const usedTypes = [
    {
      _id: '1a',
      label: 'Yeni',
      status: true
    },
    {
      _id: '1b',
      label: 'Surulmus',
      status: false
    }
  ]

  return {
    isLoading,
    error,
    usedTypes,
    metadata
  }

}