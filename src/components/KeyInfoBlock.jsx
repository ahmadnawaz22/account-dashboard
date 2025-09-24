import { Paper, Typography, Grid, Button } from "@mui/material";

// Small tile card
function InfoTile({ label, value, isLink }) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        textAlign: "center",
        backgroundColor: "rgba(255,255,255,0.05)",
        minHeight: 80,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography
        variant="body2"
        color="secondary.main"
        sx={{ mb: 0.5 }}
      >
        {label}
      </Typography>

      {isLink && value ? (
        <Button
          variant="contained"         // 👈 contained = filled background
          color="primary"             // 👈 uses theme primary (your blue)
          size="small"
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            alignSelf: "center",
            fontSize: "0.70rem",
            px: 1.5,
            py: 0.25,
            textTransform: "none",    // 👈 keeps text readable (not all-caps)
          }}
        >
          Open Folder
        </Button>
      ) : (
        <Typography
          variant="subtitle2"
          color="text.primary"
          fontWeight="bold"
          sx={{ fontSize: "0.85rem" }}
        >
          {value || "N/A"}
        </Typography>
      )}
    </Paper>
  );
}

function KeyInfoBlock({ rows, clients }) {
  if (!rows || rows.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: "primary.main" }}>
          Customer Information
        </Typography>
        <Typography>No matching customer</Typography>
      </Paper>
    );
  }

  const r = rows[0];
  const clientMatch = clients.find(
    (c) => c.CompanyName === r.ClientName
  ) || {};

  // Prepare info tiles
  const info = [
    { label: "Customer Name", value: r.ClientName },
    { label: "Commercial Name", value: r.CustomerName },
    { label: "Deal Type", value: clientMatch.DealType },
    { label: "Account Manager", value: r.AccountManager },
    { label: "Customer Success", value: clientMatch.CustomerSuccess },
    { label: "Executive Sponsor", value: clientMatch.ExecutiveSponsor },
    { label: "Support Type", value: clientMatch.SupportType },
    { label: "Deal Category", value: clientMatch.DealCategory },
    { label: "Active Countries", value: clientMatch.ActiveCountries },
    {
      label: "Contract Folder",
      value: clientMatch.ContractsFolder,
      isLink: true,
    },
  ];

  return (
    <Paper sx={{ p: 3, mb: 3, height: "100%" }}>
      <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
        Customer Information
      </Typography>
      <Grid container spacing={2}>
        {info.map((item, idx) => (
          <Grid key={idx} item xs={12} sm={6} md={4}>
            <InfoTile
              label={item.label}
              value={item.value}
              isLink={item.isLink}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

export default KeyInfoBlock;
