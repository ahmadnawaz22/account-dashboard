import { Paper, Typography, Grid } from "@mui/material";

// Tile card
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

// Format currency with $ and k/m
function formatCurrency(value) {
  if (!value || isNaN(value)) return "$0";
  if (Math.abs(value) >= 1_000_000) {
    return "$" + (value / 1_000_000).toFixed(1) + "m";
  }
  if (Math.abs(value) >= 1_000) {
    return "$" + (value / 1_000).toFixed(1) + "k";
  }
  return "$" + value;
}

// Format date MMM-YY
function formatDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (isNaN(date)) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

function ClientHealthBlock({ rows, clients, receipts }) {
  if (!rows || rows.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: "primary.main" }}>
          Customer Status
        </Typography>
        <Typography>No matching customer</Typography>
      </Paper>
    );
  }

  // Take the first selected customer
  const r = rows[0];
  const ClientName = r.ClientName || r.ClientName; // ensure we grab correct field

  // Lookup client metadata
  const clientMatch =
    clients.find((c) => c.CompanyName === ClientName) || {};

  // 🔹 Total Collection from Receipts table
  const totalCollection = (receipts || [])
    .filter((rec) => rec.ClientName === ClientName) // match by ClientName
    .reduce((sum, rec) => sum + (Number(rec.RevenueCollection) || 0), 0);

  const info = [
    { label: "Client Since", value: formatDate(clientMatch.ClientSince) },
    { label: "Lifetime Months", value: clientMatch.LifeTimemonths },
    { label: "Renewal Date", value: formatDate(clientMatch.RenewalDate) },
    { label: "Months to Renewal", value: clientMatch.MonthstoRenewal },
    { label: "License Type", value: clientMatch.LicenseType },
    { label: "Renewal Type", value: clientMatch.RenewalType },
    { label: "Rollover Clause", value: clientMatch.Rollover },
    { label: "Status", value: clientMatch.Status },
    { label: "Total Collection", value: formatCurrency(totalCollection) }, // ✅ now works
  ];

  return (
    <Paper sx={{ p: 3, mb: 3, height: "100%" }}>
      <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
        Customer Status
      </Typography>
      <Grid container spacing={2}>
        {info.map((item, idx) => (
          <Grid key={idx} item xs={12} sm={6} md={4}>
            <InfoTile label={item.label} value={item.value} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

export default ClientHealthBlock;
