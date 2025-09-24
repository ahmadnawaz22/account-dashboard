import { Paper, Typography, Grid } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Small info card
function InfoTile({ label, value }) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        textAlign: "center",
        backgroundColor: "rgba(255,255,255,0.05)",
        minHeight: 80,
      }}
    >
      <Typography variant="body2" color="secondary.main">
        {label}
      </Typography>
      <Typography variant="subtitle1" color="text.primary" fontWeight="bold">
        {value}
      </Typography>
    </Paper>
  );
}

// Currency formatter
function formatCurrency(value) {
  if (!value || isNaN(value)) return "$0";
  if (Math.abs(value) >= 1_000_000)
    return "$" + (value / 1_000_000).toFixed(1) + "m";
  if (Math.abs(value) >= 1_000)
    return "$" + (value / 1_000).toFixed(1) + "k";
  return "$" + value;
}

// Normalize ISO date → YYYY-MM
function normalizeMonth(val) {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d)) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function RevenueGrowthBlock({ rows, revenueSummary }) {
  if (!rows || rows.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: "primary.main" }}>
          Revenue & Growth
        </Typography>
        <Typography>No matching customer</Typography>
      </Paper>
    );
  }

  // Selected client
  const r = rows[0];
  const clientName = r.ClientName;

  // Normalize RevenueSummary
  const normalizedSummary = (revenueSummary || []).map((rec) => ({
    CustomerName: rec.CustomerName,
    SubProductName: rec.SubProductName,
    Month: normalizeMonth(rec.Month),
    MRR: Number(rec.MRR?.replace(/,/g, "")) || 0,
    Revenue: Number(rec.Revenue?.replace(/,/g, "")) || 0,
  }));

  // Current month
  const todayMonth = normalizeMonth(new Date());

  // 🔹 ARR
  const clientMRR = normalizedSummary
    .filter(
      (rec) => rec.CustomerName === clientName && rec.Month === todayMonth
    )
    .reduce((sum, rec) => sum + rec.MRR, 0);
  const clientARR = clientMRR * 12;

  const totalMRR = normalizedSummary
    .filter((rec) => rec.Month === todayMonth)
    .reduce((sum, rec) => sum + rec.MRR, 0);
  const totalARR = totalMRR * 12;
  const arrPct = totalARR > 0 ? (clientARR / totalARR) * 100 : 0;

  // 🔹 Annualized Revenue
  const clientMonthlyRevenue = normalizedSummary
    .filter(
      (rec) => rec.CustomerName === clientName && rec.Month === todayMonth
    )
    .reduce((sum, rec) => sum + rec.Revenue, 0);
  const clientAnnualizedRevenue = clientMonthlyRevenue * 12;

  const totalMonthlyRevenue = normalizedSummary
    .filter((rec) => rec.Month === todayMonth)
    .reduce((sum, rec) => sum + rec.Revenue, 0);
  const totalAnnualizedRevenue = totalMonthlyRevenue * 12;
  const revenuePct =
    totalAnnualizedRevenue > 0
      ? (clientAnnualizedRevenue / totalAnnualizedRevenue) * 100
      : 0;

  // 🔹 Last 12 months data
  const today = new Date();
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return normalizeMonth(d);
  }).reverse();

  const revenueByMonth = last12Months.map((ym) => {
    const filtered = normalizedSummary.filter(
      (rec) => rec.CustomerName === clientName && rec.Month === ym
    );

    const grouped = {};
    filtered.forEach((rec) => {
      grouped[rec.SubProductName] =
        (grouped[rec.SubProductName] || 0) + rec.Revenue;
    });

    return { month: ym, ...grouped };
  });

  const subProducts = [
    ...new Set(
      normalizedSummary
        .filter((rec) => rec.CustomerName === clientName)
        .map((rec) => rec.SubProductName)
    ),
  ];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
        Revenue & Growth
      </Typography>

      {/* KPI tiles */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <InfoTile label="Client ARR" value={formatCurrency(clientARR)} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <InfoTile label="% of Total ARR" value={`${arrPct.toFixed(1)}%`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <InfoTile
            label="Client Annualized Revenue"
            value={formatCurrency(clientAnnualizedRevenue)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <InfoTile
            label="% of Total Revenue"
            value={`${revenuePct.toFixed(1)}%`}
          />
        </Grid>
      </Grid>

      {/* Chart */}
      <Typography variant="subtitle1" sx={{ mb: 1, color: "secondary.main" }}>
        Revenue per Month (last 12 months)
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={revenueByMonth}>
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
          <YAxis tickFormatter={(val) => formatCurrency(val)} />
          <Tooltip formatter={(val) => formatCurrency(val)} />
          <Legend />
          {subProducts.map((sub, idx) => {
            const palette = [
              "#1E88E5", // Blue
              "#3949AB", // Indigo
              "#7E57C2", // Purple
              "#26A69A", // Teal
              "#546E7A", // Gray
            ];
            const color = palette[idx % palette.length];
            return <Bar key={idx} dataKey={sub} stackId="a" fill={color} />;
          })}
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default RevenueGrowthBlock;
