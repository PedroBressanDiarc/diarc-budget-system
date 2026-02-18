import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";

import { LayoutDashboard, LogOut, PanelLeft, Users, Package, ShoppingCart, FileText, Wrench, BarChart3, Settings as SettingsIcon, UserCog, CheckCircle, Database, ChevronDown, Warehouse, Gauge, FileBarChart, Search, MessageCircle, DollarSign, UserPlus, Shield } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState, useMemo, Fragment } from "react";
import { useLocation, Redirect } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { GlobalSearch } from "./GlobalSearch";
import { usePermissions } from "@/hooks/usePermissions";



const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: "Dashboard", 
    path: "/",
    submenu: [
      { label: "Dashboard Manutenções", path: "/manutencoes/dashboard", adminOnly: true },
    ]
  },
  { 
    icon: ShoppingCart, 
    label: "Compras", 
    path: "/compras",
    submenu: [
      { label: "Manutenção", path: "/compras/manutencao" },
      { label: "Administrativo", path: "/compras/administracao" },
      { label: "Fábrica", path: "/compras/fabrica" },
      { label: "Obras", path: "/compras/obras" },
    ]
  },
  { icon: CheckCircle, label: "Autorizações", path: "/autorizacoes", adminOnly: true },
  { 
    icon: Warehouse, 
    label: "Estoque",
    submenu: [
      { label: "Peças Finalizadas", path: "/estoque/pecas-finalizadas" },
      { label: "Estoque Interno", path: "/estoque/interno" },
    ]
  },
  { icon: FileText, label: "Orçamentos", path: "/orcamentos" },

  { icon: Wrench, label: "Manutenções", path: "/manutencoes" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { 
    icon: DollarSign, 
    label: "Financeiro", 
    path: "/financeiro",
    submenu: [
      { label: "Recebimentos", path: "/financeiro/recebimentos" },
      { label: "Pagamentos", path: "/financeiro/pagamentos" },
    ]
  },
  { 
    icon: BarChart3, 
    label: "Relatórios", 
    path: "/relatorios",
    submenu: [
      { label: "Visão Geral", path: "/relatorios" },
      { label: "Dashboard de Economias", path: "/relatorios/economias" },
      { label: "Relatório por Obras", path: "/relatorios/obras" },
      { label: "Alertas de Orçamento", path: "/alertas-orcamento" },
      { label: "Relatórios Manutenções", path: "/manutencoes/relatorios", adminOnly: true },
    ]
  },
  { icon: SettingsIcon, label: "Configura\u00e7\u00f5es", path: "/configuracoes" },
  {
    icon: UserCog,
    label: "Gest\u00e3o",
    submenu: [
      { label: "Usu\u00e1rios", path: "/usuarios" },
      { label: "Permiss\u00f5es", path: "/permissoes" },
    ]
  },
];

