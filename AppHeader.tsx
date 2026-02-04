"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth, usePermissions } from "@/context/AuthContext";
import ClienteHeaderTabs, { ClienteViewType } from "@/app/(admin)/clientes/components/ClienteHeaderTabs";
import { useDashboardFilters } from "@/stores/dashboardStore";
import { useModal } from "@/hooks/useModal";
import CalendarioModal from "@/components/shared/CalendarioModal";
import TransacoesModal from "@/components/shared/TransacoesModal";
import ContatoModal from "@/components/shared/ContatoModal";
import LeadsModal, { NovoLead } from "@/components/shared/LeadsModal";
import { MonthSelector } from "@/components/dashboard/MonthSelector";
import { useOptionalMonthSelector } from "@/context/MonthSelectorContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import React, { useState, createContext, useContext, useEffect, useRef, useCallback, useMemo } from "react";
import { LayoutGrid, List, Map } from "lucide-react";
import { NovaCampanhaButton } from "@/app/(admin)/campanhas/NovaCampanhaButton";
import HeaderTabs from "@/components/shared/HeaderTabs";
import FilialSelector, { type FilialSigla, getFilialInfo } from "@/components/FilialSelector";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { oportunidadesService } from "@/services/oportunidades.service";
import { apiClient } from "@/services/api.client";
import { Filters } from "@/components/shared/Filters";

// ========================================
// 🎯 CONTEXTO PARA TABS DE CLIENTES
// ========================================

interface ClienteTabsContextType {
  activeTab: ClienteViewType;
  setActiveTab: (tab: ClienteViewType) => void;
}

const ClienteTabsContext = createContext<ClienteTabsContextType | null>(null);

export const useClienteTabs = () => {
  const context = useContext(ClienteTabsContext);
  if (!context) {
    throw new Error('useClienteTabs deve ser usado dentro de ClienteTabsProvider');
  }
  return context;
};

export const ClienteTabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ClienteViewType>('mapa');

  return (
    <ClienteTabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ClienteTabsContext.Provider>
  );
};

// ========================================
// 🏢 CONTEXTO PARA FILIAL SELECIONADA
// ========================================

interface FilialContextType {
  filialSelecionada: FilialSigla;
  setFilialSelecionada: (filial: FilialSigla) => void;
  isLoadingFilial: boolean;
  setIsLoadingFilial: (loading: boolean) => void;
}

const FilialContext = createContext<FilialContextType | undefined>(undefined);

export const useFilial = () => {
  const context = useContext(FilialContext);
  if (!context) {
    throw new Error('useFilial deve ser usado dentro de FilialProvider');
  }
  return context;
};

export const FilialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filialSelecionada, setFilialSelecionada] = useState<FilialSigla>('TODAS');
  const [isLoadingFilial, setIsLoadingFilial] = useState(false);

  return (
    <FilialContext.Provider value={{
      filialSelecionada,
      setFilialSelecionada,
      isLoadingFilial,
      setIsLoadingFilial
    }}>
      {children}
    </FilialContext.Provider>
  );
};

// ========================================
// 📞 CONTEXTO PARA TABS DE CONTATOS
// ========================================

type ContatoViewType = 'relatorio' | 'calendario' | 'visao-geral' | 'historico';

interface ContatoTabsContextType {
  activeTab: ContatoViewType;
  setActiveTab: (tab: ContatoViewType) => void;
}

const ContatoTabsContext = createContext<ContatoTabsContextType | null>(null);

export const useContatoTabs = () => {
  const context = useContext(ContatoTabsContext);
  if (!context) {
    throw new Error('useContatoTabs deve ser usado dentro de ContatoTabsProvider');
  }
  return context;
};

export const ContatoTabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ContatoViewType>('relatorio');

  return (
    <ContatoTabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ContatoTabsContext.Provider>
  );
};

// ========================================
// 📢 CONTEXTO PARA TABS DE CAMPANHAS
// ========================================

type CampanhaViewType = 'campanhas' | 'historico' | 'graficos';
type CampanhaViewMode = 'list' | 'cards';

interface CampanhaTabsContextType {
  activeTab: CampanhaViewType;
  setActiveTab: (tab: CampanhaViewType) => void;
  viewMode: CampanhaViewMode;
  setViewMode: (mode: CampanhaViewMode) => void;
}

