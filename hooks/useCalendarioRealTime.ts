import { useState, useEffect } from 'react';

interface UseCalendarioRealTimeProps {
  ano: number;
  mes: number;
  filialSelecionada?: string;
  estadoSelecionado?: string;
  origemSelecionada?: string;
  enabled?: boolean;
}

export function useCalendarioRealTime({
  ano,
  mes,
  filialSelecionada,
  estadoSelecionado,
  origemSelecionada,
  enabled = true,
}: UseCalendarioRealTimeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Mock data
  const mockContatos = Array.from({ length: 150 }, (_, i) => {
    const day = (i % 28) + 1;
    const vendedores = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira', 'Carlos Souza'];
    const origens = ['whatsapp', 'ligacao', 'email', 'balcao'];
    const tipos = ['Ativo', 'Receptivo'];
    
    return {
      id: i + 1,
      data_dia: `${ano}-${String(mes + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      data_hora: `${ano}-${String(mes + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T10:00:00`,
      vendedor: vendedores[i % vendedores.length],
      usuario: vendedores[i % vendedores.length],
      origem: origens[i % origens.length],
      tipo_contato: tipos[i % tipos.length],
    };
  });

  useEffect(() => {
    if (enabled) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsInitialLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [ano, mes, filialSelecionada, estadoSelecionado, origemSelecionada, enabled]);

  return {
    contatos: mockContatos,
    estatisticas: {
      ativos: 85,
      receptivos: 65,
      total: 150,
    },
    isLoading,
    isInitialLoading,
    error: null,
    hasRecentUpdates: false,
    isConnected: true,
    lastUpdate: null,
    refresh: () => {},
    forceFullSync: () => {},
  };
}
