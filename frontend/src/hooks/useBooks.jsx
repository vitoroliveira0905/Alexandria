"use client"

import { useCallback, useState } from "react"

const API_BASE_URL = "http://localhost:3001/api"
const AUTH_TOKEN_KEY = "alexandria:authToken"

export function useBooks({ limit = 10 } = {}) {
  const [books, setBooks] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState("")

  const ensureToken = useCallback(() => {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY)

    if (!token) {
      const message = "Token nao encontrado. Faca login para continuar."
      setError(message)
      throw new Error(message)
    }

    return token
  }, [])

  const loadBooks = useCallback(
    async (page = 1) => {
      setLoading(true)
      setError("")

      try {
        const token = ensureToken()
        const response = await fetch(
          `${API_BASE_URL}/books?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.message || "Erro ao carregar livros.")
        }

        setBooks(data?.data ?? [])
        setTotal(data?.total ?? 0)
        return data
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [ensureToken, limit]
  )

  const saveBook = useCallback(
    async ({ id, payload }) => {
      setSaving(true)
      setError("")

      try {
        const token = ensureToken()
        const response = await fetch(
          `${API_BASE_URL}/books${id ? `/${id}` : ""}`,
          {
            method: id ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        )

        const data = response.status === 204 ? null : await response.json()

        if (!response.ok) {
          throw new Error(data?.message || "Erro ao salvar livro.")
        }

        return data
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido")
        throw err
      } finally {
        setSaving(false)
      }
    },
    [ensureToken]
  )

  const removeBook = useCallback(
    async (id) => {
      setDeletingId(id)
      setError("")

      try {
        const token = ensureToken()
        const response = await fetch(`${API_BASE_URL}/books/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const contentType = response.headers.get("content-type") || ""
          let message = `Erro ao remover livro (status ${response.status}).`

          if (contentType.includes("application/json")) {
            const data = await response.json()
            message = data?.message || message
          } else {
            const text = await response.text()
            if (text) {
              message = `${message} ${text.slice(0, 200)}`
            }
          }

          throw new Error(message)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido")
        throw err
      } finally {
        setDeletingId(null)
      }
    },
    [ensureToken]
  )

  return {
    books,
    total,
    loading,
    saving,
    deletingId,
    error,
    setError,
    loadBooks,
    saveBook,
    removeBook,
  }
}
