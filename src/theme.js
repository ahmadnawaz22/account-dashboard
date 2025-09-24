import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3f51b5", // Modern blue
      light: "#6573c3",
      dark: "#2c387e",
    },
    secondary: {
      main: "#9c27b0", // Purple
      light: "#ba68c8",
      dark: "#6a0080",
    },
    background: {
      default: "#f5f7fb", // Dashboard background
      paper: "#ffffff",   // Card background
    },
    text: {
      primary: "#1a1a1a",   // Dark gray
      secondary: "#555",    // Medium gray
    },
    divider: "#e0e0e0",
    success: {
      main: "#4caf50", // Green for Active
    },
    warning: {
      main: "#ff9800", // Orange for warnings
    },
    error: {
      main: "#f44336", // Red for errors
    },
  },
  shape: {
    borderRadius: 12, // Smooth rounded corners
  },
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.5px",
    },
    h6: {
      fontWeight: 600,
      letterSpacing: "-0.3px",
    },
    body2: {
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)", // Softer shadow
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
          transition: "all 0.2s ease",
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #3f51b5, #9c27b0)", // Blue → Purple
          color: "#fff",
          "&:hover": {
            background: "linear-gradient(135deg, #3949ab, #8e24aa)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
        colorSuccess: {
          backgroundColor: "rgba(76, 175, 80, 0.15)",
          color: "#2e7d32",
        },
        colorWarning: {
          backgroundColor: "rgba(255, 152, 0, 0.15)",
          color: "#ef6c00",
        },
        colorError: {
          backgroundColor: "rgba(244, 67, 54, 0.15)",
          color: "#c62828",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #3f51b5, #9c27b0)", // Gradient header
          color: "#fff",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: "#f9f9fc",
          "&:hover": {
            backgroundColor: "#f0f0f5",
          },
        },
        icon: {
          color: "#3f51b5",
        },
      },
    },
  },
});

export default theme;
  