import { Paper, Box, Button, TextField, MenuItem } from "@mui/material";

function TitleBlock({ rows, filters, setFilters }) {
  // 🔹 Apply filters to narrow down valid rows
  const filteredRows = rows.filter((r) => {
    return (
      (!filters.ClientName || r.ClientName === filters.ClientName) &&
      (!filters.CustomerName || r.CustomerName === filters.CustomerName) &&
      (!filters.AccountManager || r.AccountManager === filters.AccountManager) &&
      (!filters.Status || r.Status === filters.Status)
    );
  });

  // 🔹 Generate unique options based on *filtered rows*
  const unique = (key) =>
    [...new Set(filteredRows.map((r) => r[key]).filter(Boolean))];

  const handleClearAll = () => setFilters({});

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <TextField
          select
          label="Customer"
          value={filters.ClientName || ""}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, ClientName: e.target.value }))
          }
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {unique("ClientName").map((opt, idx) => (
            <MenuItem key={idx} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Commercial Name"
          value={filters.CustomerName || ""}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, CustomerName: e.target.value }))
          }
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {unique("CustomerName").map((opt, idx) => (
            <MenuItem key={idx} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Account Manager"
          value={filters.AccountManager || ""}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, AccountManager: e.target.value }))
          }
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {unique("AccountManager").map((opt, idx) => (
            <MenuItem key={idx} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Status"
          value={filters.Status || ""}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, Status: e.target.value }))
          }
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {unique("Status").map((opt, idx) => (
            <MenuItem key={idx} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        {/* Clear All Button */}
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleClearAll}
          sx={{ alignSelf: "center", ml: 2 }}
        >
          Clear All
        </Button>
      </Box>
    </Paper>
  );
}

export default TitleBlock;
