"use client";

import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyScope } from "@/hooks/use-company-scope";
import { useOperationalOrderActions, useOperationalOrders } from "@/hooks/use-operations";
import { formatCurrencyBrl, formatDateTime, formatPhoneNumber } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/errors";
import type { OperationalOrder, OperationalOrderStatus } from "@/types/operations";

const columns: Array<{ status: OperationalOrderStatus; title: string; description: string }> = [
  { status: "new", title: "Novo", description: "Pedido recebido e aguardando confirmacao." },
  { status: "confirmed", title: "Confirmado", description: "Pedido validado e pronto para imprimir." },
  { status: "in_preparation", title: "Em preparo", description: "Cozinha ou separacao em andamento." },
  { status: "out_for_delivery", title: "Saiu para entrega", description: "Pedido em rota." },
  { status: "ready_for_pickup", title: "Pronto para retirada", description: "Pedido disponivel no balcao." },
  { status: "completed", title: "Concluido", description: "Pedido encerrado com sucesso." },
  { status: "cancelled", title: "Cancelado", description: "Pedido perdido ou cancelado." }
];

export default function OrdersPage() {
  const companyId = useCompanyScope();
  const ordersQuery = useOperationalOrders(companyId);

  if (ordersQuery.isLoading) {
    return <LoadingState label="Carregando pedidos..." description="Buscando os pedidos estruturados da empresa." />;
  }

  if (ordersQuery.error) {
    return <ErrorState description="Nao foi possivel carregar os pedidos." onRetry={() => void ordersQuery.refetch()} />;
  }

  const orders = ordersQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pedidos"
        title="Esteira operacional"
        description="Fluxo claro por status, com impressao disparada a partir da confirmacao do pedido e historico tecnico de impressao."
      />

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[1960px] gap-6 xl:min-w-0 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-7">
          {columns.map((column) => (
            <OrderColumn key={column.status} column={column} orders={orders.filter((order) => order.status === column.status)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderColumn({
  column,
  orders
}: {
  column: (typeof columns)[number];
  orders: OperationalOrder[];
}) {
  return (
    <Card className="min-h-full border-white/8 bg-white/[0.03]">
      <CardHeader className="pb-5">
        <CardTitle className="flex items-center justify-between gap-3 text-white">
          <span>{column.title}</span>
          <Badge variant="neutral">{orders.length}</Badge>
        </CardTitle>
        <p className="max-w-[22ch] text-sm leading-6 text-slate-500">{column.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {orders.length ? (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <EmptyState title="Sem pedidos" description="Nenhum pedido neste estagio agora." />
        )}
      </CardContent>
    </Card>
  );
}

function OrderCard({ order }: { order: OperationalOrder }) {
  const companyId = useCompanyScope();
  const actions = useOperationalOrderActions(companyId);

  const moveTo = async (status: OperationalOrderStatus) => {
    try {
      await actions.updateStatusMutation.mutateAsync({ orderId: order.id, status });
      toast.success("Status do pedido atualizado");
    } catch (error) {
      toast.error(getErrorMessage(error, "Nao foi possivel atualizar o pedido."));
    }
  };

  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">{order.code}</p>
            <p className="mt-1 text-sm text-slate-400">{order.customer_name ?? "Cliente nao informado"}</p>
          </div>
          <Badge variant="neutral">{order.fulfillment_type}</Badge>
        </div>

        <div className="space-y-1 text-sm text-slate-400">
          <p>{formatPhoneNumber(order.customer_phone)}</p>
          <p>{formatCurrencyBrl(order.total_amount)}</p>
          <p>{order.payment_method ?? "Pagamento nao informado"}</p>
          <p>{order.delivery_address ?? "Sem endereco"}</p>
        </div>

        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3 text-sm text-slate-300">
          {order.items.length ? order.items.map((item) => <p key={item.id}>{item.quantity}x {item.product_name}</p>) : "Sem itens detalhados."}
        </div>

        <div className="text-xs text-slate-500">
          <p>Criado em {formatDateTime(order.created_at)}</p>
          <p>
            Impressao: {order.print_jobs.length ? `${order.print_jobs.length} registro(s)` : "aguardando trigger por status"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => void moveTo("confirmed")}>
            Confirmar
          </Button>
          <Button size="sm" variant="outline" onClick={() => void moveTo("in_preparation")}>
            Preparo
          </Button>
          <Button size="sm" variant="outline" onClick={() => void moveTo("out_for_delivery")}>
            Entrega
          </Button>
          <Button size="sm" variant="outline" onClick={() => void moveTo("ready_for_pickup")}>
            Retirada
          </Button>
          <Button size="sm" variant="outline" onClick={() => void moveTo("completed")}>
            Concluir
          </Button>
          <Button size="sm" variant="outline" onClick={() => void moveTo("cancelled")}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