const CampanhaTabsContext = createContext<CampanhaTabsContextType | null>(null);

export const useCampanhaTabs = () => {
  const context = useContext(CampanhaTabsContext);
  if (!context) {
    throw new Error('useCampanhaTabs deve ser usado dentro de CampanhaTabsProvider');
  }
  return context;
};

export const CampanhaTabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<CampanhaViewType>('campanhas');
  const [viewMode, setViewMode] = useState<CampanhaViewMode>('cards');

  return (
    <CampanhaTabsContext.Provider value={{ activeTab, setActiveTab, viewMode, setViewMode }}>
      {children}
    </CampanhaTabsContext.Provider>
  );
};

// ========================================
// 🧠 CONTEXTO PARA TABS DE INTELIGÊNCIA
// ========================================

type InteligenciaViewType = 'registros' | 'acompanhamentos' | 'historico';

interface InteligenciaTabsContextType {
  activeTab: InteligenciaViewType;
  setActiveTab: (tab: InteligenciaViewType) => void;
}

const InteligenciaTabsContext = createContext<InteligenciaTabsContextType | null>(null);

export const useInteligenciaTabs = () => {
  const context = useContext(InteligenciaTabsContext);
  if (!context) {
    throw new Error('useInteligenciaTabs deve ser usado dentro de InteligenciaTabsProvider');
  }
  return context;
};

export const InteligenciaTabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<InteligenciaViewType>('registros');

  return (
    <InteligenciaTabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </InteligenciaTabsContext.Provider>
  );
};

// ========================================
// 🧩 SLOTS PARA CONTEÚDO POR PÁGINA (HEADER)
// ========================================

type AppHeaderSlots = {
  left: React.ReactNode | null;
  right: React.ReactNode | null;
};

interface AppHeaderSlotsContextType extends AppHeaderSlots {
  setLeft: (node: React.ReactNode | null) => void;
  setRight: (node: React.ReactNode | null) => void;
  clear: () => void;
}

const AppHeaderSlotsContext = createContext<AppHeaderSlotsContextType | null>(null);

export const useAppHeaderSlots = () => {
  const context = useContext(AppHeaderSlotsContext);
  if (!context) {
    throw new Error('useAppHeaderSlots deve ser usado dentro de AppHeaderSlotsProvider');
  }
  return context;
};

export const AppHeaderSlotsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [left, setLeft] = useState<React.ReactNode | null>(null);
  const [right, setRight] = useState<React.ReactNode | null>(null);

  const clear = useCallback(() => {
    setLeft(null);
    setRight(null);
  }, []);

  const value = useMemo<AppHeaderSlotsContextType>(() => {
    return { left, right, setLeft, setRight, clear };
  }, [left, right, clear]);

  return <AppHeaderSlotsContext.Provider value={value}>{children}</AppHeaderSlotsContext.Provider>;
};

