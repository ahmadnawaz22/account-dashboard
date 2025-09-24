import { useEffect, useState } from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import { fetchAllSheets } from "./services/api";


// Your existing blocks
import TitleBlock from "./components/TitleBlock";
import KeyInfoBlock from "./components/KeyInfoBlock";
import ClientHealthBlock from "./components/ClientHealthBlock";
import RevenueGrowthBlock from "./components/RevenueGrowthBlock";
import ContractInformationBlock from "./components/ContractInformationBlock";
import InvoiceInformationBlock from "./components/InvoiceInformationBlock";
import ConsumptionBlock from "./components/ConsumptionBlock";
import UtilizationAnalysisBlock from "./components/UtilizationAnalysisBlock";


function App() {
  const [data, setData] = useState({});
  const [filters, setFilters] = useState({ Status: "Active" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const results = await fetchAllSheets(); // pulls all tabs into { tabName: rows }
      setData(results);
      setLoading(false);
    }
    load();
  }, []);

    if (loading) {
      return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h6" align="center" sx={{ color: "primary.main" }}>
            Loading data, Please Wait.....
          </Typography>
        </Container>
      );
    }


  // Base filter on ContractComponents
  const filteredComponents = (data.ContractComponents || []).filter((r) => {
    return (
      (!filters.ClientName || r.ClientName === filters.ClientName) &&
      (!filters.AccountManager || r.AccountManager === filters.AccountManager) &&
      (!filters.Status || r.Status === filters.Status)
    );
  });

  const filteredInvoices = (data.Invoices || []).filter((invoice) =>
    filteredComponents.some(
      (component) => component.ContractComponentID === invoice.ContractComponentID
    )
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: "primary.main" }}>
        Account Management Dashboard
      </Typography>

      {/* 🔹 Filters */}
      <TitleBlock
        rows={data.ContractComponents || []}
        filters={filters}
        setFilters={setFilters}
      />

      {/* 🔹 Blocks */}
      <KeyInfoBlock
        rows={filteredComponents}
        clients={data.Clients || []}
      />
      <ClientHealthBlock
        rows={filteredComponents}
        clients={data.Clients || []}
        receipts={data.Receipts || []}
      />
      <RevenueGrowthBlock
        rows={filteredComponents}
        revenueSummary={data.RevenueSummary || []}
      />
            {/* 🔹 Consumption Information */}
      <ConsumptionBlock
      clientName={filters.ClientName}
      consumption={data.Consumption || []}
      contractComponents={data.ContractComponents || []}
      />
      <UtilizationAnalysisBlock
      clientName={filters.ClientName}
      contractComponents={data.ContractComponents || []}
      consumption={data.Consumption || []}
     />

      <ContractInformationBlock rows={filteredComponents} />

      {/* 🔹 Invoice Information */}
      <InvoiceInformationBlock
      contractComponents={data.ContractComponents || []}
      invoices={data.Invoices || []}
      clientName={filters.ClientName}
      />

    </Container>
  );
}

export default App;
