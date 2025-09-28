import { useState, useMemo } from "react";
import {
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Box,
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

  // 🔹 Client consumption
  const clientConsumption = (consumption || []).filter(
    (c) => c.ClientName === clientName
  );

  // 🔹 All months (YYYY-MM)
  const allMonths = [
    ...new Set(
      clientConsumption
        .map((c) => String(c.Month).slice(0, 7))
        .filter(Boolean)
    ),
  ].sort();

  const [fromMonth, setFromMonth] = useState(allMonths[0]);
  const [toMonth, setToMonth] = useState(allMonths[allMonths.length - 1]);

  // 🔹 Filtered data for chart
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

  // 🔹 Distinct products
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
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: "primary.main" }}>
          Consumption
        </Typography>

        {/* From / To Selectors */}
        <Box sx={{ display: "flex", gap: 2 }}>
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
        </Box>
      </Box>

      {/* Main content: Tiles left, Chart right */}
      <Box sx={{ display: "flex", gap: 2, height: 400 }}>
        {/* Tiles column */}
        <Box
          sx={{
            width: 220,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "auto",
          }}
        >
          {products.map((p, idx) => (
            <Paper
              key={idx}
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
          ))}
        </Box>

        {/* Chart */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
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
                  "#1E88E5",
                  "#3949AB",
                  "#7E57C2",
                  "#26A69A",
                  "#546E7A",
                ];
                return (
                  <Bar
                    key={idx}
                    dataKey={p}
                    stackId="a"
                    fill={palette[idx % palette.length]}
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

export default ConsumptionBlock;
