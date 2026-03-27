"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { BusinessCategoryForm } from "@/components/forms/business-category-form";
import { ProductAddonForm } from "@/components/forms/product-addon-form";
import { ProductForm } from "@/components/forms/product-form";
import { PageHeader } from "@/components/layout/page-header";
import { CompanyScopeSelect } from "@/components/shared/company-scope-select";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAddons, useBusinessMutations, useCategories, useProducts } from "@/hooks/use-business";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrencyBrl } from "@/lib/formatters";
import type { Product, ProductAddon, ProductCategory } from "@/types/business";

export default function MenuPage() {
  const companyId = useCompanyScope();
  const categoriesQuery = useCategories(companyId);
  const productsQuery = useProducts(companyId);
  const addonsQuery = useAddons(companyId);
  const mutations = useBusinessMutations(companyId);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingAddon, setEditingAddon] = useState<ProductAddon | null>(null);

  if (categoriesQuery.isLoading || productsQuery.isLoading || addonsQuery.isLoading) {
    return <LoadingState label="Carregando cardápio..." description="Buscando categorias, produtos e adicionais da loja." />;
  }

  if (categoriesQuery.error || productsQuery.error || addonsQuery.error) {
    return (
      <ErrorState
        description="Não foi possível carregar o cardápio da loja."
        onRetry={() => {
          void categoriesQuery.refetch();
          void productsQuery.refetch();
          void addonsQuery.refetch();
        }}
      />
    );
  }

  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const addons = addonsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cardápio"
        title="Cardápio da loja"
        description="Cadastre categorias, produtos, preços e adicionais para o atendimento responder com o cardápio sempre atualizado."
      />
      <CompanyScopeSelect />

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Categorias"
          description="Organize o cardápio por grupos como lanches, marmitas, bebidas e combos."
          actions={
            <Dialog onOpenChange={(open) => !open && setEditingCategory(null)}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCategory ? "Editar categoria" : "Nova categoria"}</DialogTitle>
                  <DialogDescription>Crie um grupo para organizar melhor os produtos.</DialogDescription>
                </DialogHeader>
                <BusinessCategoryForm
                  category={editingCategory}
                  loading={mutations.createCategoryMutation.isPending || mutations.updateCategoryMutation.isPending}
                  onSubmit={async (values) => {
                    try {
                      if (editingCategory) {
                        await mutations.updateCategoryMutation.mutateAsync({ id: editingCategory.id, payload: values });
                        toast.success("Categoria atualizada");
                      } else {
                        await mutations.createCategoryMutation.mutateAsync(values);
                        toast.success("Categoria criada");
                      }
                      setEditingCategory(null);
                    } catch (error) {
                      toast.error(getErrorMessage(error, "Não foi possível salvar a categoria."));
                    }
                  }}
                />
              </DialogContent>
            </Dialog>
          }
        >
          {categories.length ? (
            <DataTable
              rowKey={(item) => item.id}
              data={categories}
              columns={[
                { key: "name", header: "Categoria", cell: (item) => <span className="font-medium">{item.name}</span> },
                {
                  key: "active",
                  header: "Status",
                  cell: (item) => <Badge variant={item.active ? "success" : "neutral"}>{item.active ? "Ativa" : "Inativa"}</Badge>
                },
                {
                  key: "actions",
                  header: "Ação",
                  cell: (item) => (
                    <Button variant="outline" size="sm" onClick={() => setEditingCategory(item)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Editar
                    </Button>
                  )
                }
              ]}
            />
          ) : (
            <EmptyState title="Sem categorias" description="Crie a primeira categoria para organizar o cardápio." />
          )}
        </SectionCard>

        <SectionCard
          title="Produtos"
          description="Cadastre itens com preço, descrição, destaque e ordem de exibição."
          actions={
            <Dialog onOpenChange={(open) => !open && setEditingProduct(null)}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Editar produto" : "Novo produto"}</DialogTitle>
                  <DialogDescription>Adicione produtos e preços usados no atendimento do delivery.</DialogDescription>
                </DialogHeader>
                <ProductForm
                  categories={categories}
                  product={editingProduct}
                  loading={mutations.createProductMutation.isPending || mutations.updateProductMutation.isPending}
                  onSubmit={async (values) => {
                    try {
                      const payload = {
                        ...values,
                        category_id: values.category_id || null,
                        description: values.description || null,
                        promotional_price: values.promotional_price ?? null
                      };
                      if (editingProduct) {
                        await mutations.updateProductMutation.mutateAsync({ id: editingProduct.id, payload });
                        toast.success("Produto atualizado");
                      } else {
                        await mutations.createProductMutation.mutateAsync(payload);
                        toast.success("Produto criado");
                      }
                      setEditingProduct(null);
                    } catch (error) {
                      toast.error(getErrorMessage(error, "Não foi possível salvar o produto."));
                    }
                  }}
                />
              </DialogContent>
            </Dialog>
          }
        >
          {products.length ? (
            <DataTable
              rowKey={(item) => item.id}
              data={products}
              columns={[
                { key: "name", header: "Produto", cell: (item) => <span className="font-medium">{item.name}</span> },
                { key: "price", header: "Preço", cell: (item) => formatCurrencyBrl(item.promotional_price ?? item.price) },
                {
                  key: "featured",
                  header: "Destaque",
                  cell: (item) => <Badge variant={item.featured ? "warning" : "neutral"}>{item.featured ? "Sim" : "Não"}</Badge>
                },
                {
                  key: "active",
                  header: "Status",
                  cell: (item) => <Badge variant={item.active ? "success" : "neutral"}>{item.active ? "Ativo" : "Inativo"}</Badge>
                },
                {
                  key: "actions",
                  header: "Ação",
                  cell: (item) => (
                    <Button variant="outline" size="sm" onClick={() => setEditingProduct(item)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Editar
                    </Button>
                  )
                }
              ]}
            />
          ) : (
            <EmptyState title="Sem produtos" description="Cadastre os produtos que a sua loja vende para responder certo aos clientes." />
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Adicionais"
        description="Cadastre extras, acompanhamentos e opcionais para enriquecer o pedido."
        actions={
          <Dialog onOpenChange={(open) => !open && setEditingAddon(null)}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo adicional
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingAddon ? "Editar adicional" : "Novo adicional"}</DialogTitle>
                <DialogDescription>Associe adicionais aos produtos corretos do cardápio.</DialogDescription>
              </DialogHeader>
              <ProductAddonForm
                products={products}
                addon={editingAddon}
                loading={mutations.createAddonMutation.isPending || mutations.updateAddonMutation.isPending}
                onSubmit={async (values) => {
                  try {
                    if (editingAddon) {
                      await mutations.updateAddonMutation.mutateAsync({ id: editingAddon.id, payload: values });
                      toast.success("Adicional atualizado");
                    } else {
                      await mutations.createAddonMutation.mutateAsync(values);
                      toast.success("Adicional criado");
                    }
                    setEditingAddon(null);
                  } catch (error) {
                    toast.error(getErrorMessage(error, "Não foi possível salvar o adicional."));
                  }
                }}
              />
            </DialogContent>
          </Dialog>
        }
      >
        {addons.length ? (
          <DataTable
            rowKey={(item) => item.id}
            data={addons}
            columns={[
              { key: "name", header: "Adicional", cell: (item) => <span className="font-medium">{item.name}</span> },
              {
                key: "product_id",
                header: "Produto",
                cell: (item) => products.find((product) => product.id === item.product_id)?.name ?? `#${item.product_id}`
              },
              { key: "price", header: "Preço", cell: (item) => formatCurrencyBrl(item.price) },
              {
                key: "active",
                header: "Status",
                cell: (item) => <Badge variant={item.active ? "success" : "neutral"}>{item.active ? "Ativo" : "Inativo"}</Badge>
              },
              {
                key: "actions",
                header: "Ação",
                cell: (item) => (
                  <Button variant="outline" size="sm" onClick={() => setEditingAddon(item)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Editar
                  </Button>
                )
              }
            ]}
          />
        ) : (
          <EmptyState title="Sem adicionais" description="Adicione extras para deixar o cardápio mais completo." />
        )}
      </SectionCard>
    </div>
  );
}
