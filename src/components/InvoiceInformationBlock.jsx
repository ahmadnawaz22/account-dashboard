import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

// Currency formatter
function formatCurrency(value) {
  if (!value || isNaN(value)) return "$0";
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
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

function InvoicingInformationBlock({ contractComponents, invoices, clientName }) {
  if (!clientName) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: "primary.main" }}>
          Invoicing Information
        </Typography>
        <Typography>No client selected</Typography>
      </Paper>
    );
  }

  const today = new Date();

  // 1️⃣ Filter active contracts for this client
  const activeContracts = (contractComponents || []).filter((r) => {
    const start = new Date(r.StartDate);
    const end = new Date(r.EndDate);
    return (
      r.ClientName === clientName &&
      !isNaN(start) &&
      !isNaN(end) &&
      start <= today &&
      end >= today
    );
  });

  const activeIds = [...new Set(activeContracts.map((c) => c.ContractComponentID))];

  if (activeIds.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: "primary.main" }}>
          Invoicing Information
        </Typography>
        <Typography>No active contracts found</Typography>
      </Paper>
    );
  }

  // 2️⃣ Filter invoices by matching ContractComponentID
  const filteredInvoices = (invoices || []).filter((inv) =>
    activeIds.includes(inv.ContractComponentID)
  );

  if (filteredInvoices.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: "primary.main" }}>
          Invoicing Information
        </Typography>
        <Typography>No invoices found for this client</Typography>
      </Paper>
    );
  }

  // 3️⃣ Subtotals
  const subtotalInvoice = filteredInvoices.reduce(
    (sum, inv) =>
      sum + (Number(inv.InvoiceAmount?.toString().replace(/,/g, "")) || 0),
    0
  );
  const subtotalOutstanding = filteredInvoices.reduce(
    (sum, inv) =>
      sum + (Number(inv.OutstandingAmount?.toString().replace(/,/g, "")) || 0),
    0
  );

  // 4️⃣ Render
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
        Invoicing Information
      </Typography>

      <Table size="small">
        <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.04)" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Invoice ID</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Contract ID</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Invoice Date</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
            <TableCell sx={{ fontWeight: "bold" }} align="right">
              Invoice Amount
            </TableCell>
            <TableCell sx={{ fontWeight: "bold" }} align="right">
              Outstanding Amount
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredInvoices.map((inv, idx) => (
            <TableRow key={idx} sx={{ '& td': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
              <TableCell>{inv.InvoiceID}</TableCell>
              <TableCell>{inv.ContractID}</TableCell>
              <TableCell>{formatDate(inv.InvoiceDate)}</TableCell>
              <TableCell>{inv.Description}</TableCell>
              <TableCell align="right">
                {formatCurrency(
                  Number(inv.InvoiceAmount?.toString().replace(/,/g, "")) || 0
                )}
              </TableCell>
              <TableCell align="right">
                {formatCurrency(
                  Number(inv.OutstandingAmount?.toString().replace(/,/g, "")) || 0
                )}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={4} align="right" sx={{ fontWeight: "bold", borderTop: '2px solid rgba(224, 224, 224, 1)' }}>
              Subtotal
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold", borderTop: '2px solid rgba(224, 224, 224, 1)' }}>
              {formatCurrency(subtotalInvoice)}
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold", borderTop: '2px solid rgba(224, 224, 224, 1)' }}>
              {formatCurrency(subtotalOutstanding)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
}

export default InvoicingInformationBlock;
