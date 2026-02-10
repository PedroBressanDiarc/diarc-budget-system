import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Suppliers from "./pages/Suppliers";
import Requisitions from "./pages/Requisitions";
import RequisitionDetail from "./pages/RequisitionDetail";
import Budgets from "./pages/Budgets";
import BudgetDetail from "./pages/BudgetDetail";
import Equipment from "./pages/Equipment";
import EquipmentDetail from "./pages/EquipmentDetail";
import Maintenance from "./pages/Maintenance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Users from "./pages/Users";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/fornecedores" component={Suppliers} />
      <Route path="/compras" component={Requisitions} />
      <Route path="/compras/:id" component={RequisitionDetail} />
      <Route path="/orcamentos" component={Budgets} />
      <Route path="/orcamentos/:id" component={BudgetDetail} />
      <Route path="/equipamentos" component={Equipment} />
      <Route path="/equipamentos/:id" component={EquipmentDetail} />
      <Route path="/manutencoes" component={Maintenance} />
      <Route path="/relatorios" component={Reports} />
      <Route path="/configuracoes" component={Settings} />
      <Route path="/usuarios" component={Users} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function PublicRouter() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route component={Login} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  // Check if user is on login page
  const isLoginPage = location === "/login";

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          {isLoginPage ? (
            <PublicRouter />
          ) : (
            <DashboardLayout>
              <Router />
            </DashboardLayout>
          )}
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
