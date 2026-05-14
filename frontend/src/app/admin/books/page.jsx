"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BookOpen,
  PencilLine,
  Plus,
  RefreshCcw,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useBooks } from "@/hooks/useBooks"

const emptyForm = {
  title: "",
  isbn: "",
  author_id: "",
  category_id: "",
  quantity: "1",
  published_year: "",
}

function toNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

export default function AdminBooksPage() {
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState("")
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const limit = 10

  const {
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
  } = useBooks({ limit })

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const filteredBooks = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return books
    }

    return books.filter((book) => {
      const title = book.title?.toLowerCase() || ""
      const author = book.author_name?.toLowerCase() || ""
      const category = book.category_name?.toLowerCase() || ""
      return (
        title.includes(normalized) ||
        author.includes(normalized) ||
        category.includes(normalized)
      )
    })
  }, [books, query])

  useEffect(() => {
    loadBooks(page)
  }, [loadBooks, page])

  function handleFormChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function startEdit(book) {
    setEditingId(book.id)
    setForm({
      title: book.title ?? "",
      isbn: book.isbn ?? "",
      author_id: book.author_id?.toString() ?? "",
      category_id: book.category_id?.toString() ?? "",
      quantity: book.quantity?.toString() ?? "1",
      published_year: book.published_year?.toString() ?? "",
    })
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    try {
      const payload = {
        title: form.title.trim(),
        isbn: form.isbn.trim() || undefined,
        author_id: toNumber(form.author_id),
        category_id: toNumber(form.category_id),
        quantity: toNumber(form.quantity),
        published_year: toNumber(form.published_year),
      }

      if (!payload.title || !payload.author_id) {
        throw new Error("Preencha titulo e author_id.")
      }

      await saveBook({ id: editingId, payload })
      resetForm()
      await loadBooks(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    }
  }

  async function handleDelete(book) {
    const confirmed = window.confirm(
      `Remover o livro "${book.title}" do acervo?`
    )

    if (!confirmed) {
      return
    }

    try {
      await removeBook(book.id)
      await loadBooks(page)
    } catch {
      // O erro ja e exposto no hook.
    }
  }

  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top,_rgba(191,160,94,0.25),_transparent_55%),radial-gradient(circle_at_20%_20%,_rgba(15,23,42,0.08),_transparent_40%)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-4 rounded-3xl border bg-card/90 px-6 py-6 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <BookOpen className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Administracao
              </p>
              <h1 className="text-2xl font-semibold text-foreground">CRUD de Livros</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie o acervo, autores e disponibilidade do catalogo.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="text-sm text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{total}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Pagina {page} de {totalPages}
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="rounded-3xl border bg-card/90 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {editingId ? "Editar livro" : "Novo livro"}
              </h2>
              {editingId ? (
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  Cancelar
                </Button>
              ) : null}
            </div>
            <Separator className="my-4" />
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">Titulo</FieldLabel>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Ex: Dom Casmurro"
                    value={form.title}
                    onChange={handleFormChange}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="author_id">Autor ID</FieldLabel>
                  <Input
                    id="author_id"
                    name="author_id"
                    placeholder="Ex: 1"
                    value={form.author_id}
                    onChange={handleFormChange}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="category_id">Categoria ID</FieldLabel>
                  <Input
                    id="category_id"
                    name="category_id"
                    placeholder="Ex: 2"
                    value={form.category_id}
                    onChange={handleFormChange}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="isbn">ISBN</FieldLabel>
                  <Input
                    id="isbn"
                    name="isbn"
                    placeholder="9788525406958"
                    value={form.isbn}
                    onChange={handleFormChange}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="quantity">Quantidade</FieldLabel>
                    <Input
                      id="quantity"
                      name="quantity"
                      value={form.quantity}
                      onChange={handleFormChange}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="published_year">Ano</FieldLabel>
                    <Input
                      id="published_year"
                      name="published_year"
                      placeholder="1899"
                      value={form.published_year}
                      onChange={handleFormChange}
                    />
                  </Field>
                </div>
              </FieldGroup>
              {error ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              ) : null}
              <Button type="submit" disabled={saving} className="gap-2">
                {editingId ? <PencilLine className="size-4" /> : <Plus className="size-4" />}
                {saving ? "Salvando..." : editingId ? "Atualizar" : "Cadastrar"}
              </Button>
            </form>
          </section>

          <section className="rounded-3xl border bg-card/90 p-6 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Livros cadastrados</h2>
                <p className="text-sm text-muted-foreground">
                  Atualize dados, consulte autores e controle o estoque.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  placeholder="Buscar por titulo, autor ou categoria"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => loadBooks(page)}
                  disabled={loading}
                >
                  <RefreshCcw className="size-4" />
                  {loading ? "Atualizando" : "Atualizar"}
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="overflow-hidden rounded-2xl border">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <span>Titulo</span>
                <span>Autor</span>
                <span>Categoria</span>
                <span>Qtd</span>
                <span className="text-right">Acoes</span>
              </div>
              <div className="divide-y">
                {filteredBooks.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                    {loading ? "Carregando livros..." : "Nenhum livro encontrado."}
                  </div>
                ) : (
                  filteredBooks.map((book) => (
                    <div
                      key={book.id}
                      className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-3 px-4 py-3 text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{book.title}</span>
                        <span className="text-xs text-muted-foreground">
                          ISBN {book.isbn || "--"} Ano {book.published_year || "--"}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {book.author_name || `#${book.author_id}`}
                      </span>
                      <span className="text-muted-foreground">
                        {book.category_name || (book.category_id ? `#${book.category_id}` : "--")}
                      </span>
                      <span className="text-muted-foreground">{book.quantity}</span>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => startEdit(book)}
                          aria-label="Editar livro"
                        >
                          <PencilLine className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          onClick={() => handleDelete(book)}
                          disabled={deletingId === book.id}
                          aria-label="Remover livro"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>
                Exibindo {filteredBooks.length} de {total} livros
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                >
                  Proxima
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
