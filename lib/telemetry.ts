import { dataStore } from "./db";

interface MetricEntry {
  method: string;
  endpoint: string;
  statusCode: number;
  durationMs: number;
  timestamp: number;
}

class TelemetryCollector {
  private startTime = Date.now();
  private entries: MetricEntry[] = [];
  private totalRequests = 0;
  private statusCounts: { "2xx": number; "3xx": number; "4xx": number; "5xx": number } = {
    "2xx": 0,
    "3xx": 0,
    "4xx": 0,
    "5xx": 0
  };

  constructor() {
    // Seed baseline request entries
    this.recordRequest("GET", "/api/health", 200, 14);
    this.recordRequest("GET", "/api/jobs", 200, 35);
    this.recordRequest("GET", "/api/admin/stats", 200, 48);
  }

  public recordRequest(method: string, endpoint: string, statusCode: number, durationMs: number) {
    this.totalRequests += 1;
    if (statusCode >= 200 && statusCode < 300) this.statusCounts["2xx"] += 1;
    else if (statusCode >= 300 && statusCode < 400) this.statusCounts["3xx"] += 1;
    else if (statusCode >= 400 && statusCode < 500) this.statusCounts["4xx"] += 1;
    else if (statusCode >= 500) this.statusCounts["5xx"] += 1;

    this.entries.push({
      method,
      endpoint: endpoint.split("?")[0],
      statusCode,
      durationMs: Math.max(1, durationMs),
      timestamp: Date.now()
    });

    if (this.entries.length > 200) {
      this.entries.shift();
    }
  }

  public getSnapshot() {
    const errorCount = this.statusCounts["4xx"] + this.statusCounts["5xx"];
    const errorRatePercent =
      this.totalRequests > 0
        ? Number(((errorCount / this.totalRequests) * 100).toFixed(2))
        : 0;

    const latencies = this.entries.map((e) => e.durationMs).sort((a, b) => a - b);
    const avgLatencyMs =
      latencies.length > 0
        ? Number((latencies.reduce((sum, v) => sum + v, 0) / latencies.length).toFixed(1))
        : 0;

    const p50 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.5)] : 0;
    const p95 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] : 0;

    // Platform business metrics
    const totalStudents = dataStore.students.length;
    const totalJobs = dataStore.jobs.length;
    const activeJobs = dataStore.jobs.filter((j) => j.status === "OPEN").length;
    const totalApplications = dataStore.applications.length;
    const selectedCount = dataStore.applications.filter((a) => a.status === "SELECTED").length;
    const placementRate =
      totalStudents > 0 ? Number(((selectedCount / totalStudents) * 100).toFixed(1)) : 0;

    return {
      totalRequests: this.totalRequests,
      statusCounts: this.statusCounts,
      errorRatePercent,
      avgLatencyMs,
      p50LatencyMs: p50,
      p95LatencyMs: p95,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      business: {
        totalStudents,
        totalJobs,
        activeJobs,
        totalApplications,
        selectedCount,
        placementRate
      }
    };
  }

  public toPrometheusFormat(): string {
    const s = this.getSnapshot();
    const mem = process.memoryUsage();
    const appStatus = s.errorRatePercent > 20 ? 0 : 1;

    return [
      "# HELP placemate_http_requests_total Total HTTP requests handled by PlaceMate.",
      "# TYPE placemate_http_requests_total counter",
      `placemate_http_requests_total{status_group="2xx"} ${s.statusCounts["2xx"]}`,
      `placemate_http_requests_total{status_group="3xx"} ${s.statusCounts["3xx"]}`,
      `placemate_http_requests_total{status_group="4xx"} ${s.statusCounts["4xx"]}`,
      `placemate_http_requests_total{status_group="5xx"} ${s.statusCounts["5xx"]}`,
      "",
      "# HELP placemate_error_rate_percent Current HTTP error rate percentage.",
      "# TYPE placemate_error_rate_percent gauge",
      `placemate_error_rate_percent ${s.errorRatePercent}`,
      "",
      "# HELP placemate_http_request_duration_seconds HTTP request duration quantiles in seconds.",
      "# TYPE placemate_http_request_duration_seconds gauge",
      `placemate_http_request_duration_seconds{quantile="0.5"} ${(s.p50LatencyMs / 1000).toFixed(4)}`,
      `placemate_http_request_duration_seconds{quantile="0.95"} ${(s.p95LatencyMs / 1000).toFixed(4)}`,
      `placemate_http_request_duration_seconds{quantile="avg"} ${(s.avgLatencyMs / 1000).toFixed(4)}`,
      "",
      "# HELP placemate_app_status Overall application health (1 = healthy, 0 = degraded).",
      "# TYPE placemate_app_status gauge",
      `placemate_app_status ${appStatus}`,
      "",
      "# HELP placemate_students_registered_total Total number of registered student candidates.",
      "# TYPE placemate_students_registered_total gauge",
      `placemate_students_registered_total ${s.business.totalStudents}`,
      "",
      "# HELP placemate_jobs_active_total Total active campus placement job drives.",
      "# TYPE placemate_jobs_active_total gauge",
      `placemate_jobs_active_total ${s.business.activeJobs}`,
      "",
      "# HELP placemate_applications_total Total job applications submitted by candidates.",
      "# TYPE placemate_applications_total counter",
      `placemate_applications_total ${s.business.totalApplications}`,
      "",
      "# HELP placemate_placement_rate_percent Calculated campus placement conversion rate.",
      "# TYPE placemate_placement_rate_percent gauge",
      `placemate_placement_rate_percent ${s.business.placementRate}`,
      "",
      "# HELP placemate_uptime_seconds Application uptime in seconds.",
      "# TYPE placemate_uptime_seconds counter",
      `placemate_uptime_seconds ${s.uptimeSeconds}`,
      "",
      "# HELP placemate_heap_used_bytes V8 heap memory consumed.",
      "# TYPE placemate_heap_used_bytes gauge",
      `placemate_heap_used_bytes ${mem.heapUsed}`,
      ""
    ].join("\n");
  }

  public reset() {
    this.startTime = Date.now();
    this.entries = [];
    this.totalRequests = 0;
    this.statusCounts = { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0 };
  }
}

const globalForTelemetry = globalThis as unknown as { telemetryCollector?: TelemetryCollector };
export const telemetry = globalForTelemetry.telemetryCollector ?? new TelemetryCollector();

if (process.env.NODE_ENV !== "production") {
  globalForTelemetry.telemetryCollector = telemetry;
}
