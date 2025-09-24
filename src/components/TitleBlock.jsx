import { Paper, Typography, Box, Button } from "@mui/material";
import StyledDropdown from "./StyledDropdown";

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
        <StyledDropdown
          label="Customer"
          value={filters.ClientName || ""}
          options={unique("ClientName")}
          onChange={(val) => setFilters((prev) => ({ ...prev, ClientName: val }))}
        />
        <StyledDropdown
          label="Commercial Name"
          value={filters.CustomerName || ""}
          options={unique("CustomerName")}
          onChange={(val) => setFilters((prev) => ({ ...prev, CustomerName: val }))}
        />
        <StyledDropdown
          label="Account Manager"
          value={filters.AccountManager || ""}
          options={unique("AccountManager")}
          onChange={(val) => setFilters((prev) => ({ ...prev, AccountManager: val }))}
        />
        <StyledDropdown
          label="Status"
          value={filters.Status || ""}
          options={unique("Status")}
          onChange={(val) => setFilters((prev) => ({ ...prev, Status: val }))}
        />

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
