import { useState, useEffect, useCallback } from 'react'
import { toast } from './use-toast'
import api, { queryClient } from '../setup/api'

// Common options for API query hooks
interface ApiQueryOptions {
  invalidateQueries?: string | string[]
  successMessage?: string
  errorMessage?: string
  transformRequest?: (data: any) => any
}

// Simple query state interface
interface QueryState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

// Hook to wrap API GET requests
export const useApiQuery = <T = unknown>(
  url: string,
  options?: Omit<ApiQueryOptions, 'invalidateQueries'> & {
    enabled?: boolean
    dependencies?: any[]
  }
): QueryState<T> => {
  const {
    successMessage,
    errorMessage,
    enabled = true,
    dependencies = [],
  } = options || {}

  const [state, setState] = useState<{
    data: T | null
    isLoading: boolean
    error: Error | null
  }>({
    data: null,
    isLoading: enabled,
    error: null,
  })

  const fetchData = useCallback(async () => {
    if (!enabled) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await api.get(url)
      setState({
        data: response as T,
        isLoading: false,
        error: null,
      })
      if (successMessage) {
        toast({ description: successMessage })
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('An error occurred')
      setState({
        data: null,
        isLoading: false,
        error: err,
      })
      if (errorMessage) {
        toast({
          description: errorMessage,
          variant: 'destructive',
        })
      }
    }
  }, [url, enabled, successMessage, errorMessage, ...dependencies])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    ...state,
    refetch: fetchData,
  }
}

// Simple mutation state interface
interface MutationState<T> {
  mutate: (data?: any) => Promise<T | null>
  isLoading: boolean
  error: Error | null
}

// Hook to wrap API POST requests
export const useApiMutation = <T = unknown, D = unknown>(
  url: string,
  options?: ApiQueryOptions & {
    method?: 'POST' | 'PUT' | 'PATCH'
  }
): MutationState<T> => {
  const {
    invalidateQueries,
    successMessage,
    errorMessage,
    transformRequest,
    method = 'POST',
  } = options || {}

  const [state, setState] = useState<{
    isLoading: boolean
    error: Error | null
  }>({
    isLoading: false,
    error: null,
  })

  const mutate = useCallback(
    async (data?: D): Promise<T | null> => {
      setState({ isLoading: true, error: null })

      try {
        const transformedData = transformRequest ? transformRequest(data) : data
        let response: T

        switch (method) {
          case 'POST':
            response = await api.post(url, transformedData)
            break
          case 'PUT':
            response = await api.put(url, transformedData)
            break
          case 'PATCH':
            response = await api.put(url, transformedData) // Using PUT for PATCH
            break
          default:
            response = await api.post(url, transformedData)
        }

        setState({ isLoading: false, error: null })

        if (successMessage) {
          toast({ description: successMessage })
        }

        // Handle query invalidation
        if (invalidateQueries) {
          if (Array.isArray(invalidateQueries)) {
            invalidateQueries.forEach(query => {
              queryClient.invalidateQueries({ queryKey: [query] })
            })
          } else {
            queryClient.invalidateQueries({ queryKey: [invalidateQueries] })
          }
        }

        return response
      } catch (error) {
        const err = error instanceof Error ? error : new Error('An error occurred')
        setState({ isLoading: false, error: err })

        const message = errorMessage || 'An error occurred'
        toast({ description: message, variant: 'destructive' })

        return null
      }
    },
    [url, method, invalidateQueries, successMessage, errorMessage, transformRequest]
  )

  return {
    mutate,
    isLoading: state.isLoading,
    error: state.error,
  }
}

// Hook to wrap API PUT requests
export const useApiPutMutation = <T = unknown, D = unknown>(
  url: string,
  options?: ApiQueryOptions
): MutationState<T> => {
  return useApiMutation<T, D>(url, { ...options, method: 'PUT' })
}

// Hook to wrap API DELETE requests
export const useApiDeleteMutation = <T = unknown>(
  url: string,
  options?: ApiQueryOptions
): MutationState<T> => {
  const {
    invalidateQueries,
    successMessage,
    errorMessage,
    transformRequest,
  } = options || {}

  const [state, setState] = useState<{
    isLoading: boolean
    error: Error | null
  }>({
    isLoading: false,
    error: null,
  })

  const mutate = useCallback(
    async (id: number | string | Record<string, any>): Promise<T | null> => {
      setState({ isLoading: true, error: null })

      try {
        const transformedData = transformRequest ? transformRequest(id) : id
        let response: T

        if (typeof transformedData === 'object' && transformedData !== null) {
          // If we have an object, use it as request body
          response = await api.delete(url, {
            body: JSON.stringify(transformedData),
            headers: { 'Content-Type': 'application/json' },
          })
        } else {
          // If we just have an ID, add it to the URL
          response = await api.delete(`${url}/${transformedData}`)
        }

        setState({ isLoading: false, error: null })

        if (successMessage) {
          toast({ description: successMessage })
        }

        // Handle query invalidation
        if (invalidateQueries) {
          if (Array.isArray(invalidateQueries)) {
            invalidateQueries.forEach(query => {
              queryClient.invalidateQueries({ queryKey: [query] })
            })
          } else {
            queryClient.invalidateQueries({ queryKey: [invalidateQueries] })
          }
        }

        return response
      } catch (error) {
        const err = error instanceof Error ? error : new Error('An error occurred')
        setState({ isLoading: false, error: err })

        const message = errorMessage || 'An error occurred'
        toast({ description: message, variant: 'destructive' })

        return null
      }
    },
    [url, invalidateQueries, successMessage, errorMessage, transformRequest]
  )

  return {
    mutate,
    isLoading: state.isLoading,
    error: state.error,
  }
}
