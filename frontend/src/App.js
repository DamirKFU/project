import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import api from './services/api';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ruRU } from '@mui/material/locale';
import { ru } from 'date-fns/locale';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import Reports from './components/Reports';

const theme = createTheme(
  {
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
    },
  },
  ruRU
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
        <CssBaseline />
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Брюшлинское сельское поселение
              </Typography>
              <Button
                color="inherit"
                component="a"
                href={`${api.defaults.baseURL}/admin/login/`}
              >
                Логин
              </Button>
              <Button
                color="inherit"
                component="a"
                href={`${api.defaults.baseURL}/admin/`}
              >
                Админка
              </Button>
            </Toolbar>
          </AppBar>
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Routes>
              <Route path="/" element={<Reports />} />
            </Routes>
          </Container>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
