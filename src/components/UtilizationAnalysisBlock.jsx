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

  // 🔹 Collect distinct products for this client
  const clientProducts = [
    ...new Set(
      (contractComponents || [])
        .filter((c) => c.ClientName === clientName)
        .map((c) => c.SubProduct)
    ),
  ];

  const [selectedProduct, setSelectedProduct] = useState(clientProducts[0] || "");

  // 🔹 Build chart data
  const chartData = useMemo(() => {
    if (!selectedProduct || !clientName) return [];

    // Filter contracts for this product & client, where today is within contract period
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

    // Determine time range (earliest start to latest end)
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

    // Prepare cumulative ordered line (equal value spread across all months cumulatively)
    let orderedSoFar = 0;
    const orderedPerMonth = Math.round(totalOrdered / months.length);

    const licenseOrderedLine = months.map((m, idx) => {
      orderedSoFar += orderedPerMonth;
      return { month: m, LicenseOrdered: orderedSoFar };
    });

    // Consumption data
    const clientConsumption = (consumption || []).filter(
      (c) => c.ClientName === clientName && c.Product === selectedProduct
    );

    // Group consumption by month
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
          Utilization Analysis
        </Typography>

        {/* Product Selector */}
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

      <ResponsiveContainer width="100%" height={300}>
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
          <Line type="monotone" dataKey="LicenseOrdered" stroke="#1E88E5" strokeWidth={2} />
          <Line type="monotone" dataKey="LicenseConsumed" stroke="#E53935" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default UtilizationAnalysisBlock;
