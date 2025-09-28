import { useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Box,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

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

export default function InvoicingInformationBlock({
  contractComponents,
  invoices,
  clientName,
}) {
  const [showAll, setShowAll] = useState(false);

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

  // Active contracts for this client
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

  // Invoices for active contracts
  const filteredInvoices = (invoices || []).filter((inv) =>
    activeIds.includes(inv.ContractComponentID)
  );

  // Subtotals for active contracts
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

  // All invoices for this client (no contract/date filter) excluding blanks
  const allInvoices = (invoices || []).filter(
    (inv) =>
      inv.ClientName === clientName &&
      typeof inv.InvoiceID === "string" &&
      inv.InvoiceID.trim().length > 0
  );

  // Totals for all invoices
  const totalInvoiceAll = allInvoices.reduce(
    (sum, inv) =>
      sum + (Number(inv.InvoiceAmount?.toString().replace(/,/g, "")) || 0),
    0
  );
  const totalOutstandingAll = allInvoices.reduce(
    (sum, inv) =>
      sum + (Number(inv.OutstandingAmount?.toString().replace(/,/g, "")) || 0),
    0
  );

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
        Invoicing Information
      </Typography>

      {filteredInvoices.length > 0 ? (
        <>
          {/* Active Invoices Table */}
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
                <TableRow key={idx}>
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
                <TableCell colSpan={4} align="right" sx={{ fontWeight: "bold" }}>
                  Subtotal
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {formatCurrency(subtotalInvoice)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {formatCurrency(subtotalOutstanding)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Collapsible All Invoices */}
          <Box sx={{ mt: 2 }}>
            <Box
              display="flex"
              alignItems="center"
              sx={{ cursor: "pointer" }}
              onClick={() => setShowAll(!showAll)}
            >
              <IconButton size="small">
                {showAll ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
              <Typography variant="subtitle1">Show All Invoices</Typography>
            </Box>

            <Collapse in={showAll} timeout="auto" unmountOnExit>
              <Table size="small" sx={{ mt: 1 }}>
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
                  {allInvoices.map((inv, idx) => (
                    <TableRow key={idx}>
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
                    <TableCell colSpan={4} align="right" sx={{ fontWeight: "bold" }}>
                      Total (All Invoices)
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {formatCurrency(totalInvoiceAll)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {formatCurrency(totalOutstandingAll)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Collapse>
          </Box>
        </>
      ) : (
        <Typography>No invoices found for this client</Typography>
      )}
    </Paper>
  );
}
