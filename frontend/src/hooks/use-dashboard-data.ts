"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/components/providers/auth-provider";
import { getAgents } from "@/lib/api/agents";
import { getCompanies, getCompany } from "@/lib/api/companies";
import { getConversations } from "@/lib/api/conversations";
import { getMetrics } from "@/lib/api/metrics";
import { getWhatsappInstances } from "@/lib/api/whatsapp";
import { isDev } from "@/lib/auth/roles";
import { queryKeys } from "@/lib/query-keys";

export function useDashboardData(companyId?: number) {
  const { user } = useAuth();
  const devMode = isDev(user);

  const companyQuery = useQuery({ queryKey: queryKeys.company(companyId), queryFn: () => getCompany(companyId) });
  const companiesQuery = useQuery({ queryKey: queryKeys.companies, queryFn: getCompanies, enabled: devMode });
  const metricsQuery = useQuery({ queryKey: queryKeys.metrics(companyId), queryFn: () => getMetrics(companyId) });
  const conversationsQuery = useQuery({
    queryKey: queryKeys.conversations(companyId),
    queryFn: () => getConversations(companyId)
  });
  const instancesQuery = useQuery({
    queryKey: queryKeys.whatsappInstances(companyId),
    queryFn: () => getWhatsappInstances(companyId)
  });
  const agentsQuery = useQuery({
    queryKey: queryKeys.agents(companyId),
    queryFn: () => getAgents(companyId),
    enabled: devMode
  });

  const cards = useMemo(() => {
    const metrics = metricsQuery.data ?? [];
    const pickMetric = (name: string) =>
      metrics.filter((item) => item.metric_name === name).reduce((acc, item) => acc + item.metric_value, 0);

    return {
      incoming: pickMetric("incoming_messages"),
      outgoing: pickMetric("outgoing_messages"),
      handoffs: pickMetric("human_handoffs"),
      openConversations: (conversationsQuery.data ?? []).filter((item) => item.status !== "resolved").length,
      activeInstances: (instancesQuery.data ?? []).filter((item) => item.active).length,
      activeCompanies: (companiesQuery.data ?? []).filter((item) => item.status === "active").length,
      activeAgents: (agentsQuery.data ?? []).filter((item) => item.active).length,
      apiUsage: pickMetric("incoming_messages") + pickMetric("outgoing_messages"),
      openAiUsageCost: metrics.reduce((acc, item) => acc + item.estimated_cost, 0)
    };
  }, [metricsQuery.data, conversationsQuery.data, instancesQuery.data, companiesQuery.data, agentsQuery.data]);

  return {
    companyQuery,
    companiesQuery,
    metricsQuery,
    conversationsQuery,
    instancesQuery,
    agentsQuery,
    cards
  };
}
