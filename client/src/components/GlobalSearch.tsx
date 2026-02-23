import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Search, Package, Wrench, Users, FileText, Building2, ShoppingCart, Warehouse } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Buscar dados de todos os módulos
  const { data: equipment } = trpc.equipment.list.useQuery(undefined, { enabled: open });
  const { data: items } = trpc.items.list.useQuery(undefined, { enabled: open });
  const { data: suppliers } = trpc.suppliers.list.useQuery(undefined, { enabled: open });
  const { data: budgets } = trpc.budgets.list.useQuery(undefined, { enabled: open });
  const { data: projects } = trpc.projects.list.useQuery(undefined, { enabled: open });
  const { data: users } = trpc.users.list.useQuery(undefined, { enabled: open });
  const { data: requisitions } = trpc.requisitions.list.useQuery(undefined, { enabled: open });

  // Filtrar resultados baseado na query
  const results = query.trim() === "" ? [] : [
    // Equipamentos
    ...(equipment || [])
      .filter(e => 
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        (e.code && e.code.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 5)
      .map(e => ({
        id: e.id,
        type: 'equipment' as const,
        title: e.name,
        subtitle: e.code || 'Sem código',
        path: `/equipment/${e.id}`,
        icon: Wrench,
      })),
    
    // Requisições de Compras
    ...(requisitions || [])
      .filter(r => 
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        type: 'requisition' as const,
        title: r.title,
        subtitle: `Requisição #${r.requisitionNumber || r.id}`,
        path: `/compras/${r.id}`,
        icon: ShoppingCart,
      })),
    
    // Itens de Estoque Interno
    ...(items || [])
      .filter(i => 
        (i.name.toLowerCase().includes(query.toLowerCase()) ||
        (i.secondaryName && i.secondaryName.toLowerCase().includes(query.toLowerCase()))) &&
        (!i.category || i.category !== 'PEÇAS FINALIZADAS')
      )
      .slice(0, 5)
      .map(i => ({
        id: i.id,
        type: 'stock_item' as const,
        title: i.name,
        subtitle: i.secondaryName || i.category || 'Estoque interno',
        path: `/estoque/interno`,
        icon: Warehouse,
      })),
    
    // Peças Finalizadas
    ...(items || [])
      .filter(i => 
        (i.name.toLowerCase().includes(query.toLowerCase()) ||
        (i.secondaryName && i.secondaryName.toLowerCase().includes(query.toLowerCase()))) &&
        i.category === 'PEÇAS FINALIZADAS'
      )
      .slice(0, 5)
      .map(i => ({
        id: i.id,
        type: 'finished_piece' as const,
        title: i.name,
        subtitle: i.secondaryName || 'Peça finalizada',
        path: `/estoque/pecas-finalizadas`,
        icon: Package,
      })),
    
    // Fornecedores
    ...(suppliers || [])
      .filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        (s.cnpj && s.cnpj.includes(query))
      )
      .slice(0, 5)
      .map(s => ({
        id: s.id,
        type: 'supplier' as const,
        title: s.name,
        subtitle: s.cnpj || 'Fornecedor',
        path: `/fornecedores`,
        icon: ShoppingCart,
      })),
    
    // Orçamentos
    ...(budgets || [])
      .filter(b => 
        b.title.toLowerCase().includes(query.toLowerCase()) ||
        (b.clientName && b.clientName.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 5)
      .map(b => ({
        id: b.id,
        type: 'budget' as const,
        title: b.title,
        subtitle: b.clientName || 'Orçamento',
        path: `/orcamentos/${b.id}`,
        icon: FileText,
      })),
    
    // Obras
    ...(projects || [])
      .filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        type: 'project' as const,
        title: p.name,
        subtitle: p.code || 'Obra',
        path: `/obras`,
        icon: Building2,
      })),
    
    // Usuários
    ...(users || [])
      .filter(u => 
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5)
      .map(u => ({
        id: u.id,
        type: 'user' as const,
        title: u.name,
        subtitle: u.email,
        path: `/usuarios`,
        icon: Users,
      })),
  ].slice(0, 20); // Limitar a 20 resultados totais

  // Agrupar resultados por tipo
  const groupedResults = results.reduce((acc, result) => {
    const type = result.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(result);
    return acc;
  }, {} as Record<string, typeof results>);

  // Labels dos tipos
  const typeLabels: Record<string, string> = {
    equipment: 'Equipamentos',
    requisition: 'Requisições de Compras',
    stock_item: 'Estoque Interno',
    finished_piece: 'Peças Finalizadas',
    supplier: 'Fornecedores',
    budget: 'Orçamentos',
    project: 'Obras',
    user: 'Usuários',
  };

  // Navegar para resultado selecionado
  const handleSelect = useCallback((path: string) => {
    setLocation(path);
    onOpenChange(false);
    setQuery("");
    setSelectedIndex(0);
  }, [setLocation, onOpenChange]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex].path);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, results, selectedIndex, handleSelect]);

  // Reset ao abrir/fechar
  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="sr-only">Busca Global</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar requisições, equipamentos, peças, estoque..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="pl-10 text-base h-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {query.trim() === "" ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Digite para buscar em todo o sistema</p>
              <p className="text-xs mt-2">Requisições • Equipamentos • Peças • Estoque • Orçamentos</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Nenhum resultado encontrado</p>
              <p className="text-xs mt-2">Tente buscar por outro termo</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedResults).map(([type, items]) => (
                <div key={type}>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                    {typeLabels[type]}
                  </div>
                  <div className="space-y-1">
                    {items.map((result, index) => {
                      const globalIndex = results.findIndex(r => r.id === result.id && r.type === result.type);
                      const Icon = result.icon;
                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleSelect(result.path)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                            globalIndex === selectedIndex
                              ? 'bg-accent text-accent-foreground'
                              : 'hover:bg-accent/50'
                          }`}
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{result.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {typeLabels[result.type]}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t px-4 py-3 text-xs text-muted-foreground flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-xs font-semibold border rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 text-xs font-semibold border rounded">↓</kbd>
              <span className="ml-1">navegar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-xs font-semibold border rounded">Enter</kbd>
              <span className="ml-1">selecionar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-xs font-semibold border rounded">Esc</kbd>
              <span className="ml-1">fechar</span>
            </span>
          </div>
          <span>{results.length} resultado{results.length !== 1 ? 's' : ''}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
