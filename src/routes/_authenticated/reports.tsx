import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveTenant } from "@/hooks/use-tenant";
import { getReportsData } from "@/lib/reports.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const TrendsChart = React.lazy(() =>
  import("@/components/reports/ReportsCharts").then((m) => ({ default: m.TrendsChart })),
);
const DistributionChart = React.lazy(() =>
  import("@/components/reports/ReportsCharts").then((m) => ({ default: m.DistributionChart })),
);

function ChartsSkeleton() {
  return (
    <div className="w-full h-full flex flex-col justify-between py-2">
      <div className="flex-1 flex items-end gap-2 px-2 pb-4">
        <Skeleton className="h-[20%] flex-1 rounded-sm opacity-50" />
        <Skeleton className="h-[60%] flex-1 rounded-sm opacity-50" />
        <Skeleton className="h-[40%] flex-1 rounded-sm opacity-50" />
        <Skeleton className="h-[80%] flex-1 rounded-sm opacity-50" />
        <Skeleton className="h-[50%] flex-1 rounded-sm opacity-50" />
        <Skeleton className="h-[90%] flex-1 rounded-sm opacity-50" />
      </div>
      <div className="flex justify-center items-center gap-6 mt-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </div>
  );
}

import Papa from "papaparse";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Inbox,
  TrendingUp,
  TrendingDown,
  Activity,
  Download,
  Filter,
  RefreshCw,
  Clock,
  Sparkles,
  HelpCircle,
  Users,
  Smartphone,
  ChevronRight,
  Smile,
  AlertTriangle,
  MapPin,
  Check,
  Percent,
  BarChart3,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Enterprise Analytics · Virrat Reach" }] }),
  component: ReportsPage,
});

// Color palette for charts
const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#8b5cf6", "#ec4899"];

const kpiMetrics = [
  { key: "newContacts", label: "Contacts Created" },
  { key: "contactsImported", label: "Contacts Imported" },
  { key: "totalCampaigns", label: "Campaigns Sent" },
  { key: "repliesReceived", label: "Replies Received" },
  { key: "delivered", label: "Messages Delivered" },
  { key: "read", label: "Messages Read" },
  { key: "conversationCount", label: "Conversation Count" },
  { key: "sent", label: "Total Messages Sent" },
  { key: "failed", label: "Failed Messages" },
  { key: "replyRate", label: "Reply Rate", suffix: "%" },
  { key: "deliveryRate", label: "Delivery Rate", suffix: "%" },
  { key: "readRate", label: "Read Rate", suffix: "%" },
  { key: "conversationRate", label: "Conversion Rate", suffix: "%" },
  { key: "activeConversations", label: "Active Conversations" },
  { key: "activeCampaigns", label: "Active Campaigns" },
];

