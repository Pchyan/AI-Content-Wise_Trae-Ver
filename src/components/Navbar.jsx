import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  return (
    <AppBar position="static" color="primary" sx={{ mb: 4 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          文萃智析
        </Typography>
        <Box>
          <Button
            color="inherit"
            component={Link}
            to="/"
            sx={{ fontWeight: location.pathname === "/" ? 700 : 400 }}
          >
            主功能
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/setting"
            sx={{ fontWeight: location.pathname === "/setting" ? 700 : 400 }}
          >
            設定
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}