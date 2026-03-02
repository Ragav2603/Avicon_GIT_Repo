import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Link2,
  Plus,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  LineChart,
  PieChart,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import PlatformLayout from "@/components/platform/PlatformLayout";

const API_URL = import.meta.env.VITE_API_URL || "";

// Types
interface TelemetryProvider {
  id: string;
  name: string;
  icon: string;
  config_fields: Array<{
    key: string;
    label: string;
    type: string;
    required: boolean;
  }>;
}

interface TelemetryConnection {
  id: string;
  provider: string;
  name: string;
  submission_id: string;
  rfp_id: string;
  status: string;
  last_sync: string | null;
  created_at: string;
}

interface AdoptionMetric {
  id: string;
  connection_id: string;
  submission_id: string;
  rfp_id: string;
  metric_type: string;
  metric_name: string;
  current_value: number;
  previous_value: number | null;
  change_percent: number | null;
  trend: "up" | "down" | "stable";
  data_points: Array<{ timestamp: string; value: number }>;
  last_updated: string;
}

interface AcceptedSubmission {
  id: string;
  rfp_id: string;
  rfp_title: string;
  vendor_id: string;
  vendor_name: string;
  solution_name: string;
  status: string;
  airline_id: string;
  airline_name: string;
  adoption_score?: number;
  health_status?: string;
  has_telemetry?: boolean;
}

interface DashboardData {
  summary: {
    total_solutions: number;
    average_adoption_score: number;
    healthy_count: number;
    warning_count: number;
    critical_count: number;
  };
  solutions: AcceptedSubmission[];
  top_recommendations: string[];
}

// API functions
const fetchProviders = async (): Promise<{ providers: TelemetryProvider[] }> => {
  const response = await fetch(`${API_URL}/api/adoption/providers`);
  if (!response.ok) throw new Error("Failed to fetch providers");
  return response.json();
};

const fetchDashboard = async (): Promise<DashboardData> => {
  const response = await fetch(`${API_URL}/api/adoption/dashboard`);
  if (!response.ok) throw new Error("Failed to fetch dashboard");
  return response.json();
};

const fetchConnections = async (submissionId?: string): Promise<{ connections: TelemetryConnection[] }> => {
  const url = submissionId 
    ? `${API_URL}/api/adoption/connections?submission_id=${submissionId}`
    : `${API_URL}/api/adoption/connections`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch connections");
  return response.json();
};

const fetchMetrics = async (submissionId?: string): Promise<{ metrics: AdoptionMetric[] }> => {
  const url = submissionId 
    ? `${API_URL}/api/adoption/metrics?submission_id=${submissionId}`
    : `${API_URL}/api/adoption/metrics`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch metrics");
  return response.json();
};

