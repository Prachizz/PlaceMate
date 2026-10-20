import { telemetry } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

export async function GET() {
  const reqStart = Date.now();
  const prometheusText = telemetry.toPrometheusFormat();

  telemetry.recordRequest("GET", "/api/metrics", 200, Date.now() - reqStart);

  return new Response(prometheusText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate"
    }
  });
}
