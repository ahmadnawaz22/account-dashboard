import { useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// Format numbers (k/m style)
function formatNumber(value) {
  if (!value || isNaN(value)) return "0";
  if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toFixed(1) + "m";
  if (Math.abs(value) >= 1_000) return (value / 1_000).toFixed(1) + "k";
  return value.toString();
}

function UtilizationAnalysisBlock({ clientName, contractComponents, consumption }) {
  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  // Collect distinct products for this client
  const clientProducts = [
    ...new Set(
      (contractComponents || [])
        .filter((c) => c.ClientName === clientName)
        .map((c) => c.SubProduct)
    ),
  ];

  const [selectedProduct, setSelectedProduct] = useState(clientProducts[0] || "");

  // Build chart data
  const chartData = useMemo(() => {
    if (!selectedProduct || !clientName) return [];

    const activeContracts = (contractComponents || []).filter((c) => {
      const start = new Date(c.StartDate);
      const end = new Date(c.EndDate);
      return (
        c.ClientName === clientName &&
        c.SubProduct === selectedProduct &&
        !isNaN(start) &&
        !isNaN(end) &&
        start <= today &&
        end >= today
      );
    });

    if (activeContracts.length === 0) return [];

    const minStart = new Date(
      Math.min(...activeContracts.map((c) => new Date(c.StartDate)))
    );
    const maxEnd = new Date(
      Math.max(...activeContracts.map((c) => new Date(c.EndDate)))
    );

    // Generate list of months between start and end
    const months = [];
    const d = new Date(minStart.getFullYear(), minStart.getMonth(), 1);
    while (d <= maxEnd) {
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      d.setMonth(d.getMonth() + 1);
    }

    // Aggregate LicenseOrdered across contracts
    const totalOrdered = activeContracts.reduce(
      (sum, c) => sum + (Number(c.LicenseOrdered) || 0),
      0
    );

    // Prepare cumulative ordered line
    let orderedSoFar = 0;
    const orderedPerMonth = Math.round(totalOrdered / months.length);

    const licenseOrderedLine = months.map((m) => {
      orderedSoFar += orderedPerMonth;
      return { month: m, LicenseOrdered: orderedSoFar };
    });

    // Consumption data
    const clientConsumption = (consumption || []).filter(
      (c) => c.ClientName === clientName && c.Product === selectedProduct
    );

    const monthlyConsumption = {};
    clientConsumption.forEach((c) => {
      const ym = String(c.Month).slice(0, 7); // YYYY-MM
      monthlyConsumption[ym] =
        (monthlyConsumption[ym] || 0) + (Number(c.Volume) || 0);
    });

    // Prepare cumulative consumed line
    let consumedSoFar = 0;
    const licenseConsumedLine = months.map((m) => {
      consumedSoFar += monthlyConsumption[m] || 0;
      return { month: m, LicenseConsumed: consumedSoFar };
    });

    // Merge ordered + consumed
    return months.map((m, idx) => ({
      month: m,
      LicenseOrdered: licenseOrderedLine[idx].LicenseOrdered,
      LicenseConsumed: licenseConsumedLine[idx].LicenseConsumed,
    }));
  }, [clientName, selectedProduct, contractComponents, consumption]);

  // --- Tile Values ---
  const contractedLicenses =
    chartData.length > 0 ? chartData[chartData.length - 1].LicenseOrdered : 0; // Final value
  const accruedLicenses =
    chartData.find((d) => d.month === currentMonthKey)?.LicenseOrdered || 0; // Current month
  const totalConsumption =
    chartData.find((d) => d.month === currentMonthKey)?.LicenseConsumed || 0; // Current month

  const remainingLicenses = contractedLicenses - totalConsumption;

  // --- Consumption Rate (daily average of last 6 months + current) ---
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);

  const recentConsumption = (consumption || []).filter((c) => {
    const cDate = new Date(c.Month);
    return (
      c.ClientName === clientName &&
      c.Product === selectedProduct &&
      cDate >= sixMonthsAgo &&
      cDate <= today
    );
  });

  const totalRecentVolume = recentConsumption.reduce(
    (sum, c) => sum + (Number(c.Volume) || 0),
    0
  );

  const totalDays =
    Math.ceil((today - sixMonthsAgo) / (1000 * 60 * 60 * 24)) || 1;

  const dailyConsumptionRate = totalRecentVolume / totalDays;

  // --- Full Utilization Date ---
  const daysToExhaust =
    dailyConsumptionRate > 0
      ? Math.ceil(remainingLicenses / dailyConsumptionRate)
      : null;

  let fullUtilizationDate = "N/A";
  if (daysToExhaust !== null) {
    const future = new Date(today);
    future.setDate(future.getDate() + daysToExhaust);
    fullUtilizationDate = future.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  }

  if (!clientName) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="primary.main">
          Utilization Analysis
        </Typography>
        <Typography>No client selected</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      {/* Top bar with title and selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
          Utilization Analysis
        </Typography>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            {clientProducts.map((p, idx) => (
              <MenuItem key={idx} value={p}>
                {p}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Tiles + Chart Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "16px",
          alignItems: "stretch", // ensures chart and tiles stretch together
          minHeight: "400px",    // ensure good height baseline
        }}
      >
        {/* Tiles Section (left-aligned, narrower) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            width: "180px", // narrower tiles
          }}
        >
          <Paper style={{ padding: "12px", textAlign: "center" }}>
            <Typography variant="body2" color="secondary">Contracted Licenses</Typography>
            <Typography variant="h6">
              {contractedLicenses.toLocaleString()}
            </Typography>
          </Paper>

          <Paper style={{ padding: "12px", textAlign: "center" }}>
            <Typography variant="body2" color="Orange">Accrued Licenses</Typography>
            <Typography variant="h6">
              {accruedLicenses.toLocaleString()}
            </Typography>
          </Paper>

          <Paper style={{ padding: "12px", textAlign: "center" }}>
            <Typography variant="body2" color="secondary">Total Consumption</Typography>
            <Typography variant="h6">
              {totalConsumption.toLocaleString()}
            </Typography>
          </Paper>

          <Paper style={{ padding: "12px", textAlign: "center" }}>
            <Typography variant="body2" color="secondary">Remaining Licenses</Typography>
            <Typography variant="h6">{formatNumber(remainingLicenses)}</Typography>
          </Paper>

          <Paper style={{ padding: "12px", textAlign: "center" }}>
            <Typography variant="body2" color="secondary">Daily Rate</Typography>
            <Typography variant="h6">
              {dailyConsumptionRate ? dailyConsumptionRate.toFixed(2) : "0"} /day
            </Typography>
          </Paper>

          <Paper style={{ padding: "12px", textAlign: "center" }}>
            <Typography variant="body2" color="secondary">Full Utilization Date</Typography>
            <Typography variant="h6">{fullUtilizationDate}</Typography>
          </Paper>
        </div>

        {/* Chart Section (right, takes all remaining space & height) */}
        <div style={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
              <YAxis tickFormatter={(val) => formatNumber(val)} />
              <Tooltip formatter={(val) => formatNumber(val)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="LicenseOrdered"
                stroke="#1E88E5"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="LicenseConsumed"
                stroke="#E53935"
                strokeWidth={2}
              />

              {/* Current month marker */}
              <ReferenceLine
                x={currentMonthKey}
                stroke="rgba(0,0,0,0.4)"
                strokeDasharray="4 4"
                label={{
                  value: "Current Month",
                  position: "top",
                  fill: "#555",
                  fontSize: 12,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Paper>
  );

}

export default UtilizationAnalysisBlock;