const createConnection = async (data: {
  provider: string;
  name: string;
  config: Record<string, string>;
  submission_id: string;
  rfp_id: string;
}) => {
  const response = await fetch(`${API_URL}/api/adoption/connections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create connection");
  return response.json();
};

const syncConnection = async (connectionId: string) => {
  const response = await fetch(`${API_URL}/api/adoption/connections/${connectionId}/sync`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to sync connection");
  return response.json();
};

const createManualEntry = async (data: {
  submission_id: string;
  rfp_id: string;
  metric_name: string;
  value: number;
  period_start: string;
  period_end: string;
  notes?: string;
}) => {
  const response = await fetch(`${API_URL}/api/adoption/manual-entry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create manual entry");
  return response.json();
};

// Health status badge
const HealthBadge = ({ status }: { status: string }) => {
  const styles: Record<string, { variant: "default" | "destructive" | "outline" | "secondary"; icon: React.ReactNode }> = {
    healthy: { variant: "default", icon: <CheckCircle2 className="w-3 h-3" /> },
    warning: { variant: "secondary", icon: <AlertTriangle className="w-3 h-3" /> },
    critical: { variant: "destructive", icon: <XCircle className="w-3 h-3" /> },
  };
  const style = styles[status] || styles.warning;
  
  return (
    <Badge variant={style.variant} className="gap-1 capitalize">
      {style.icon}
      {status}
    </Badge>
  );
};

// Trend indicator
const TrendIndicator = ({ trend, value }: { trend: string; value: number | null }) => {
  if (value === null) return <Minus className="w-4 h-4 text-muted-foreground" />;
  
  const icons: Record<string, React.ReactNode> = {
    up: <TrendingUp className="w-4 h-4 text-green-500" />,
    down: <TrendingDown className="w-4 h-4 text-red-500" />,
    stable: <Minus className="w-4 h-4 text-muted-foreground" />,
  };
  
  const colors: Record<string, string> = {
    up: "text-green-500",
    down: "text-red-500",
    stable: "text-muted-foreground",
  };
  
  return (
    <div className="flex items-center gap-1">
      {icons[trend]}
      <span className={`text-sm font-medium ${colors[trend]}`}>
        {value > 0 ? "+" : ""}{value}%
      </span>
    </div>
  );
};

// Provider icon component
const ProviderIcon = ({ provider }: { provider: string }) => {
  switch (provider) {
    case "adobe_analytics":
      return <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-xs">Aa</div>;
    case "appdynamics":
      return <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">AD</div>;
    case "appinsights":
      return <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">AI</div>;
    case "manual":
      return <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-white"><Upload className="w-4 h-4" /></div>;
    default:
      return <div className="w-8 h-8 bg-gray-400 rounded flex items-center justify-center text-white"><Activity className="w-4 h-4" /></div>;
  }
};

// Main Page Component
const AdoptionMetricsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<AcceptedSubmission | null>(null);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [showManualEntryDialog, setShowManualEntryDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [connectionConfig, setConnectionConfig] = useState<Record<string, string>>({});
  const [connectionName, setConnectionName] = useState("");
  const [manualEntry, setManualEntry] = useState({
    metric_name: "",
    value: 0,
    period_start: "",
    period_end: "",
    notes: "",
  });

  // Queries
  const { data: providersData } = useQuery({
    queryKey: ["telemetry-providers"],
    queryFn: fetchProviders,
  });

  const { data: dashboardData, isLoading: isDashboardLoading, refetch: refetchDashboard } = useQuery({
    queryKey: ["adoption-dashboard"],
    queryFn: fetchDashboard,
  });

  const { data: connectionsData, refetch: refetchConnections } = useQuery({
    queryKey: ["telemetry-connections", selectedSubmission?.id],
    queryFn: () => fetchConnections(selectedSubmission?.id),
    enabled: !!selectedSubmission,
  });

  const { data: metricsData, refetch: refetchMetrics } = useQuery({
    queryKey: ["adoption-metrics", selectedSubmission?.id],
    queryFn: () => fetchMetrics(selectedSubmission?.id),
    enabled: !!selectedSubmission,
  });

  // Mutations
  const createConnectionMutation = useMutation({
    mutationFn: createConnection,
    onSuccess: () => {
      toast({ title: "Connection created", description: "Telemetry connection has been set up." });
      setShowConnectionDialog(false);
      setSelectedProvider("");
      setConnectionConfig({});
      setConnectionName("");
      refetchConnections();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create connection", variant: "destructive" });
    },
  });

  const syncConnectionMutation = useMutation({
    mutationFn: syncConnection,
    onSuccess: () => {
      toast({ title: "Sync initiated", description: "Telemetry data sync has started." });
      setTimeout(() => {
        refetchMetrics();
        refetchDashboard();
      }, 2000);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to sync connection", variant: "destructive" });
    },
  });

  const createManualEntryMutation = useMutation({
    mutationFn: createManualEntry,
    onSuccess: () => {
      toast({ title: "Entry created", description: "Manual metric entry has been saved." });
      setShowManualEntryDialog(false);
      setManualEntry({ metric_name: "", value: 0, period_start: "", period_end: "", notes: "" });
      refetchMetrics();
      refetchDashboard();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create manual entry", variant: "destructive" });
    },
  });

  const providers = providersData?.providers || [];
  const dashboard = dashboardData;
  const connections = connectionsData?.connections || [];
  const metrics = metricsData?.metrics || [];
  const selectedProviderConfig = providers.find((p) => p.id === selectedProvider);

  const handleCreateConnection = () => {
    if (!selectedSubmission || !selectedProvider || !connectionName) return;
    
    createConnectionMutation.mutate({
      provider: selectedProvider,
      name: connectionName,
      config: connectionConfig,
      submission_id: selectedSubmission.id,
      rfp_id: selectedSubmission.rfp_id,
    });
  };

  const handleCreateManualEntry = () => {
    if (!selectedSubmission || !manualEntry.metric_name || !manualEntry.value) return;
    
    createManualEntryMutation.mutate({
      submission_id: selectedSubmission.id,
      rfp_id: selectedSubmission.rfp_id,
      metric_name: manualEntry.metric_name,
      value: manualEntry.value,
      period_start: manualEntry.period_start || new Date().toISOString(),
      period_end: manualEntry.period_end || new Date().toISOString(),
      notes: manualEntry.notes,
    });
  };

  return (
    <PlatformLayout title="Adoption Metrics">
      <div className="space-y-6" data-testid="adoption-metrics-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Adoption Metrics</h1>
            <p className="text-muted-foreground">
              Track usage and adoption of solutions from accepted proposals
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => refetchDashboard()}
            data-testid="refresh-dashboard-btn"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        {dashboard && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Solutions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboard.summary.total_solutions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg. Adoption Score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboard.summary.average_adoption_score}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-green-600">Healthy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{dashboard.summary.healthy_count}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-yellow-600">Warning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{dashboard.summary.warning_count}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-red-600">Critical</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{dashboard.summary.critical_count}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Solutions List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Accepted Solutions
              </CardTitle>
              <CardDescription>
                Select a solution to view adoption metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {dashboard?.solutions.map((solution) => (
                  <button
                    key={solution.id}
                    onClick={() => setSelectedSubmission(solution)}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                      selectedSubmission?.id === solution.id ? "bg-muted" : ""
                    }`}
                    data-testid={`solution-${solution.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{solution.solution_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{solution.vendor_name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-1">{solution.rfp_title}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <HealthBadge status={solution.health_status || "warning"} />
                        <span className="text-sm font-mono font-semibold">
                          {solution.adoption_score || 0}%
                        </span>
                      </div>
                    </div>
                    {solution.has_telemetry && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        <Link2 className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </button>
                ))}
                {(!dashboard?.solutions || dashboard.solutions.length === 0) && (
                  <div className="p-8 text-center text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No accepted proposals yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Metrics Detail */}
          <Card className="lg:col-span-2">
            {selectedSubmission ? (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedSubmission.solution_name}</CardTitle>
                      <CardDescription>
                        {selectedSubmission.vendor_name} • {selectedSubmission.rfp_title}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" data-testid="add-telemetry-btn">
                            <Link2 className="w-4 h-4 mr-2" />
                            Add Telemetry
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Connect Telemetry Provider</DialogTitle>
                            <DialogDescription>
                              Connect a telemetry solution to track adoption metrics automatically.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Provider</Label>
                              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a provider" />
                                </SelectTrigger>
                                <SelectContent>
                                  {providers.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      <div className="flex items-center gap-2">
                                        <ProviderIcon provider={p.id} />
                                        {p.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Connection Name</Label>
                              <Input
                                value={connectionName}
                                onChange={(e) => setConnectionName(e.target.value)}
                                placeholder="e.g., Production Analytics"
                              />
                            </div>
                            {selectedProviderConfig?.config_fields.map((field) => (
                              <div key={field.key} className="space-y-2">
                                <Label>{field.label}</Label>
                                <Input
                                  type={field.type === "password" ? "password" : "text"}
                                  value={connectionConfig[field.key] || ""}
                                  onChange={(e) =>
                                    setConnectionConfig((prev) => ({
                                      ...prev,
                                      [field.key]: e.target.value,
                                    }))
                                  }
                                  placeholder={field.label}
                                  required={field.required}
                                />
                              </div>
                            ))}
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={handleCreateConnection}
                              disabled={createConnectionMutation.isPending}
                            >
                              {createConnectionMutation.isPending ? "Connecting..." : "Connect"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog open={showManualEntryDialog} onOpenChange={setShowManualEntryDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" data-testid="manual-entry-btn">
                            <Plus className="w-4 h-4 mr-2" />
                            Manual Entry
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add Manual Metric</DialogTitle>
                            <DialogDescription>
                              Manually enter adoption metrics for this solution.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Metric Name</Label>
                              <Input
                                value={manualEntry.metric_name}
                                onChange={(e) =>
                                  setManualEntry((prev) => ({ ...prev, metric_name: e.target.value }))
                                }
                                placeholder="e.g., Monthly Active Users"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Value</Label>
                              <Input
                                type="number"
                                value={manualEntry.value}
                                onChange={(e) =>
                                  setManualEntry((prev) => ({ ...prev, value: parseFloat(e.target.value) }))
                                }
                                placeholder="0"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Period Start</Label>
                                <Input
                                  type="date"
                                  value={manualEntry.period_start}
                                  onChange={(e) =>
                                    setManualEntry((prev) => ({ ...prev, period_start: e.target.value }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Period End</Label>
                                <Input
                                  type="date"
                                  value={manualEntry.period_end}
                                  onChange={(e) =>
                                    setManualEntry((prev) => ({ ...prev, period_end: e.target.value }))
                                  }
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Notes (optional)</Label>
                              <Textarea
                                value={manualEntry.notes}
                                onChange={(e) =>
                                  setManualEntry((prev) => ({ ...prev, notes: e.target.value }))
                                }
                                placeholder="Additional context..."
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={handleCreateManualEntry}
                              disabled={createManualEntryMutation.isPending}
                            >
                              {createManualEntryMutation.isPending ? "Saving..." : "Save Entry"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="metrics" className="w-full">
                    <TabsList>
                      <TabsTrigger value="metrics">
                        <LineChart className="w-4 h-4 mr-2" />
                        Metrics
                      </TabsTrigger>
                      <TabsTrigger value="connections">
                        <Link2 className="w-4 h-4 mr-2" />
                        Connections
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="metrics" className="mt-4">
                      {metrics.length > 0 ? (
                        <div className="space-y-4">
                          {/* Adoption Score Overview */}
                          <div className="p-4 rounded-lg bg-muted/50 border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Overall Adoption Score</span>
                              <span className="text-2xl font-bold">
                                {selectedSubmission.adoption_score || 0}%
                              </span>
                            </div>
                            <Progress 
                              value={selectedSubmission.adoption_score || 0} 
                              className="h-2"
                            />
                          </div>
                          
                          {/* Individual Metrics */}
                          <div className="grid sm:grid-cols-2 gap-4">
                            {metrics.map((metric) => (
                              <div
                                key={metric.id}
                                className="p-4 rounded-lg border bg-card"
                                data-testid={`metric-${metric.id}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-sm font-medium">{metric.metric_name}</p>
                                    <p className="text-2xl font-bold mt-1">
                                      {metric.current_value.toFixed(1)}
                                      <span className="text-sm font-normal text-muted-foreground">%</span>
                                    </p>
                                  </div>
                                  <TrendIndicator 
                                    trend={metric.trend} 
                                    value={metric.change_percent} 
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  vs. previous period: {metric.previous_value?.toFixed(1) || "N/A"}%
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <PieChart className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">No metrics available</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Connect a telemetry provider or add manual entries to start tracking
                          </p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="connections" className="mt-4">
                      {connections.length > 0 ? (
                        <div className="space-y-3">
                          {connections.map((conn) => (
                            <div
                              key={conn.id}
                              className="flex items-center justify-between p-4 rounded-lg border bg-card"
                              data-testid={`connection-${conn.id}`}
                            >
                              <div className="flex items-center gap-3">
                                <ProviderIcon provider={conn.provider} />
                                <div>
                                  <p className="font-medium">{conn.name}</p>
                                  <p className="text-sm text-muted-foreground capitalize">
                                    {conn.provider.replace("_", " ")}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge
                                  variant={conn.status === "connected" ? "default" : "secondary"}
                                >
                                  {conn.status}
                                </Badge>
                                {conn.provider !== "manual" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => syncConnectionMutation.mutate(conn.id)}
                                    disabled={syncConnectionMutation.isPending}
                                  >
                                    <RefreshCw className={`w-4 h-4 ${syncConnectionMutation.isPending ? "animate-spin" : ""}`} />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Link2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">No connections yet</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Connect Adobe Analytics, AppDynamics, or Azure App Insights
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-medium text-muted-foreground">
                    Select a solution to view metrics
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose from the accepted proposals on the left
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Recommendations */}
        {dashboard && dashboard.top_recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {dashboard.top_recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border bg-muted/30"
                  >
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PlatformLayout>
  );
};

export default AdoptionMetricsPage;
