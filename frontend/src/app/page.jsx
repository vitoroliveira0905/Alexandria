"use client"

import { useEffect, useMemo, useState } from "react"
import { BookOpen, Search, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useBooks } from "@/hooks/useBooks"

const FEATURED_TAGS = ["Clube do livro", "Leitura guiada", "Recomendado"]

function getAvailability(quantity) {
  if (quantity === 0) {
    return { label: "Indisponivel", variant: "destructive" }
  }

  if (quantity <= 2) {
    return { label: "Ultimas copias", variant: "secondary" }
  }

  return { label: "Disponivel", variant: "default" }
}

function BookCover({ title }) {
  const initial = title?.trim()?.charAt(0)?.toUpperCase() || "L"

  return (
    <div className="relative flex aspect-[4/5] w-full items-end justify-start overflow-hidden rounded-xl border bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(148,114,52,0.8))] p-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]" />
      <span className="relative text-4xl font-semibold tracking-tight">
        {initial}
      </span>
    </div>
  )
}

export default function Home() {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const limit = 12

  const { books, total, loading, error, loadBooks } = useBooks({ limit })

  useEffect(() => {
    loadBooks(page).catch(() => undefined)
  }, [loadBooks, page])

  const filteredBooks = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      return books
    }

    return books.filter((book) => {
      const title = book.title?.toLowerCase() || ""
      const author = book.author_name?.toLowerCase() || ""
      const category = book.category_name?.toLowerCase() || ""
      const isbn = book.isbn?.toLowerCase() || ""

      return (
        title.includes(normalized) ||
        author.includes(normalized) ||
        category.includes(normalized) ||
        isbn.includes(normalized)
      )
    })
  }, [books, query])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top,_rgba(154,120,52,0.25),_transparent_55%),radial-gradient(circle_at_20%_20%,_rgba(15,23,42,0.12),_transparent_45%)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-6 rounded-3xl border bg-card/90 p-6 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <BookOpen className="size-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Biblioteca Alexandria
              </p>
              <h1 className="text-2xl font-semibold text-foreground">
                Catalogo para leitores
              </h1>
              <p className="text-sm text-muted-foreground">
                Descubra titulos, verifique disponibilidade e salve seus favoritos.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="text-sm text-muted-foreground">
              Total disponivel:{" "}
              <span className="font-semibold text-foreground">{total}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Pagina {page} de {totalPages}
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <Card className="h-fit border bg-card/90 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                Em destaque
              </CardTitle>
              <CardDescription>
                Programas e colecoes pensados para novos leitores.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {FEATURED_TAGS.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center justify-between rounded-xl border bg-muted/30 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-foreground">{tag}</span>
                  <Badge variant="outline">Novo</Badge>
                </div>
              ))}
            </CardContent>
            <CardFooter className="justify-between">
              <span className="text-xs text-muted-foreground">
                Atualiza semanalmente
              </span>
              <Button variant="ghost" size="sm">
                Ver agenda
              </Button>
            </CardFooter>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="border bg-card/90 shadow-sm backdrop-blur">
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Explore o acervo</CardTitle>
                    <CardDescription>
                      Busque por titulo, autor, categoria ou ISBN.
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Search className="size-3" />
                    Pesquisa rapida
                  </Badge>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Input
                    placeholder="Digite um termo"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => loadBooks(page)}
                    disabled={loading}
                  >
                    {loading ? "Atualizando" : "Atualizar"}
                  </Button>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                {error ? (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                ) : null}
                {filteredBooks.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    {loading
                      ? "Carregando livros..."
                      : "Nenhum livro encontrado para essa busca."}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredBooks.map((book) => {
                      const availability = getAvailability(book.quantity ?? 0)

                      return (
                        <Card key={book.id} className="h-full">
                          <CardHeader className="gap-3">
                            <BookCover title={book.title} />
                            <div className="flex flex-col gap-2">
                              <CardTitle className="text-lg">
                                {book.title}
                              </CardTitle>
                              <CardDescription>
                                {book.author_name || "Autor nao informado"}
                              </CardDescription>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">
                                  {book.category_name || "Sem categoria"}
                                </Badge>
                                <Badge variant={availability.variant}>
                                  {availability.label}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>ISBN</span>
                              <span className="font-medium text-foreground">
                                {book.isbn || "--"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Ano</span>
                              <span className="font-medium text-foreground">
                                {book.published_year || "--"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Copias disponiveis</span>
                              <span className="font-medium text-foreground">
                                {book.quantity ?? 0}
                              </span>
                            </div>
                          </CardContent>
                          <CardFooter className="flex items-center justify-between">
                            <Button variant="ghost" size="sm">
                              Detalhes
                            </Button>
                            <Button size="sm" disabled={(book.quantity ?? 0) === 0}>
                              Reservar
                            </Button>
                          </CardFooter>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
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
          </div>
        </section>
      </div>
    </div>
  )
}
