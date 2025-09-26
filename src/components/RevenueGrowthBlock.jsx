import { Paper, Typography, Grid, Box } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

function formatCurrency(value) {
  if (!value || isNaN(value)) return "$0";
  if (Math.abs(value) >= 1_000_000)
    return "$" + (value / 1_000_000).toFixed(1) + "m";
  if (Math.abs(value) >= 1_000)
    return "$" + (value / 1_000).toFixed(1) + "k";
  return "$" + value;
}

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

  // (same calculations as before, shortened here for clarity)
  const r = rows[0];
  const clientName = r.ClientName;
  const normalizedSummary = (revenueSummary || []).map((rec) => ({
    CustomerName: rec.CustomerName,
    SubProductName: rec.SubProductName,
    Month: normalizeMonth(rec.Month),
    MRR: Number(rec.MRR?.replace(/,/g, "")) || 0,
    Revenue: Number(rec.Revenue?.replace(/,/g, "")) || 0,
  }));
  const todayMonth = normalizeMonth(new Date());
  const clientMRR = normalizedSummary
    .filter((rec) => rec.CustomerName === clientName && rec.Month === todayMonth)
    .reduce((sum, rec) => sum + rec.MRR, 0);
  const clientARR = clientMRR * 12;
  const totalMRR = normalizedSummary
    .filter((rec) => rec.Month === todayMonth)
    .reduce((sum, rec) => sum + rec.MRR, 0);
  const totalARR = totalMRR * 12;
  const arrPct = totalARR > 0 ? (clientARR / totalARR) * 100 : 0;
  const clientMonthlyRevenue = normalizedSummary
    .filter((rec) => rec.CustomerName === clientName && rec.Month === todayMonth)
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

      <Box sx={{ display: "flex", gap: 3 }}>
        {/* KPI Column */}
        <Box
          sx={{
            width: 240, // fixed width for tiles
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <InfoTile label="Client ARR" value={formatCurrency(clientARR)} />
          <InfoTile label="% of Total ARR" value={`${arrPct.toFixed(1)}%`} />
          <InfoTile
            label="Client Annualized Revenue"
            value={formatCurrency(clientAnnualizedRevenue)}
          />
          <InfoTile
            label="% of Total Revenue"
            value={`${revenuePct.toFixed(1)}%`}
          />
        </Box>

        {/* Chart expands */}
<Box sx={{ flexGrow: 1 }}>
  <Typography variant="subtitle1" sx={{ mb: 1, color: "secondary.main" }}>
    Revenue per Month (last 12 months)
  </Typography>
  <ResponsiveContainer width="100%" height={380}>
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
      <Legend
        verticalAlign="top"
        align="right"
        wrapperStyle={{ paddingBottom: 10 }}
      />
      {subProducts.map((sub, idx) => {
        const palette = [
          "#1E88E5",
          "#3949AB",
          "#7E57C2",
          "#26A69A",
          "#546E7A",
        ];
        return (
          <Bar
            key={idx}
            dataKey={sub}
            stackId="a"
            fill={palette[idx % palette.length]}
            fillOpacity={1}
          />
        );
      })}
    </BarChart>
  </ResponsiveContainer>
</Box>

      </Box>
    </Paper>
  );
}

export default RevenueGrowthBlock;