// ========================================
// 🎯 COMPONENTE PRINCIPAL DO HEADER
// ========================================

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [headerState, setHeaderState] = useState<'normal' | 'collapsed' | 'revealing'>('normal');
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const headerRef = React.useRef<HTMLElement>(null);

  // Hooks para navegação e contexto
  const pathname = usePathname();
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const { isSuperuser } = usePermissions();
  const { filters, updateFilters } = useDashboardFilters();

  let headerSlotsState: AppHeaderSlotsContextType | null = null;
  try {
    headerSlotsState = useAppHeaderSlots();
  } catch {
    // Se não estiver dentro do provider, não renderizar slots
  }

  const headerLeftSlot = headerSlotsState?.left ?? null;
  const headerRightSlot = headerSlotsState?.right ?? null;

  // Estado das tabs de clientes (usando contexto se disponível)
  let clienteTabsState: ClienteTabsContextType | null = null;
  try {
    clienteTabsState = useClienteTabs();
  } catch {
    // Se não estiver dentro do provider, usar estado local
  }

  const [localActiveTab, setLocalActiveTab] = useState<ClienteViewType>('mapa');
  const activeTab = clienteTabsState?.activeTab || localActiveTab;
  const setActiveTab = clienteTabsState?.setActiveTab || setLocalActiveTab;

  // Estado das tabs de contatos (usando contexto se disponível)
  let contatoTabsState: ContatoTabsContextType | null = null;
  try {
    contatoTabsState = useContatoTabs();
  } catch {
    // Se não estiver dentro do provider, usar estado local
  }

  const [localContatoActiveTab, setLocalContatoActiveTab] = useState<ContatoViewType>('relatorio');
  const contatoActiveTab = contatoTabsState?.activeTab || localContatoActiveTab;
  const setContatoActiveTab = contatoTabsState?.setActiveTab || setLocalContatoActiveTab;

  // Hook para seletor de mês (opcional - só funciona na página de vendas)
  const monthSelector = useOptionalMonthSelector();

  // Estado da filial (usando contexto se disponível)
  let filialState: FilialContextType | null = null;
  try {
    filialState = useFilial();
  } catch {
    // Se não estiver dentro do provider, usar estado local
  }

  const [localFilialSelecionada, setLocalFilialSelecionada] = useState<FilialSigla>('TODAS');
  const [localIsLoadingFilial, setLocalIsLoadingFilial] = useState(false);
  const filialSelecionada = filialState?.filialSelecionada || localFilialSelecionada;
  const setFilialSelecionada = filialState?.setFilialSelecionada || setLocalFilialSelecionada;
  const isLoadingFilial = filialState?.isLoadingFilial || localIsLoadingFilial;
  const setIsLoadingFilial = filialState?.setIsLoadingFilial || setLocalIsLoadingFilial;

  // Estado das tabs de campanhas (usando contexto se disponível)
  let campanhaTabsState: CampanhaTabsContextType | null = null;
  try {
    campanhaTabsState = useCampanhaTabs();
  } catch {
    // Se não estiver dentro do provider, usar estado local
  }

  const [localCampanhaActiveTab, setLocalCampanhaActiveTab] = useState<CampanhaViewType>('campanhas');
  const campanhaActiveTab = campanhaTabsState?.activeTab || localCampanhaActiveTab;
  const setCampanhaActiveTab = campanhaTabsState?.setActiveTab || setLocalCampanhaActiveTab;
  const [localCampanhaViewMode, setLocalCampanhaViewMode] = useState<CampanhaViewMode>('cards');
  const campanhaViewMode = campanhaTabsState?.viewMode || localCampanhaViewMode;
  const setCampanhaViewMode = campanhaTabsState?.setViewMode || setLocalCampanhaViewMode;

  const campanhaToggleRefs = useRef<Record<'cards' | 'list', HTMLButtonElement | null>>({ cards: null, list: null });
  const [campanhaToggleIndicator, setCampanhaToggleIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });
  useEffect(() => {
    const el = campanhaToggleRefs.current[campanhaViewMode];
    if (el) {
      setCampanhaToggleIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [campanhaViewMode]);
  useEffect(() => {
    const handler = () => {
      const el = campanhaToggleRefs.current[campanhaViewMode];
      if (el) {
        setCampanhaToggleIndicator({ left: el.offsetLeft, width: el.offsetWidth });
      }
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [campanhaViewMode]);
  // Estado das tabs de inteligência (usando contexto se disponível)
  let inteligenciaTabsState: InteligenciaTabsContextType | null = null;
  try {
    inteligenciaTabsState = useInteligenciaTabs();
  } catch {
    // Se não estiver dentro do provider, usar estado local
  }

  const [localInteligenciaActiveTab, setLocalInteligenciaActiveTab] = useState<InteligenciaViewType>('registros');
  const inteligenciaActiveTab = inteligenciaTabsState?.activeTab || localInteligenciaActiveTab;
  const setInteligenciaActiveTab = inteligenciaTabsState?.setActiveTab || setLocalInteligenciaActiveTab;

  // Estado para controle de responsividade
  const [isMobile, setIsMobile] = useState(false);



  // ========================================
  // 🎯 REGRAS CONDICIONAIS
  // ========================================

  const isClientesPage = pathname === '/clientes';
  const isVendasPage = pathname === '/vendas';

  const isContatosPage = pathname === '/contatos';
  const isCampanhasPage = pathname === '/campanhas';
  const isInteligenciaPage = pathname === '/mercado/inteligencia';

  useEffect(() => {
    if (isInteligenciaPage) {
      const startDefault = inteligenciaActiveTab === 'historico' ? '2018-12-01' : '2024-01-01';
      const endDefault = new Date().toISOString().slice(0, 10);
      (window as any).__iapvFiltersDefaultStartISO = startDefault;
      (window as any).__iapvFiltersDefaultEndISO = endDefault;
    }
  }, [isInteligenciaPage, inteligenciaActiveTab]);
  // Modais para página de vendas
  const calendarioModal = useModal();
  const transacoesModal = useModal();

  // Modal para adicionar contato (global)
  const contatoModal = useModal();

  // Modal para adicionar lead (Inteligência)
  const leadsModal = useModal();

  const handleNovoContato = async (contato: any) => {
    console.log('📞 Novo contato criado no AppHeader:', contato);

    // Disparar evento customizado para forçar refresh independente da página
    console.log('📡 AppHeader disparando evento contatos:refresh...');
    window.dispatchEvent(new CustomEvent('contatos:refresh', {
      detail: { contato, source: 'AppHeader' }
    }));

    // Também disparar contatoCreated para garantir compatibilidade
    console.log('📡 AppHeader disparando evento contatoCreated...');
    window.dispatchEvent(new CustomEvent('contatoCreated', {
      detail: { contato, source: 'AppHeader' }
    }));

    // Log adicional se estivermos na página de contatos
    if (isContatosPage) {
      console.log('✅ Eventos disparados na página de contatos');
    } else {
      console.log('ℹ️ Eventos disparados fora da página de contatos');
    }
  };

  const handleNovoLead = async (lead: NovoLead) => {
    console.log('🚀 AppHeader: Criando novo lead:', lead);
    const dataStr = lead.data;
    const computedAno = Number(dataStr?.slice(0, 4)) || new Date().getFullYear();
    const computedMes = Number(dataStr?.slice(5, 7)) || (new Date().getMonth() + 1);
    const payload = {
      ano: lead.ano ?? computedAno,
      mes: lead.mes ?? computedMes,
      data: lead.data,
      origem: lead.origem,
      origem2: (lead.origem2 && lead.origem2.trim()) ? lead.origem2.trim() : null,
      leads: lead.leads,
      cliente: lead.cliente,
      tipo: lead.tipo,
      responsavel: lead.responsavel,
      contato: lead.contato,
      email: lead.email,
      cidade: lead.cidade,
      interesse_principal: lead.interessePrincipal,
      interesse_equipamento: lead.interesseEquipamento,
      modelo: (lead.modeloInput && lead.modeloInput.trim()) ? lead.modeloInput.trim() : undefined,
      uf: (lead.uf && lead.uf.trim()) ? lead.uf.trim() : undefined,
      filial: (lead.filial && lead.filial.trim()) ? lead.filial.trim() : undefined,
      vendedor: (lead.vendedor && lead.vendedor.trim()) ? lead.vendedor.trim() : undefined,
      fonte_de_dados: undefined,
      previsao_de_venda: undefined,
      cadastro: undefined,
      data_de_resposta: undefined,
      data_de_resposta2: undefined,
      data_atualizacao: undefined,
      data_cobranca: undefined,
      status_180dias: undefined,
      status_15dias: undefined,
      finalizado: 'Em aberto',
      observacao: lead.observacao
    };
    const response = await oportunidadesService.criarOportunidade(payload);

    if (response.success) {
      console.log('✅ Lead criado com sucesso');
      const ano = payload.ano as number;
      const mes = payload.mes as number;
      const apiData = (response as any)?.data ?? {};
      const backendId =
        (apiData as any)?.id ??
        (apiData as any)?.data?.id ??
        (response as any)?.id;
      if (backendId != null && !Number.isNaN(Number(backendId))) {
        const id = Number(backendId);
        const detail = { ...payload, id, ano, mes };
        window.dispatchEvent(new CustomEvent('oportunidadeCreated', { detail }));
      } else {
        console.warn('⚠️ AppHeader: Resposta de criação de oportunidade sem ID válido, usando apenas refresh completo');
      }
      apiClient.clearCache('GET_/api/oportunidades/dados');
      window.dispatchEvent(new CustomEvent('oportunidades:refresh'));
      return;
    }

    const errorDetail =
      (response as any)?.error?.detail ||
      (response as any)?.error?.message ||
      (response as any)?.error?.error ||
      'Falha ao criar lead';

    console.warn('❌ Erro ao criar lead:', response);
    throw new Error(errorDetail);
  };

  // Handler para mudança de filial
  const handleFilialChange = async (novaFilial: FilialSigla) => {
    console.log(`🏢 Header: Mudando filial de ${filialSelecionada} para ${novaFilial}`);
    setIsLoadingFilial(true);
    setFilialSelecionada(novaFilial);
    setTimeout(() => {
      setIsLoadingFilial(false);
    }, 500);
  };

  // Detectar tamanho da tela
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Atualizar altura do cabeçalho via CSS custom property
  React.useLayoutEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        const effectiveHeight = headerState === 'collapsed' ? 0 : height;
        document.documentElement.style.setProperty('--header-height', `${effectiveHeight}px`);
      }
    };

    updateHeaderHeight();

    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [headerState]);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleHeaderCollapse = () => {
    if (headerState === 'normal') {
      setHeaderState('collapsed');
    } else {
      setHeaderState('normal');
    }
  };

  const handleTriggerHover = () => {
    if (headerState === 'collapsed') {
      setHeaderState('revealing');
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      const timeout = setTimeout(() => {
        setHeaderState('collapsed');
      }, 3000);
      setHoverTimeout(timeout);
    }
  };

  const handleHeaderMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleHeaderMouseLeave = () => {
    if (headerState === 'revealing') {
      const timeout = setTimeout(() => {
        setHeaderState('collapsed');
      }, 1000);
      setHoverTimeout(timeout);
    }
  };

  // Reset header state when leaving vendas page
  useEffect(() => {
    if (!isVendasPage && headerState !== 'normal') {
      setHeaderState('normal');
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
    }
  }, [isVendasPage, headerState, hoverTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  // Fechar menu de aplicação quando usuário faz logout
  useEffect(() => {
    if (!user) {
      setApplicationMenuOpen(false);
    }
  }, [user]);

  return (
    <>
      {/* Área de Trigger Invisível - Apenas na página de vendas quando colapsado */}
      {isVendasPage && headerState === 'collapsed' && (
        <div
          className="fixed top-0 left-0 w-full h-3 z-[9997] bg-transparent cursor-pointer"
          onMouseEnter={handleTriggerHover}
          title="Passe o mouse para mostrar o header"
        />
      )}

      <header
        ref={headerRef}
        className={`flex flex-col w-full max-w-full bg-header-bg backdrop-blur-md lg:border-b lg:border-header-border overflow-x-hidden transition-all duration-500 ease-out shadow-none ${isVendasPage && headerState === 'collapsed'
          ? 'transform -translate-y-full opacity-0'
          : isVendasPage && headerState === 'revealing'
            ? 'transform translate-y-0 opacity-100'
            : 'transform translate-y-0 opacity-100'
          }`}
        onMouseEnter={isVendasPage ? handleHeaderMouseEnter : undefined}
        onMouseLeave={isVendasPage ? handleHeaderMouseLeave : undefined}
      >
        {/* Linha principal do header */}
        <div className="flex items-center justify-between w-full px-3 py-3 lg:px-6 lg:py-4 gap-2 sm:gap-4">
          {/* Lado esquerdo: Menu toggle + conteúdo condicional */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <button
              type="button"
              className="items-center justify-center w-10 h-10 text-header-muted border-header-button-border rounded-lg z-99999 lg:flex lg:h-11 lg:w-11 lg:border hover:bg-header-hover-bg"
              onClick={handleToggle}
              aria-label="Toggle Sidebar"
            >
              {isMobileOpen ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="12"
                  viewBox="0 0 16 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>

            {/* Botão de Auto-Hide - Apenas vendas */}
            {isVendasPage && (
              <button
                type="button"
                className={`group flex items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg dark:border-gray-800 alter:border-white/[0.08] dark:text-gray-400 alter:text-gray-300 lg:h-11 lg:w-11 lg:border hover:bg-gray-100 dark:hover:bg-gray-800 alter:hover:bg-white/[0.04] transition-all duration-300 ease-out ${headerState === 'collapsed' ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400' : ''
                  }`}
                onClick={toggleHeaderCollapse}
                aria-label="Toggle Header Auto-Hide"
                title={headerState === 'collapsed' ? "Header Oculto" : "Ocultar Header"}
              >
                <div className={`transition-transform duration-500 ${headerState === 'collapsed' ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
                  {headerState === 'collapsed' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="animate-pulse">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" />
                      <circle cx="12" cy="8" r="1" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" stroke="currentColor" />
                    </svg>
                  )}
                </div>
                {headerState === 'collapsed' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />}
              </button>
            )}

            {/* Conteúdo condicional por página - DESKTOP */}
            {isClientesPage && (
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-xl flex items-center justify-center shadow-sm border border-blue-200/30 dark:border-blue-400/20 alter:border-blue-300/10">
                    <Map className="w-4 h-4 text-blue-600 dark:text-blue-400 alter:text-blue-300" />
                  </div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white alter:text-white tracking-tight">
                    Mapa do Cliente
                  </h1>
                </div>
              </div>
            )}
            {isContatosPage && (
              <div className="hidden lg:flex items-center gap-3">
                {/* Título da página */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-xl flex items-center justify-center shadow-sm border border-emerald-200/30 dark:border-emerald-400/20 alter:border-emerald-300/10">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-emerald-600 dark:text-emerald-400 alter:text-emerald-300"
                    >
                      <path
                        d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                        fill="currentColor"
                        fillOpacity="0.8"
                      />
                      <circle
                        cx="18"
                        cy="6"
                        r="2"
                        fill="currentColor"
                        fillOpacity="0.4"
                      />
                    </svg>
                  </div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white alter:text-white tracking-tight">
                    Contatos
                  </h1>
                </div>

                {/* Separador */}
                <div className="h-6 w-px bg-header-separator"></div>

                <HeaderTabs
                  items={[
                    { id: 'relatorio', label: 'Relatório' },
                    { id: 'calendario', label: 'Calendário' },
                    { id: 'historico', label: 'Histórico' },
                    { id: 'visao-geral', label: 'Visão Geral', disabled: true },
                  ]}
                  activeId={contatoActiveTab}
                  onChange={(id) => setContatoActiveTab(id as ContatoViewType)}
                  variant="header"
                  size="md"
                />
              </div>
            )}

            {/* ========================================
                 📢 TÍTULO E CONTROLES DE CAMPANHAS (CONDICIONAL) - DESKTOP
                 ======================================== */}
            {isCampanhasPage && (
              <div className="hidden lg:flex items-center gap-4">
                {/* Título removido conforme solicitação */}

                {/* Separador */}
                <div className="h-6 w-px bg-header-separator"></div>

                <HeaderTabs
                  items={[
                    { id: 'campanhas', label: 'Campanhas' },
                    { id: 'historico', label: 'Histórico' },
                    { id: 'graficos', label: 'Gráficos' },
                  ]}
                  activeId={campanhaActiveTab}
                  onChange={(id) => setCampanhaActiveTab(id as CampanhaViewType)}
                  variant="header"
                  size="md"
                />

                {/* Toggle Lista/Cards com animação e espaçamento ajustado + Botão Nova Campanha */}
                <div className="flex items-center gap-2 ml-2">
                  <AnimatePresence initial={false}>
                    {campanhaActiveTab !== 'graficos' && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div
                          className="relative inline-flex items-center gap-2 rounded-xl border border-header-toggle-border bg-header-toggle-bg p-1"
                          role="group"
                          aria-label="Alternar visualização de campanhas"
                        >
                          <button
                            ref={(el) => {
                              campanhaToggleRefs.current.cards = el;
                            }}
                            type="button"
                            onClick={() => setCampanhaViewMode('cards')}
                            className={`relative px-2 py-2 font-medium text-sm transition-all duration-300 hover:scale-[1.04] ${campanhaViewMode === 'cards'
                              ? 'text-header-toggle-active-text'
                              : 'text-header-toggle-inactive-text hover:text-header-toggle-active-text'
                              }`}
                            title="Visualizar em cards"
                            aria-label="Visualizar em cards"
                            aria-pressed={campanhaViewMode === 'cards'}
                          >
                            <LayoutGrid className="w-4 h-4" />
                          </button>
                          <button
                            ref={(el) => {
                              campanhaToggleRefs.current.list = el;
                            }}
                            type="button"
                            onClick={() => setCampanhaViewMode('list')}
                            className={`relative px-2 py-2 font-medium text-sm transition-all duration-300 hover:scale-[1.04] ${campanhaViewMode === 'list'
                              ? 'text-header-toggle-active-text'
                              : 'text-header-toggle-inactive-text hover:text-header-toggle-active-text'
                              }`}
                            title="Visualizar em lista"
                            aria-label="Visualizar em lista"
                            aria-pressed={campanhaViewMode === 'list'}
                          >
                            <List className="w-4 h-4" />
                          </button>
                          <span
                            className="absolute bottom-0 h-0.5 transition-all duration-300 ease-out bg-header-toggle-indicator"
                            style={{
                              left: `${campanhaToggleIndicator.left}px`,
                              width: `${campanhaToggleIndicator.width}px`,
                            }}
                            aria-hidden="true"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <NovaCampanhaButton />
                </div>
              </div>
            )}

            {/* ========================================
                 🧠 TÍTULO E CONTROLES DE INTELIGÊNCIA (CONDICIONAL) - DESKTOP
                 ======================================== */}
            {isInteligenciaPage && (
              <div className="hidden lg:flex items-center gap-4">
                {/* Título da página */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-xl flex items-center justify-center shadow-sm border border-purple-200/30 dark:border-purple-400/20 alter:border-purple-300/10">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-purple-600 dark:text-purple-400 alter:text-purple-300"
                    >
                      <path
                        d="M12 2L2 7L12 12L22 7L12 2Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 17L12 22L22 17"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 12L12 17L22 12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white alter:text-white tracking-tight">
                    Inteligência de Mercado
                  </h1>
                </div>

                {/* Separador */}
                <div className="h-6 w-px bg-header-separator"></div>

                <HeaderTabs
                  items={[
                    { id: 'registros', label: 'Registros' },
                    { id: 'acompanhamentos', label: 'Acompanhamentos' },
                    { id: 'historico', label: 'Histórico' },
                  ]}
                  activeId={inteligenciaActiveTab}
                  onChange={(id) => setInteligenciaActiveTab(id as InteligenciaViewType)}
                  variant="header"
                  size="md"
                />
              </div>
            )}

            {/* ========================================
                 🎯 TÍTULO E CONTROLES DE VENDAS (CONDICIONAL) - DESKTOP
                 ======================================== */}
            {isVendasPage && headerState !== 'collapsed' && (
              <div className="hidden lg:flex header-vendas-container">
                {/* Título da página - Responsivo e Elegante */}
                <div className="flex items-center gap-2 xl:gap-3 transition-all duration-300 ease-in-out header-title-protected">
                  {/* Ícone sempre visível */}
                  <div className="flex-shrink-0 w-8 h-8 xl:w-9 xl:h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg header-icon-adaptive">
                    <span className="text-white text-sm xl:text-base font-bold">📊</span>
                  </div>

                  {/* Título adaptativo */}
                  <div className="flex flex-col header-title-adaptive min-w-0">
                    <h1 className="text-sm xl:text-lg font-bold text-gray-900 dark:text-white alter:text-white leading-tight whitespace-nowrap">
                      <span className="hidden xl:inline">
                        Vendas - {monthSelector ? monthSelector.getFormattedPeriod() : 'Julho 2025'}
                      </span>
                      <span className="xl:hidden">Vendas</span>
                    </h1>

                    {/* Subtítulo da filial - Adaptativo */}
                    {filialSelecionada !== 'TODAS' && (
                      <div className="flex items-center gap-1 transition-all duration-300 ease-in-out">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-xs xl:text-sm font-medium text-blue-600 dark:text-blue-400 alter:text-blue-300 text-truncate-elegant max-w-[120px] xl:max-w-none">
                          {getFilialInfo(filialSelecionada).nome}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seletor de Mês - Novo */}
                {monthSelector && (
                  <>
                    <div className="header-selector-fixed relative">
                      <MonthSelector
                        compact={true}
                        showYear={true}
                        className="scale-75 xl:scale-85 origin-left transition-transform duration-300 ease-in-out"
                      />
                    </div>

                    {/* Separador */}
                    <div className="h-6 xl:h-8 w-px bg-header-separator header-separator-adaptive"></div>
                  </>
                )}

                {/* Seletor de Filial - Compacto e Responsivo */}
                <div className="header-selector-fixed relative">
                  <FilialSelector
                    filialSelecionada={filialSelecionada}
                    onFilialChange={handleFilialChange}
                    isLoading={isLoadingFilial}
                    className="scale-75 xl:scale-85 origin-left transition-transform duration-300 ease-in-out"
                  />
                </div>

                {/* Separador - Responsivo */}
                <div className="h-6 xl:h-8 w-px bg-header-separator header-separator-adaptive"></div>

                {/* Botões - Compactos e Responsivos */}
                <div className="header-buttons-flexible">
                  {/* Botão Calendário - Responsivo - Apenas Admin */}
                  {isSuperuser ? (
                    <button
                      type="button"
                      onClick={calendarioModal.openModal}
                      className="group relative inline-flex items-center gap-1 xl:gap-1.5 px-2.5 py-1.5 xl:px-3 xl:py-2 text-xs xl:text-sm bg-gradient-to-r from-green-500/95 to-green-600/95 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg xl:rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 backdrop-blur-sm border border-green-400/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <svg className="w-3 xl:w-3.5 h-3 xl:h-3.5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="relative z-10 text-xs xl:text-sm font-semibold hidden sm:inline xl:inline">Calendário</span>
                      <span className="relative z-10 text-xs font-semibold sm:hidden">Cal</span>
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse"></div>
                    </button>
                  ) : null}


                  {/* Botão Transações - Responsivo - DESABILITADO */}
                  <button
                    type="button"
                    disabled
                    className="group relative inline-flex items-center gap-1 xl:gap-1.5 px-2.5 py-1.5 xl:px-3 xl:py-2 text-xs xl:text-sm bg-gray-400/50 text-gray-500 font-medium rounded-lg xl:rounded-xl shadow-lg opacity-40 cursor-not-allowed transition-all duration-300 backdrop-blur-sm border border-gray-400/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <svg className="w-3 xl:w-3.5 h-3 xl:h-3.5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="relative z-10 text-xs xl:text-sm font-semibold hidden sm:inline xl:inline">Transações</span>
                    <span className="relative z-10 text-xs font-semibold sm:hidden">Trans</span>
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"></div>
                  </button>
                </div>
              </div>
            )}

            {headerLeftSlot}
          </div>

          {/* Lado direito: Ações e usuário */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {headerRightSlot}
            {/* Botão de Adicionar (Condicional: Lead ou Contato) */}
            {isInteligenciaPage ? (
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={leadsModal.openModal}
                  className="group flex items-center justify-center w-10 h-10 text-purple-600 dark:text-purple-400 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200/60 dark:border-purple-700/60 rounded-xl hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-800/30 dark:hover:to-indigo-800/30 lg:h-11 lg:w-11 transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-sm"
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  title="Adicionar Novo Lead"
                  aria-label="Adicionar Novo Lead"
                >
                  <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={contatoModal.openModal}
                className="group flex items-center justify-center w-10 h-10 text-emerald-600 dark:text-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/60 dark:border-emerald-700/60 rounded-xl hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-800/30 dark:hover:to-teal-800/30 lg:h-11 lg:w-11 transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-sm"
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                title="Adicionar Novo Contato"
                aria-label="Adicionar Novo Contato"
              >
                <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
              </motion.button>
            )}

            {/* Alternância de Tema */}
            <ThemeToggleButton />
          </div>
        </div>



        {/* Modais para página de vendas */}
        {isVendasPage && (
          <>
            <CalendarioModal
              open={calendarioModal.isOpen}
              onOpenChange={calendarioModal.closeModal}
            />
            <TransacoesModal
              open={transacoesModal.isOpen}
              onOpenChange={transacoesModal.closeModal}
            />
          </>
        )}

        {/* Modal de Contato Global */}
        <ContatoModal
          isOpen={contatoModal.isOpen}
          onClose={contatoModal.closeModal}
          onSubmit={handleNovoContato}
        />

        {/* Modal de Lead (Inteligência) */}
        <LeadsModal
          isOpen={leadsModal.isOpen}
          onClose={leadsModal.closeModal}
          onSubmit={handleNovoLead}
        />
      </header>
    </>
  );
};

// Envolver com React.memo para evitar re-renders desnecessários
export default React.memo(AppHeader);