const databaseMenuItems = [
  { icon: Users, label: "Fornecedores", path: "/fornecedores" },
  { icon: Package, label: "Equipamentos", path: "/equipment" },
  { icon: Package, label: "Itens", path: "/itens" },
  { icon: Package, label: "Obras", path: "/obras" },
  { icon: Database, label: "Locais", path: "/locais" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    // Redirecionar para login se não autenticado
    return <Redirect to="/login" />;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

// Componente para mostrar badge de autorizações pendentes
function PendingAuthBadge() {
  const { data: count } = trpc.requisitions.countPendingAuth.useQuery();
  
  // Garantir que count é um número e maior que zero
  const pendingCount = Number(count) || 0;
  
  if (pendingCount === 0) return null;
  
  return (
    <span className="ml-auto bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
      {pendingCount}
    </span>
  );
}

// Componente para mostrar badge de menções não lidas no Chat
function UnreadMentionsBadge() {
  const { data: mentions } = trpc.chats.getUnreadMentions.useQuery(undefined, {
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
  
  const unreadCount = mentions?.length || 0;
  
  if (unreadCount === 0) return null;
  
  return (
    <span className="ml-auto bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
      {unreadCount}
    </span>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  
  // Hook de permissões
  const { canView, isLoading: permissionsLoading } = usePermissions();
  
  // Mapeamento de paths para chaves de módulo/submódulo
  const getModuleKeys = (path: string): { module: string; submodule?: string } | null => {
    if (path === "/") return { module: "dashboard" };
    if (path === "/chat") return { module: "chat" };
    if (path.startsWith("/compras/manutencao")) return { module: "compras", submodule: "manutencao" };
    if (path.startsWith("/compras/administracao")) return { module: "compras", submodule: "administrativo" };
    if (path.startsWith("/compras/fabrica")) return { module: "compras", submodule: "fabrica" };
    if (path.startsWith("/compras/obras")) return { module: "compras", submodule: "obras" };
    if (path.startsWith("/compras")) return { module: "compras" };
    if (path === "/autorizacoes") return { module: "autorizacoes" };
    if (path === "/estoque/pecas-finalizadas") return { module: "estoque", submodule: "pecas_finalizadas" };
    if (path === "/estoque/interno") return { module: "estoque", submodule: "estoque_interno" };
    if (path.startsWith("/estoque")) return { module: "estoque" };
    if (path === "/orcamentos") return { module: "orcamentos" };
    if (path === "/manutencoes") return { module: "manutencoes" };
    if (path.startsWith("/financeiro/recebimentos")) return { module: "financeiro", submodule: "recebimentos" };
    if (path.startsWith("/financeiro/pagamentos")) return { module: "financeiro", submodule: "pagamentos" };
    if (path.startsWith("/financeiro")) return { module: "financeiro" };
    if (path.startsWith("/relatorios/economias")) return { module: "relatorios", submodule: "economias" };
    if (path.startsWith("/relatorios/obras")) return { module: "relatorios", submodule: "obras" };
    if (path === "/alertas-orcamento") return { module: "relatorios", submodule: "alertas_orcamento" };
    if (path.startsWith("/relatorios")) return { module: "relatorios" };
    if (path === "/configuracoes") return { module: "configuracoes" };
    if (path === "/usuarios") return { module: "gestao", submodule: "usuarios" };
    if (path === "/permissoes") return { module: "gestao", submodule: "permissoes" };
    if (path.startsWith("/gestao")) return { module: "gestao" };
    return null;
  };
  
  // Filtrar itens do menu baseado em permissões
  const filteredMenuItems = useMemo(() => {
    // Aguardar user carregarem completamente
    if (!user || typeof user !== 'object' || !user.role || permissionsLoading) {
      return []; // Ocultar tudo enquanto carrega
    }
    
    return menuItems.map(item => {
      // Verificar adminOnly (apenas diretor)
      if (item.adminOnly && user.role !== 'diretor') {
        return null;
      }
      
      // Se tem submenu, filtrar subitens
      if (item.submenu) {
        const filteredSubmenu = item.submenu.filter(subitem => {
          if (subitem.adminOnly && user.role !== 'diretor') {
            return false;
          }
          
          const subKeys = getModuleKeys(subitem.path);
          if (subKeys && !canView(subKeys.module, subKeys.submodule)) {
            return false;
          }
          
          return true;
        });
        
        // Se não tem subitens visíveis, verificar se item pai tem permissão própria
        if (filteredSubmenu.length === 0) {
          // Se item pai tem path, verificar permissão
          if (item.path) {
            const moduleKeys = getModuleKeys(item.path);
            if (moduleKeys && !canView(moduleKeys.module, moduleKeys.submodule)) {
              return null;
            }
            // Tem permissão, mostrar sem submenu
            return { ...item, submenu: undefined };
          }
          // Não tem path nem subitens, ocultar
          return null;
        }
        
        // Retornar item com submenu filtrado (sem mutação)
        return { ...item, submenu: filteredSubmenu };
      } else {
        // Se não tem submenu, verificar permissão do item principal
        const moduleKeys = getModuleKeys(item.path || "");
        if (moduleKeys && !canView(moduleKeys.module, moduleKeys.submodule)) {
          return null;
        }
      }
      
      return item;
    }).filter(item => item !== null);
  }, [user, canView, permissionsLoading]);
  
  // Filtrar itens da base de dados (todos visíveis por padrão)
  const filteredDatabaseItems = useMemo(() => {
    return databaseMenuItems;
  }, []);
  const isMobile = useIsMobile();

  // Atalho de teclado para busca global (Ctrl+K ou Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold tracking-tight truncate">
                    Navigation
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {filteredMenuItems.map((item) => {
                const isActive = location === item.path;
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const menuKey = item.path || item.label;
                const isSubmenuOpen = openSubmenus[menuKey] || false;
                
                return (
                  <Fragment key={item.path || item.label}>
                    <SidebarMenuItem>
                      <div className="flex items-center w-full">
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => item.path && setLocation(item.path)}
                          tooltip={item.label}
                          className={`h-10 transition-all font-normal relative flex-1 ${!item.path ? 'cursor-default' : ''}`}
                        >
                          <item.icon
                            className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                          />
                          <span>{item.label}</span>
                          {item.path === '/autorizacoes' && <PendingAuthBadge />}
                          {item.path === '/chat' && <UnreadMentionsBadge />}
                        </SidebarMenuButton>
                        {hasSubmenu && user && (user.role === 'diretor' || !item.adminOnly) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const menuKey = item.path || item.label;
                              setOpenSubmenus(prev => ({ ...prev, [menuKey]: !prev[menuKey] }));
                            }}
                            className="h-10 w-8 flex items-center justify-center hover:bg-accent rounded-r-lg transition-colors shrink-0"
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${isSubmenuOpen ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>
                    </SidebarMenuItem>
                    {hasSubmenu && isSubmenuOpen && item.submenu!.map(subitem => {
                      const isSubActive = location === subitem.path;
                      return (
                        <SidebarMenuItem key={subitem.path}>
                          <SidebarMenuButton
                            isActive={isSubActive}
                            onClick={() => setLocation(subitem.path)}
                            tooltip={subitem.label}
                            className="h-10 transition-all font-normal pl-8"
                          >
                            <span>{subitem.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </Fragment>
                );
              })}
              {user && (user.role === 'diretor' || user.role === 'manutencao') && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setIsDatabaseOpen(!isDatabaseOpen)}
                      tooltip="Base de Dados"
                      className="h-10 transition-all font-normal"
                    >
                      <Database className="h-4 w-4" />
                      <span>Base de Dados</span>
                      <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${isDatabaseOpen ? 'rotate-180' : ''}`} />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {isDatabaseOpen && filteredDatabaseItems.map(item => {
                    const isActive = location === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => setLocation(item.path)}
                          tooltip={item.label}
                          className="h-10 transition-all font-normal pl-8"
                        >
                          <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </>
              )}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <div className="px-2 py-1 mb-2">
              <p className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                Versão 2.0.0
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="h-9 w-9"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        )}
        {!isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{activeMenuItem?.label ?? "Dashboard"}</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setSearchOpen(true)}
              className="w-64 justify-start text-sm text-muted-foreground"
            >
              <Search className="mr-2 h-4 w-4" />
              Buscar...
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>
        )}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
