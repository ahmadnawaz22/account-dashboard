import { useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Grid,
  FormControl,
  Select,
  MenuItem,
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
          Consumption
        </Typography>
        <Typography>No client selected</Typography>
      </Paper>
    );
  }

  // 🔹 Get all months available for this client
  const clientConsumption = (consumption || []).filter(
    (c) => c.ClientName === clientName
  );

  const allMonths = [
    ...new Set(
      clientConsumption
        .map((c) => String(c.Month).slice(0, 7)) // YYYY-MM
        .filter(Boolean)
    ),
  ].sort();

  // 🔹 State for from/to months
  const [fromMonth, setFromMonth] = useState(allMonths[0]);
  const [toMonth, setToMonth] = useState(allMonths[allMonths.length - 1]);

  // 🔹 Filtered data
  const filtered = useMemo(() => {
    if (!fromMonth || !toMonth) return [];
    const fromIdx = allMonths.indexOf(fromMonth);
    const toIdx = allMonths.indexOf(toMonth);
    if (fromIdx === -1 || toIdx === -1 || fromIdx > toIdx) return [];

    const range = allMonths.slice(fromIdx, toIdx + 1);

    return range.map((ym) => {
      const filtered = clientConsumption.filter((c) =>
        String(c.Month).startsWith(ym)
      );

      const grouped = {};
      filtered.forEach((c) => {
        grouped[c.Product] =
          (grouped[c.Product] || 0) + (Number(c.Volume) || 0);
      });

      return { month: ym, ...grouped };
    });
  }, [clientConsumption, allMonths, fromMonth, toMonth]);

  // 🔹 Collect distinct products
  const products = [
    ...new Set(clientConsumption.map((c) => c.Product).filter(Boolean)),
  ];

  // 🔹 Totals for selected period
  const totals = {};
  filtered.forEach((rec) => {
    products.forEach((p) => {
      totals[p] = (totals[p] || 0) + (Number(rec[p]) || 0);
    });
  });

  // --- UI ---
  return (
    <Paper sx={{ p: 3, mb: 3, height: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <Typography variant="h6" sx={{ color: "primary.main" }}>
          Consumption
        </Typography>

        {/* From / To Selectors */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <FormControl size="small">
            <Select value={fromMonth} onChange={(e) => setFromMonth(e.target.value)}>
              {allMonths.map((m) => (
                <MenuItem key={m} value={m}>
                  {new Date(m + "-01").toLocaleDateString("en-US", {
                    month: "short",
                    year: "2-digit",
                  })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <Select value={toMonth} onChange={(e) => setToMonth(e.target.value)}>
              {allMonths.map((m) => (
                <MenuItem key={m} value={m}>
                  {new Date(m + "-01").toLocaleDateString("en-US", {
                    month: "short",
                    year: "2-digit",
                  })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

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
        <BarChart data={filtered}>
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
