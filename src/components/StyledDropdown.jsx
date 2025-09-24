import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

function StyledDropdown({ label, options, value, onChange }) {
  return (
    <FormControl sx={{ minWidth: 200 }}>
      <InputLabel sx={{ color: "primary.main" }}>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          backgroundColor: "rgba(255,255,255,0.05)",
          color: "text.primary",
          "& .MuiSelect-icon": { color: "primary.main" },
          "&:hover": { backgroundColor: "rgba(31,122,236,0.1)" },
        }}
      >
        <MenuItem value="">All</MenuItem>
        {options.map((opt, i) => (
          <MenuItem key={i} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default StyledDropdown;
