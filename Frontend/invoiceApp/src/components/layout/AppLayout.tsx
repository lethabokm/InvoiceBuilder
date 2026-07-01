import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { label: 'Invoices', path: '/invoices' },
  { label: 'Customers', path: '/customers' },
  { label: 'Senders', path: '/senders' },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = tabs.findIndex((tab) => location.pathname.startsWith(tab.path));
  const currentTab = activeTab === -1 ? 0 : activeTab;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0} color="primary">
        <Toolbar>
          <ReceiptLongIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
            Invoice Builder
          </Typography>
        </Toolbar>
        <Tabs
          value={currentTab}
          onChange={(_, index) => navigate(tabs[index].path)}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ bgcolor: 'primary.dark', px: 2 }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.path} label={tab.label} sx={{ color: 'common.white' }} />
          ))}
        </Tabs>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
