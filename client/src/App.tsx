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
import PurchasesMaintenance from "./pages/PurchasesMaintenance";
import PurchasesAdministration from "./pages/PurchasesAdministration";
import PurchasesFactory from "./pages/PurchasesFactory";
import Authorizations from "./pages/Authorizations";
import Items from "./pages/Items";
import FinishedPieces from "./pages/FinishedPieces";
import InternalStock from "./pages/InternalStock";
import Projects from "./pages/Projects";
import Budgets from "./pages/Budgets";
import BudgetDetail from "./pages/BudgetDetail";
import Equipment from "./pages/Equipment";
import EquipmentDetail from "./pages/EquipmentDetail";
import Maintenance from "./pages/Maintenance";
import MaintenanceFlow from "./pages/MaintenanceFlow";
import MaintenanceDashboard from "./pages/MaintenanceDashboard";
import MaintenanceReports from "./pages/MaintenanceReports";
import Reports from "./pages/Reports";
import SavingsDashboard from "./pages/SavingsDashboard";
import ProjectReport from "./pages/ProjectReport";
import BudgetAlerts from "./pages/BudgetAlerts";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Users from "./pages/Users";
import PaymentsReceived from "./pages/PaymentsReceived";
import PaymentsMade from "./pages/PaymentsMade";
import Chat from "./pages/Chat";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/fornecedores" component={Suppliers} />
      <Route path="/compras" component={Requisitions} />
      <Route path="/compras/manutencao" component={PurchasesMaintenance} />
      <Route path="/compras/administracao" component={PurchasesAdministration} />
      <Route path="/compras/fabrica" component={PurchasesFactory} />
      <Route path="/compras/:id" component={RequisitionDetail} />
      <Route path="/autorizacoes" component={Authorizations} />
      <Route path="/estoque/pecas-finalizadas" component={FinishedPieces} />
      <Route path="/estoque/interno" component={InternalStock} />
      <Route path="/estoque" component={Items} />
      <Route path="/itens" component={Items} />
      <Route path="/obras" component={Projects} />
      <Route path="/orcamentos" component={Budgets} />
      <Route path="/orcamentos/:id" component={BudgetDetail} />
      <Route path="/equipment" component={Equipment} />
      <Route path="/equipment/:id" component={EquipmentDetail} />
      <Route path="/manutencoes/dashboard" component={MaintenanceDashboard} />
      <Route path="/manutencoes/relatorios" component={MaintenanceReports} />
      <Route path="/manutencoes" component={MaintenanceFlow} />
      <Route path="/relatorios" component={Reports} />
      <Route path="/relatorios/economias" component={SavingsDashboard} />
      <Route path="/relatorios/obras" component={ProjectReport} />
      <Route path="/alertas-orcamento" component={BudgetAlerts} />
      <Route path="/financeiro/recebimentos" component={PaymentsReceived} />
      <Route path="/financeiro/pagamentos" component={PaymentsMade} />
      <Route path="/configuracoes" component={Settings} />
      <Route path="/usuarios" component={Users} />
      <Route path="/chat" component={Chat} />
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
