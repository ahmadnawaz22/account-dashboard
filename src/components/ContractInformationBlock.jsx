import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
} from "@mui/material";

// Formatter for big amounts (Amount, Subtotal)
function formatCurrency(value) {
  if (!value || isNaN(value)) return "$0";
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// Formatter for Price (always 2 decimals)
function formatPrice(value) {
  if (!value || isNaN(value)) return "$0.00";
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Formatter for LicenseOrdered (comma grouping, no decimals)
function formatNumber(value) {
  if (!value || isNaN(value)) return "0";
  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

// Date formatter
function formatDate(val) {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function ContractInformationBlock({ rows }) {
  if (!rows || rows.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: "primary.main" }}>
          Contracts Information
        </Typography>
        <Typography>No active contracts found</Typography>
      </Paper>
    );
  }

  const today = new Date();

  // Filter valid contracts
  const activeContracts = rows.filter((r) => {
    const start = new Date(r.StartDate);
    const end = new Date(r.EndDate);
    return (
      r.Description !== "Unsigned Prospect Contract" &&
      !isNaN(start) &&
      !isNaN(end) &&
      start <= today &&
      end >= today
    );
  });

  if (activeContracts.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: "primary.main" }}>
          Contracts Information
        </Typography>
        <Typography>No active contracts found</Typography>
      </Paper>
    );
  }

  // Group by ContractComponentID
  const grouped = activeContracts.reduce((acc, row) => {
    if (!acc[row.ContractComponentID]) acc[row.ContractComponentID] = [];
    acc[row.ContractComponentID].push(row);
    return acc;
  }, {});

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      {/* Big title */}
      <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
        Contracts Information
      </Typography>

      <Box>
        {Object.entries(grouped).map(([componentId, contracts]) => {
          const subtotal = contracts.reduce(
            (sum, c) =>
              sum +
              (Number(c.Amount?.toString().replace(/,/g, "")) || 0),
            0
          );

          return (
            <Paper
              key={componentId}
              sx={{
                p: 2,
                mb: 2,
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
              elevation={1}
            >
              {/* Smaller title */}
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: 500, color: "secondary.main" }}
              >
                {componentId} — {contracts[0].Description}
              </Typography>

              <Table size="small">
                <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.04)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Sub Product</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="right">
                      License Ordered
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="right">
                      Price
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="right">
                      Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      VAT Applicable
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contracts.map((c, idx) => (
                    <TableRow key={idx} sx={{ '& td': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
                      <TableCell>{formatDate(c.StartDate)}</TableCell>
                      <TableCell>{formatDate(c.EndDate)}</TableCell>
                      <TableCell>{c.SubProduct}</TableCell>
                      <TableCell align="right">
                        {formatNumber(
                          Number(c.LicenseOrdered?.toString().replace(/,/g, "")) || 0
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {formatPrice(
                          Number(c.Price?.toString().replace(/,/g, "")) || 0
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(
                          Number(c.Amount?.toString().replace(/,/g, "")) || 0
                        )}
                      </TableCell>
                      <TableCell>{c.VATApplicable}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={5} align="right" sx={{ fontWeight: "bold", borderTop: '2px solid rgba(224, 224, 224, 1)' }}>
                      Subtotal
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold", borderTop: '2px solid rgba(224, 224, 224, 1)' }}>
                      {formatCurrency(subtotal)}
                    </TableCell>
                    <TableCell sx={{ borderTop: '2px solid rgba(224, 224, 224, 1)' }} />
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
}

export default ContractInformationBlock;
