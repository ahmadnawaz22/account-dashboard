# AI Agent Instructions for Account Dashboard

## Project Overview
This is a React + Vite dashboard application that displays account management information from Google Sheets data. The app follows a component-based architecture with Material-UI (MUI) for styling.

## Key Architecture Points

### Data Flow
1. Data is sourced from Google Sheets via `services/api.js`
   - Uses a specific sheet ID and API key for fetching data
   - Fetches multiple tabs and transforms them into structured objects
2. Main app state is managed in `App.jsx` using React hooks
   - Data fetching occurs on component mount
   - Global filtering state affects all dashboard blocks

### Component Structure
- `App.jsx`: Root component orchestrating data flow and layout
- Dashboard blocks in `src/components/`:
  - `TitleBlock`: Handles filtering controls
  - `KeyInfoBlock`: Displays key metrics
  - `ClientHealthBlock`: Shows client health indicators
  - `RevenueGrowthBlock`: Revenue trends visualization
  - `ContractInformationBlock`: Contract details display

## Development Workflow

### Local Development
```bash
npm run dev  # Starts development server with HMR
```

### Key Dependencies
- Vite: Build tool and dev server
- React: UI framework
- Material-UI: Component library
- Google Sheets API: Data source

## Conventions and Patterns

### Component Pattern
Components follow this structure:
- Accept filtered data as props
- Use MUI components for styling
- Apply consistent spacing with MUI's `sx` prop system

### Data Handling Pattern
```javascript
// Filter pattern used throughout components
const filtered = rows.filter(r => (
  (!filters.ClientName || r.ClientName === filters.ClientName) &&
  (!filters.Status || r.Status === filters.Status)
));
```

### API Integration
All external data fetching is centralized in `services/api.js` with:
- Sheet-specific transformations
- Error handling for missing data (`|| []`)
- Type-aware responses through object mapping

## Integration Points
1. Google Sheets API
   - Sheet ID: Configured in `api.js`
   - Required columns defined by component prop usage
2. Material-UI Theme
   - Custom theme configuration in `theme.js`
   - Consistent color and spacing system