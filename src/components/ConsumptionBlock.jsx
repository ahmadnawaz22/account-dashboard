import {
  Paper,
  Typography,
  Grid,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- Helpers ---
// Format numbers with k/m
function formatNumber(value) {
  if (!value || isNaN(value)) return "0";
  if (Math.abs(value) >= 1_000_000)
    return (value / 1_000_000).toFixed(1) + "m";
  if (Math.abs(value) >= 1_000)
    return (value / 1_000).toFixed(1) + "k";
  return value.toString();
}

function ConsumptionBlock({ clientName, consumption }) {
  if (!clientName) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="primary.main">
          12 months Consumption
        </Typography>
        <Typography>No client selected</Typography>
      </Paper>
    );
  }

  const today = new Date();

  // 🔹 Last 12 months + current
  const last13Months = Array.from({ length: 13 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }).reverse();

  // 🔹 Filter consumption for this client
  const clientConsumption = (consumption || []).filter(
    (c) => c.ClientName === clientName
  );

  // 🔹 Aggregate monthly by Product
  const consumptionByMonth = last13Months.map((ym) => {
    const filtered = clientConsumption.filter((c) =>
      String(c.Month).startsWith(ym)
    );

    const grouped = {};
    filtered.forEach((c) => {
      const product = c.Product;
      grouped[product] = (grouped[product] || 0) + (Number(c.Volume) || 0);
    });

    return { month: ym, ...grouped };
  });

  // 🔹 Collect distinct products
  const products = [
    ...new Set(clientConsumption.map((c) => c.Product).filter(Boolean)),
  ];

  // 🔹 Totals per product
  const totals = {};
  clientConsumption.forEach((c) => {
    totals[c.Product] = (totals[c.Product] || 0) + (Number(c.Volume) || 0);
  });

  // --- UI ---
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
        12 months Consumption
      </Typography>

      {/* Totals per product */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {products.map((p, idx) => (
          <Grid key={idx} item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                textAlign: "center",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              <Typography variant="body2" color="secondary.main">
                {p}
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                {formatNumber(totals[p])}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={consumptionByMonth}>
          <XAxis
            dataKey="month"
            tickFormatter={(val) => {
              const [y, m] = val.split("-");
              return new Date(y, m - 1).toLocaleDateString("en-US", {
                month: "short",
                year: "2-digit",
              });
            }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {products.map((p, idx) => {
            const palette = [
              "#1E88E5", "#3949AB", "#7E57C2", "#26A69A", "#546E7A",
            ];
            const color = palette[idx % palette.length];
            return <Bar key={idx} dataKey={p} stackId="a" fill={color} />;
          })}
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default ConsumptionBlock;
