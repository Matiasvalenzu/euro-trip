import { useState, useEffect, useCallback } from 'react'
import type { TravelData } from '../types/travel'
import {
  fetchAllTravelData,
  getStoredExchangeRate,
  getStoredSheetId,
  isForceMock,
  loadCachedData,
  saveCachedData,
  setStoredExchangeRate,
  setStoredSheetId,
  setForceMock
} from '../services/gsheets'
import { DEFAULT_MOCK_DATA } from '../services/mockData'

export function useTravelData() {
  const [sheetId, setSheetIdState] = useState<string>(getStoredSheetId())
  const [exchangeRate, setExchangeRateState] = useState<number>(getStoredExchangeRate())
  const [useMock, setUseMockState] = useState<boolean>(isForceMock())

  // Initial data: cached data if available, otherwise mock data
  const [data, setData] = useState<TravelData>(() => {
    const cached = loadCachedData()
    if (cached) return cached
    return DEFAULT_MOCK_DATA
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Sync data function
  const refreshData = useCallback(async (isManual: boolean = false) => {
    if (useMock) {
      setData({ ...DEFAULT_MOCK_DATA, lastUpdated: Date.now() })
      setSyncError(null)
      return
    }

    if (!navigator.onLine) {
      setSyncError('Sin conexión a internet. Mostrando copia guardada en el dispositivo.')
      return
    }

    if (isManual) {
      setIsLoading(true)
    } else {
      setIsSyncing(true)
    }
    setSyncError(null)

    try {
      const fresh = await fetchAllTravelData(sheetId)
      setData(fresh)
      saveCachedData(fresh)
      setSyncError(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al sincronizar con Google Sheets'
      console.warn('Sync failed:', msg)
      setSyncError(msg)
      // If we don't have any data yet, ensure mock is displayed
      if (!data || data.itinerario.length === 0) {
        setData(DEFAULT_MOCK_DATA)
      }
    } finally {
      setIsLoading(false)
      setIsSyncing(false)
    }
  }, [sheetId, useMock, data])

  // Run initial background sync
  useEffect(() => {
    refreshData(false)
  }, [sheetId, useMock])

  // Sheet ID updater
  const updateSheetId = (newId: string) => {
    setStoredSheetId(newId)
    setSheetIdState(getStoredSheetId())
  }

  // Exchange rate updater
  const updateExchangeRate = (newRate: number) => {
    setStoredExchangeRate(newRate)
    setExchangeRateState(newRate)
  }

  // Toggle mock mode
  const toggleMockMode = (val: boolean) => {
    setForceMock(val)
    setUseMockState(val)
  }

  return {
    data,
    sheetId,
    exchangeRate,
    useMock,
    isLoading,
    isSyncing,
    syncError,
    isOnline,
    refreshData: () => refreshData(true),
    updateSheetId,
    updateExchangeRate,
    toggleMockMode
  }
}