function ReportsPage() {
  const { activeId } = useActiveTenant();

  // ─── Filter & Date states ──────────────────────────────────────────────────
  const [range, setRange] = useState("last7days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [campaignId, setCampaignId] = useState("all");
  const [templateId, setTemplateId] = useState("all");
  const [agentId, setAgentId] = useState("all");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [convStatus, setConvStatus] = useState("all");
  const [phone, setPhone] = useState("");
  const [tagId, setTagId] = useState("all");

  const [search, setSearch] = useState("");
  const [campaignSearch, setCampaignSearch] = useState("");

  // Campaign Comparison state
  const [compareCampaignIds, setCompareCampaignIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  // ─── Load Reference Options (Campaigns, Templates, Agents, Tags) ───────────
  const { data: filterOptions } = useQuery({
    queryKey: ["reports-filter-options", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const tenant = activeId!;
      const [campaignsRes, templatesRes, membersRes, tagsRes] = await Promise.all([
        supabase
          .from("campaigns")
          .select("id, name")
          .eq("tenant_id", tenant)
          .is("deleted_at", null),
        supabase
          .from("message_templates")
          .select("id, template_name")
          .eq("tenant_id", tenant)
          .is("deleted_at", null),
        supabase
          .from("tenant_members")
          .select("user_id, role, profile:profiles(id, full_name, email)")
          .eq("tenant_id", tenant),
        supabase.from("tags").select("id, name").eq("tenant_id", tenant),
      ]);

      return {
        campaigns: campaignsRes.data ?? [],
        templates: templatesRes.data ?? [],
        agents: (membersRes.data ?? []).map((m: any) => ({
          id: m.user_id,
          name: m.profile?.full_name || m.profile?.email || m.user_id,
          role: m.role,
        })),
        tags: tagsRes.data ?? [],
      };
    },
  });

  // ─── Fetch Reports Aggregated Data ─────────────────────────────────────────
  const queryInput = useMemo(() => {
    return {
      tenantId: activeId!,
      dateRange: {
        range,
        customStart: range === "custom" ? customStart : undefined,
        customEnd: range === "custom" ? customEnd : undefined,
      },
      filters: {
        campaignId: campaignId !== "all" ? campaignId : undefined,
        templateId: templateId !== "all" ? templateId : undefined,
        agentId: agentId !== "all" ? agentId : undefined,
        status: status !== "all" ? status : undefined,
        priority: priority !== "all" ? priority : undefined,
        conversationStatus: convStatus !== "all" ? convStatus : undefined,
        phone: phone.trim() !== "" ? phone : undefined,
        tagId: tagId !== "all" ? tagId : undefined,
      },
    };
  }, [
    activeId,
    range,
    customStart,
    customEnd,
    campaignId,
    templateId,
    agentId,
    status,
    priority,
    convStatus,
    phone,
    tagId,
  ]);

  const {
    data: analytics,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["reports-analytics", queryInput],
    enabled: !!activeId,
    queryFn: () => getReportsData({ data: queryInput }),
    refetchInterval: 10000, // Real-time monitor auto-refreshes every 10s
  });

  // ─── Export Center handlers ────────────────────────────────────────────────
  function exportCSV(tableData: any[], filename: string) {
    if (!tableData.length) return;
    const csv = Papa.unparse(tableData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handlePDFExport() {
    window.print();
  }

  // ─── Reset Filters ─────────────────────────────────────────────────────────
  function resetAllFilters() {
    setCampaignId("all");
    setTemplateId("all");
    setAgentId("all");
    setStatus("all");
    setPriority("all");
    setConvStatus("all");
    setPhone("");
    setTagId("all");
  }

  // ─── Campaign Performance filter & pagination ──────────────────────────────
  const filteredCampaigns = useMemo(() => {
    const list = analytics?.campaignPerformance ?? [];
    if (!campaignSearch.trim()) return list;
    const s = campaignSearch.toLowerCase();
    return list.filter(
      (c) => c.name.toLowerCase().includes(s) || c.templateName.toLowerCase().includes(s),
    );
  }, [analytics?.campaignPerformance, campaignSearch]);

  const sortedCampaigns = useMemo(() => {
    return [...filteredCampaigns].sort((a, b) => b.sent - a.sent);
  }, [filteredCampaigns]);

  // Campaign Comparison calculation
  const comparedCampaignsList = useMemo(() => {
    if (!analytics?.campaignPerformance) return [];
    return analytics.campaignPerformance.filter((c) => compareCampaignIds.includes(c.id));
  }, [analytics?.campaignPerformance, compareCampaignIds]);

  if (isLoading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-muted animate-pulse rounded-xl col-span-1 md:col-span-3" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const {
    kpis,
    deliveryFunnel,
    messageStatusDistribution,
    campaignPerformance,
    messageTrend,
    topTemplates,
    conversationAnalytics,
    agentPerformance,
    failureAnalysis,
    contactAnalytics,
    geoAnalytics,
    realtimeMonitor,
    healthScore,
    role,
  } = analytics;

  const isPrivileged = role === "owner" || role === "admin" || role === "manager";

  return (
    <div className="space-y-8 pb-12 print:p-0 print:space-y-4">
      {/* ─── Control & Filters Bar ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Reports 2.0</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enterprise-grade delivery and conversation analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          <Button variant="outline" size="icon" onClick={() => refetch()} className="size-9">
            <RefreshCw className="size-4 text-muted-foreground" />
          </Button>

          {/* Date Selector */}
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[160px] h-9 bg-card">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="thismonth">This Month</SelectItem>
              <SelectItem value="lastmonth">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {range === "custom" && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-9 w-[130px]"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-9 w-[130px]"
              />
            </div>
          )}

          {/* Filters Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Filter className="size-4" />
                Filters
                {(campaignId !== "all" ||
                  templateId !== "all" ||
                  agentId !== "all" ||
                  status !== "all" ||
                  priority !== "all" ||
                  convStatus !== "all" ||
                  phone.trim() !== "" ||
                  tagId !== "all") && (
                  <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-[10px]">
                    Active
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 space-y-4 bg-popover border border-border shadow-xl rounded-xl">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-semibold">Filter Analytics</span>
                <button
                  onClick={resetAllFilters}
                  className="text-[10px] text-primary hover:underline font-medium"
                >
                  Reset All
                </button>
              </div>

              <div className="space-y-3">
                {/* Campaign filter */}
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Campaign
                  </Label>
                  <select
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Campaigns</option>
                    {filterOptions?.campaigns.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Template filter */}
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Template
                  </Label>
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Templates</option>
                    {filterOptions?.templates.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.template_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Agent filter */}
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Assigned Agent
                  </Label>
                  <select
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Agents</option>
                    {filterOptions?.agents.map((a: any) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority filter */}
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Chat Priority
                  </Label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Conversation Status */}
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Chat Status
                  </Label>
                  <select
                    value={convStatus}
                    onChange={(e) => setConvStatus(e.target.value)}
                    className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Tag Filter */}
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Contact Tag
                  </Label>
                  <select
                    value={tagId}
                    onChange={(e) => setTagId(e.target.value)}
                    className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Tags</option>
                    {filterOptions?.tags.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone filter */}
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Phone Number / Search Keyword
                  </Label>
                  <Input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone or text…"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Export Dropdown */}
          <Select
            value=""
            onValueChange={(val) => {
              if (val === "pdf") handlePDFExport();
              if (val === "csv-campaigns") exportCSV(campaignPerformance, "campaigns_report");
              if (val === "csv-templates") exportCSV(topTemplates, "templates_report");
            }}
          >
            <SelectTrigger className="w-[130px] h-9 bg-card">
              <Download className="size-4 mr-2" />
              <span>Export</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv-campaigns">CSV Campaigns</SelectItem>
              <SelectItem value="csv-templates">CSV Templates</SelectItem>
              <SelectItem value="pdf">Print / PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ─── Business Health Score Panel ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score dial */}
        <Card className="p-6 bg-card border-border flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative size-32 flex items-center justify-center">
            <svg className="size-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="hsl(var(--border))"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="hsl(var(--primary))"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="314"
                strokeDashoffset={314 - (314 * healthScore.score) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tracking-tight">{healthScore.score}</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                Health Score
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm">Overall Channel Health</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Calculated dynamically based on active API delivery, read triggers, and customer
              engagement reply rates.
            </p>
          </div>
        </Card>

        {/* Factors Breakdown */}
        <Card className="p-6 bg-card border-border space-y-4">
          <div>
            <h3 className="font-semibold text-sm">Score Factors</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Primary performance scores evaluated this period.
            </p>
          </div>
          <div className="space-y-3">
            {healthScore.factors.map((f) => (
              <div key={f.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{f.name}</span>
                  <span className="tabular-nums font-semibold">{f.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${f.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Dynamic Recommendations */}
        <Card className="p-6 bg-card border-border space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <h3 className="font-semibold text-sm">Insights & Recommendations</h3>
          </div>
          <div className="space-y-3">
            {healthScore.recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 text-xs p-2.5 rounded-lg bg-primary/5 border border-primary/10"
              >
                <ChevronRight className="size-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground leading-normal">{rec}</span>
              </div>
            ))}
            {healthScore.recommendations.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                No new recommendations for this period. Healthy performance!
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* ─── Executive KPIs Section (12 cards) ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiMetrics.map(({ key, label, suffix }) => {
          const metric = kpis[key] || { value: 0, change: "0%", trend: "neutral" };
          const Icon =
            key === "sent"
              ? Send
              : key === "delivered"
                ? CheckCircle2
                : key === "failed"
                  ? AlertCircle
                  : key === "read"
                    ? Inbox
                    : key === "activeConversations"
                      ? Activity
                      : key === "newContacts"
                        ? Users
                        : key === "contactsImported"
                          ? Download
                          : key === "totalCampaigns"
                            ? BarChart3
                            : key === "repliesReceived"
                              ? Inbox
                              : key === "conversationCount"
                                ? Smartphone
                                : Percent;

          return (
            <Card
              key={key}
              className="p-5 flex flex-col justify-between space-y-4 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {label}
                </span>
                <Icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <div className="space-y-1">
                <div className="text-2xl font-bold tracking-tight tabular-nums">
                  {metric.value.toLocaleString()}
                  {suffix}
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  {metric.trend === "up" && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/15 border-none px-1.5 py-0">
                      <TrendingUp className="size-3 mr-1" />
                      {metric.change}
                    </Badge>
                  )}
                  {metric.trend === "down" && (
                    <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/15 border-none px-1.5 py-0">
                      <TrendingDown className="size-3 mr-1" />
                      {metric.change}
                    </Badge>
                  )}
                  {metric.trend === "neutral" && (
                    <Badge className="bg-muted text-muted-foreground border-none px-1.5 py-0">
                      {metric.change}
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground">vs prev period</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ─── Real-time Monitor ───────────────────────────────────────────── */}
      <Card className="p-5 border-border print:hidden relative overflow-hidden bg-primary/5">
        <div className="absolute top-0 right-0 size-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative size-3 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-1.5">
                Real-Time Monitor
                <span className="text-[9px] bg-emerald-500/10 text-emerald-500 font-bold px-1.5 py-0.5 rounded-full uppercase">
                  Live
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground">Refreshes automatically every 10s</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-4 sm:gap-8">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                API Latency
              </span>
              <div className="text-sm font-semibold tabular-nums text-primary">
                {realtimeMonitor.apiLatency}ms
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                Webhook Health
              </span>
              <div className="text-sm font-semibold tabular-nums text-emerald-500">
                {realtimeMonitor.webhookHealth}%
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                Queue Length
              </span>
              <div className="text-sm font-semibold tabular-nums">
                {realtimeMonitor.queueLength} pending
              </div>
            </div>
          </div>
        </div>

        {/* Recent live activity logs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/60">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">
              Recent Inbound Activity
            </h4>
            <div className="space-y-1.5">
              {realtimeMonitor.recentReplies.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-card border border-border"
                >
                  <div className="truncate pr-4 flex-1">
                    <span className="font-medium mr-1.5">{r.contactName}:</span>
                    <span className="text-muted-foreground">{r.body}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {new Date(r.time).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </span>
                </div>
              ))}
              {realtimeMonitor.recentReplies.length === 0 && (
                <div className="text-xs text-muted-foreground italic p-2 text-center">
                  No recent replies found.
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">
              Recent Delivery Failures
            </h4>
            <div className="space-y-1.5">
              {realtimeMonitor.recentFailures.map((rf, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-destructive/5 border border-destructive/10"
                >
                  <div className="truncate pr-4 flex-1">
                    <span className="font-medium text-destructive mr-1.5">{rf.campaignName}:</span>
                    <span className="text-muted-foreground">{rf.error}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {new Date(rf.time).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </span>
                </div>
              ))}
              {realtimeMonitor.recentFailures.length === 0 && (
                <div className="text-xs text-muted-foreground italic p-2 text-center">
                  No recent failures logged. Good health!
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ─── Visual Charts Layout ────────────────────────────────────────── */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl mb-4 print:hidden">
          <TabsTrigger value="trends" className="rounded-lg text-xs">
            Trends & Funnel
          </TabsTrigger>
          <TabsTrigger value="statuses" className="rounded-lg text-xs">
            Message Statuses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Volume line chart */}
            <Card className="p-6 bg-card border-border lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-semibold text-sm">Delivery & Response Trends</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Interaction volumes plotted over the selected dates.
                </p>
              </div>

              <div className="h-[300px] w-full">
                <React.Suspense fallback={<ChartsSkeleton />}>
                  <TrendsChart messageTrend={messageTrend} />
                </React.Suspense>
              </div>
            </Card>

            {/* SVG funnel visualization */}
            <Card className="p-6 bg-card border-border flex flex-col justify-between space-y-6">
              <div>
                <h3 className="font-semibold text-sm">Delivery Conversion Funnel</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Progressive step drop-offs for dispatches.
                </p>
              </div>

              <div className="space-y-3.5 flex-1 flex flex-col justify-center">
                {deliveryFunnel.map((f, idx) => {
                  const widthPct = 100 - idx * 10;
                  return (
                    <div key={f.step} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{f.step}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold tabular-nums">
                            {f.count.toLocaleString()}
                          </span>
                          {idx > 0 && (
                            <Badge
                              variant="destructive"
                              className="bg-destructive/10 text-destructive border-none px-1.5 py-0 text-[10px]"
                            >
                              -{f.dropoff}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div
                        className="h-7 bg-primary/10 rounded-lg flex items-center px-3 border border-primary/20 text-[10px] font-bold text-primary transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      >
                        {f.percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="statuses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status donut chart */}
            <Card className="p-6 bg-card border-border flex flex-col items-center justify-center text-center space-y-6">
              <div>
                <h3 className="font-semibold text-sm">Status Distribution</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ratio of current message statuses.
                </p>
              </div>

              <div className="h-[240px] w-full flex items-center justify-center">
                <React.Suspense fallback={<ChartsSkeleton />}>
                  <DistributionChart
                    messageStatusDistribution={messageStatusDistribution}
                    colors={COLORS}
                  />
                </React.Suspense>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs w-full text-left">
                {messageStatusDistribution
                  .filter((d) => d.count > 0)
                  .map((d, index) => (
                    <div key={d.status} className="flex items-center gap-2">
                      <div
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-muted-foreground text-[11px] truncate flex-1">
                        {d.status}
                      </span>
                      <span className="font-semibold tabular-nums text-[11px]">
                        {d.count} ({d.percentage}%)
                      </span>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Status counts details list */}
            <Card className="p-6 bg-card border-border lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-semibold text-sm">Status Analysis Details</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Detailed aggregates of meta messaging statuses.
                </p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Message Status</TableHead>
                    <TableHead className="text-xs text-right">Messages Count</TableHead>
                    <TableHead className="text-xs text-right">Ratio Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messageStatusDistribution.map((row) => (
                    <TableRow key={row.status}>
                      <TableCell className="text-xs font-semibold">{row.status}</TableCell>
                      <TableCell className="text-xs text-right tabular-nums">
                        {row.count.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums">
                        {row.percentage}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Campaign Comparison Panel ───────────────────────────────────── */}
      <div className="print:hidden">
        <Card className="p-6 bg-card border-border space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-semibold text-sm">Campaign Comparison</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Compare side-by-side performance of key campaigns.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsComparing(!isComparing);
                setCompareCampaignIds([]);
              }}
              className="text-xs h-8"
            >
              {isComparing ? "Close Compare" : "Compare Campaigns"}
            </Button>
          </div>

          {isComparing && (
            <div className="space-y-4">
              {/* Campaign Picker Checkboxes */}
              <div className="flex flex-wrap gap-3 p-3 rounded-lg bg-muted/40 border text-xs">
                <span className="font-semibold text-muted-foreground self-center mr-2">
                  Select to compare:
                </span>
                {filterOptions?.campaigns.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 cursor-pointer bg-card px-2.5 py-1.5 rounded-md border hover:border-primary/30"
                  >
                    <input
                      type="checkbox"
                      checked={compareCampaignIds.includes(c.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCompareCampaignIds([...compareCampaignIds, c.id]);
                        } else {
                          setCompareCampaignIds(compareCampaignIds.filter((id) => id !== c.id));
                        }
                      }}
                      className="accent-primary"
                    />
                    <span className="font-medium text-xs">{c.name}</span>
                  </label>
                ))}
                {filterOptions?.campaigns.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">No campaigns found.</span>
                )}
              </div>

              {comparedCampaignsList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {comparedCampaignsList.map((c) => (
                    <Card key={c.id} className="p-4 bg-card border-primary/20 shadow-md space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="font-bold text-sm truncate">{c.name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {c.status}
                        </Badge>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Recipients:</span>
                          <span className="font-semibold tabular-nums">{c.recipients}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sent:</span>
                          <span className="font-semibold tabular-nums">{c.sent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivered Rate:</span>
                          <span className="font-bold text-blue-500 tabular-nums">
                            {c.deliveryRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Read Rate:</span>
                          <span className="font-bold text-emerald-500 tabular-nums">
                            {c.readRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reply Rate:</span>
                          <span className="font-bold text-amber-500 tabular-nums">
                            {c.replyRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Failures:</span>
                          <span className="font-semibold text-destructive tabular-nums">
                            {c.failures}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic text-center p-6 border border-dashed rounded-lg">
                  Check checkboxes above to select campaigns for side-by-side comparison.
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* ─── Campaign Performance Table ─────────────────────────────────── */}
      <Card className="p-6 bg-card border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-sm">Campaign Performance</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Overview of individual campaign outcomes and metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Search campaigns…"
              value={campaignSearch}
              onChange={(e) => setCampaignSearch(e.target.value)}
              className="h-8 text-xs w-[180px]"
            />
          </div>
        </div>

        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Campaign Name</TableHead>
                <TableHead className="text-xs">Template</TableHead>
                <TableHead className="text-xs text-right">Recipients</TableHead>
                <TableHead className="text-xs text-right">Sent</TableHead>
                <TableHead className="text-xs text-right">Delivered</TableHead>
                <TableHead className="text-xs text-right">Read</TableHead>
                <TableHead className="text-xs text-right">Replies</TableHead>
                <TableHead className="text-xs text-right">Failures</TableHead>
                <TableHead className="text-xs text-right">Delivery %</TableHead>
                <TableHead className="text-xs text-right">Read %</TableHead>
                <TableHead className="text-xs text-right">Reply %</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Started At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCampaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-xs font-semibold">{c.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {c.templateName}
                  </TableCell>
                  <TableCell className="text-xs text-right tabular-nums">{c.recipients}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums">{c.sent}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums">{c.delivered}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums">{c.read}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums">{c.replies}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums text-destructive">
                    {c.failures}
                  </TableCell>
                  <TableCell className="text-xs text-right font-medium tabular-nums text-blue-500">
                    {c.deliveryRate}%
                  </TableCell>
                  <TableCell className="text-xs text-right font-medium tabular-nums text-emerald-500">
                    {c.readRate}%
                  </TableCell>
                  <TableCell className="text-xs text-right font-medium tabular-nums text-amber-500">
                    {c.replyRate}%
                  </TableCell>
                  <TableCell className="text-xs uppercase">
                    <Badge
                      variant={c.status === "completed" ? "outline" : "default"}
                      className="text-[9px] px-1 py-0 font-bold"
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.startedAt ? new Date(c.startedAt).toLocaleDateString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {sortedCampaigns.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    className="text-xs text-center text-muted-foreground py-6"
                  >
                    No campaigns matching filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ─── Templates & Agent tables ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Templates */}
        <Card className="p-6 bg-card border-border space-y-4">
          <div>
            <h3 className="font-semibold text-sm">Top Performing Templates</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Templates ranked by incoming customer reply conversion.
            </p>
          </div>

          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Template Name</TableHead>
                  <TableHead className="text-xs text-right">Sent</TableHead>
                  <TableHead className="text-xs text-right">Replies</TableHead>
                  <TableHead className="text-xs text-right">Read %</TableHead>
                  <TableHead className="text-xs text-right">Reply %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topTemplates.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="text-xs font-semibold truncate max-w-[150px]">
                      {row.name}
                    </TableCell>
                    <TableCell className="text-xs text-right tabular-nums">{row.sent}</TableCell>
                    <TableCell className="text-xs text-right tabular-nums">{row.replies}</TableCell>
                    <TableCell className="text-xs text-right font-medium tabular-nums text-emerald-500">
                      {row.readRate}%
                    </TableCell>
                    <TableCell className="text-xs text-right font-bold tabular-nums text-primary">
                      {row.replyRate}%
                    </TableCell>
                  </TableRow>
                ))}
                {topTemplates.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-xs text-center text-muted-foreground py-6"
                    >
                      No template data found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Agent Performance (restricted view) */}
        <Card className="p-6 bg-card border-border space-y-4">
          <div>
            <h3 className="font-semibold text-sm">Agent Performance</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Assigned chats and customer service metrics (Supervisors only).
            </p>
          </div>

          {isPrivileged ? (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Agent</TableHead>
                    <TableHead className="text-xs text-right font-medium">Assigned</TableHead>
                    <TableHead className="text-xs text-right font-medium">Pending</TableHead>
                    <TableHead className="text-xs text-right font-medium">Resolved</TableHead>
                    <TableHead className="text-xs text-right font-medium">Avg Resp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentPerformance.map((row) => (
                    <TableRow key={row.agentId}>
                      <TableCell className="text-xs font-semibold flex items-center gap-2">
                        <span
                          className={`size-1.5 rounded-full ${row.onlineStatus === "online" ? "bg-emerald-500" : row.onlineStatus === "away" ? "bg-amber-400" : "bg-muted"}`}
                        />
                        <span className="truncate max-w-[120px]">{row.name}</span>
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums">
                        {row.assignedChats}
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums">
                        {row.pending}
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums text-emerald-500 font-medium">
                        {row.resolved}
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums font-medium">
                        {row.avgResponseTime}m
                      </TableCell>
                    </TableRow>
                  ))}
                  {agentPerformance.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-xs text-center text-muted-foreground py-6"
                      >
                        No agent performance metrics logged.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic text-center p-6 border border-dashed rounded-lg bg-muted/20">
              🔒 You have insufficient permissions to view workspace agent performance metrics.
              Reach out to your Administrator.
            </p>
          )}
        </Card>
      </div>

      {/* ─── Contact & Failure analytics ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Failures Analysis */}
        <Card className="p-6 bg-card border-border lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-semibold text-sm">Delivery Failure Reasons</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Top causes of campaign delivery failures on Meta API.
            </p>
          </div>

          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Reason</TableHead>
                  <TableHead className="text-xs text-center">Code</TableHead>
                  <TableHead className="text-xs text-right">Count</TableHead>
                  <TableHead className="text-xs">Suggested Resolution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failureAnalysis.map((row) => (
                  <TableRow key={row.reason}>
                    <TableCell className="text-xs font-semibold text-destructive max-w-[150px] truncate">
                      {row.reason}
                    </TableCell>
                    <TableCell className="text-xs text-center tabular-nums">{row.code}</TableCell>
                    <TableCell className="text-xs text-right tabular-nums font-semibold">
                      {row.count}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {row.resolution}
                    </TableCell>
                  </TableRow>
                ))}
                {failureAnalysis.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-xs text-center text-emerald-500 py-6 font-semibold"
                    >
                      🎉 No delivery failures recorded in this period!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Contact Analytics */}
        <Card className="p-6 bg-card border-border space-y-4">
          <div>
            <h3 className="font-semibold text-sm">Contact Engagement</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Audit contact frequency and return stats.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Returning Contacts:</span>
              <span className="font-semibold tabular-nums">
                {contactAnalytics.returningContacts}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Contacts Replied:</span>
              <span className="font-semibold tabular-nums">{contactAnalytics.contactsReplied}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Inactive Contacts (30d):</span>
              <span className="font-semibold text-destructive tabular-nums">
                {contactAnalytics.inactiveContacts}
              </span>
            </div>

            {/* Most active contact */}
            <div className="space-y-2 pt-2">
              <span className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
                Most Active Contacts
              </span>
              <div className="space-y-1.5">
                {contactAnalytics.mostActiveContacts.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between p-2 rounded-lg bg-muted/40 border"
                  >
                    <span className="font-medium truncate max-w-[150px]">{c.name}</span>
                    <span className="font-semibold text-primary">{c.count} replies</span>
                  </div>
                ))}
                {contactAnalytics.mostActiveContacts.length === 0 && (
                  <p className="text-xs text-muted-foreground italic text-center py-2">
                    No active contacts.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ─── Geographical Analytics ──────────────────────────────────────── */}
      {geoAnalytics.topCountries.length > 0 && (
        <Card className="p-6 bg-card border-border space-y-4 print:hidden">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            <div>
              <h3 className="font-semibold text-sm">Geographical Distribution</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Volume breakdown by country codes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {geoAnalytics.topCountries.map((c) => (
              <div
                key={c.name}
                className="p-3 bg-muted/30 border rounded-lg flex items-center justify-between text-xs"
              >
                <span className="font-semibold">🌍 {c.name}</span>
                <span className="text-muted-foreground font-semibold tabular-nums">
                  {c.count} contacts
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ─── Op Stats ────────────────────────────────────────────────────── */}
      <Card className="p-6 bg-card border-border space-y-4">
        <div>
          <h3 className="font-semibold text-sm">Operational Conversational Metrics</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Average reply loops, durations, and resolution times.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-4 bg-muted/20 border rounded-xl space-y-2">
            <div className="flex justify-center text-primary">
              <Clock className="size-5" />
            </div>
            <div className="text-2xl font-bold tracking-tight tabular-nums">
              {conversationAnalytics.avgFirstResponseTime}m
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Average First Response
            </p>
          </div>

          <div className="p-4 bg-muted/20 border rounded-xl space-y-2">
            <div className="flex justify-center text-primary">
              <Check className="size-5" />
            </div>
            <div className="text-2xl font-bold tracking-tight tabular-nums">
              {conversationAnalytics.avgResolutionTime}m
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Average Resolution Time
            </p>
          </div>

          <div className="p-4 bg-muted/20 border rounded-xl space-y-2">
            <div className="flex justify-center text-primary">
              <Clock className="size-5" />
            </div>
            <div className="text-2xl font-bold tracking-tight tabular-nums">
              {conversationAnalytics.avgConversationDuration}m
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Average Conversation Duration
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
