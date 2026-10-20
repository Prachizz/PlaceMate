# PlaceMate Grafana Cloud Observability Setup Guide

This guide details how to set up production monitoring for the **PlaceMate Campus Placement Management Platform** using **Grafana Cloud Free Tier**.

---

## 1. Why Serverless Telemetry Requires Special Consideration

In a traditional VM deployment, a Prometheus server periodically pulls/scrapes `http://localhost:9090` over an internal private network.

In serverless architectures (like Next.js on Vercel):
- **Functions Scale to Zero:** When no requests arrive, Lambda containers freeze or terminate. An external scraper cannot reach an internal port.
- **Sandboxed Execution:** There is no persistent local daemon scraping memory metrics.

**The PlaceMate Solution:**
1. **Public Prometheus Scrape Target (`/api/metrics`):** PlaceMate formats application SLIs and business metrics into standard OpenMetrics / Prometheus 0.0.4 text format.
2. **Grafana Synthetic Monitoring / Cloud Agent:** Pings `/api/metrics` every 15–30 seconds. This continuously ingests metrics and keeps the Lambda container warm.

---

## 2. Step-by-Step Grafana Cloud Setup

1. **Sign Up:** Create a free account at [grafana.com/signup](https://grafana.com/signup).
2. **Open Your Grafana Instance:** Navigate to `https://<your-org>.grafana.net`.
3. **Import Dashboard:**
   - In the left sidebar, navigate to **Dashboards** -> **New** -> **Import**.
   - Click **Upload dashboard JSON file** and select `grafana/dashboard.json` from this repository.
   - Map `DS_PROMETHEUS` to your Grafana Cloud Prometheus datasource.
   - Click **Import**.

---

## 3. Connecting Ingestion

### Option A: Grafana Cloud Synthetic Monitoring (Recommended)
1. Go to **Testing & Synthetics** -> **Synthetic Monitoring**.
2. Click **Add Check** -> **HTTP**.
3. URL: `https://<your-vercel-deployment-url>/api/metrics`
4. Frequency: `15s` or `30s`.
5. Expected response status: `200`.

### Option B: OpenTelemetry (OTLP) Push
If using active pushing:
1. In Grafana Cloud, go to **OpenTelemetry** details.
2. Add your credentials to Vercel Environment Variables:
   - `GRAFANA_OTLP_ENDPOINT`: `https://otlp-gateway-prod-us-central-0.grafana.net/otlp/v1/metrics`
   - `GRAFANA_OTLP_USER_ID`: `<your-user-id>`
   - `GRAFANA_OTLP_API_KEY`: `<your-api-key>`

---

## 4. Key Metrics Tracked

| Metric | Type | Purpose |
|---|---|---|
| `placemate_app_status` | Gauge | Platform health (1 = Healthy, 0 = Degraded) |
| `placemate_error_rate_percent` | Gauge | Calculated HTTP error rate |
| `placemate_http_request_duration_seconds` | Gauge | Request latency quantiles (p50, p95, avg) |
| `placemate_students_registered_total` | Gauge | Number of candidate profiles |
| `placemate_jobs_active_total` | Gauge | Active placement drives |
| `placemate_applications_total` | Counter | Total applications submitted |
| `placemate_placement_rate_percent` | Gauge | Campus placement conversion rate (%) |
| `placemate_heap_used_bytes` | Gauge | V8 memory utilization |
