'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCalendarioRealTime } from './hooks/useCalendarioRealTime';
import { vendedoresService } from './services';

interface CalendarioMensalRealTimeProps {
  dados?: Array<{
    data: string;
    valor: number;
  }>;
  isActive?: boolean;
}

type SellerRow = { id: string; name: string; leads: Uint16Array; total: number };
type CalendarComputed = { sellers: SellerRow[]; dailyTotals: Uint32Array; grandTotal: number };

type OrigemContato =
  | 'whatsapp'
  | 'ligacao'
  | 'email'
  | 'balcao'
  | 'nao_informado'
  | 'analises'
  | 'povt'
  | 'campanhas'
  | 'todos';

type StatusContato = '' | 'Ativo' | 'Receptivo';

type FilterOption = { label: string; value: string };

const getLeadBadgeStyle = (val: number) => {
  if (val === 0) return 'light:bg-red-50 light:text-red-700 light:border-red-200 dark:bg-red-950/70 dark:text-red-300 dark:border-red-900/60 alter:bg-white/10 alter:text-red-200 alter:border-white/20';
  if (val <= 3) return 'light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-900/60 alter:bg-white/10 alter:text-emerald-200 alter:border-white/20';
  if (val <= 6) return 'light:bg-blue-50 light:text-blue-700 light:border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-900/60 alter:bg-white/10 alter:text-blue-200 alter:border-white/20';
  return 'light:bg-violet-50 light:text-violet-700 light:border-violet-200 dark:bg-violet-950/70 dark:text-violet-300 dark:border-violet-900/60 alter:bg-white/10 alter:text-violet-200 alter:border-white/20';
};

const getDayTotalBadgeStyle = (val: number) => {
  if (val === 0) return 'light:bg-red-100 light:text-red-800 light:border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/40 alter:bg-white/10 alter:text-red-200 alter:border-white/15';
  if (val <= 5) return 'light:bg-emerald-100 light:text-emerald-800 light:border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/40 alter:bg-white/10 alter:text-emerald-200 alter:border-white/15';
  if (val <= 15) return 'light:bg-blue-100 light:text-blue-800 light:border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/40 alter:bg-white/10 alter:text-blue-200 alter:border-white/15';
  return 'light:bg-violet-100 light:text-violet-800 light:border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-900/40 alter:bg-white/10 alter:text-violet-200 alter:border-white/15';
};

const LeadCell = React.memo(function LeadCell({ value }: { value: number }) {
  return (
    <div
      className={`
        relative flex items-center justify-center w-8 h-6 rounded-md text-[11px] font-semibold
        border transition-all duration-300 ease-out
        ${getLeadBadgeStyle(value)}
      `}
    >
      <span>{value}</span>
    </div>
  );
});

const TotalCell = React.memo(function TotalCell({ value }: { value: number }) {
  const getStyle = (val: number) => {
    if (val === 0) return 'bg-muted/50 text-muted-foreground border-border/50';
    if (val <= 10) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
    if (val <= 25) return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30';
    return 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30';
  };

  return (
    <div
      className={`
        flex items-center justify-center w-11 h-7 rounded-lg text-xs font-bold
        border shadow-sm transition-all duration-300 ease-out
        ${getStyle(value)}
      `}
    >
      <span>{value}</span>
    </div>
  );
});

const DayTotalCell = React.memo(function DayTotalCell({ value }: { value: number }) {
  return (
    <div className={`flex items-center justify-center w-8 h-6 rounded-md text-[11px] font-bold border transition-all duration-300 ease-out ${getDayTotalBadgeStyle(value)}`}>
      <span>{value}</span>
    </div>
  );
});

const SellerRowView = React.memo(
  function SellerRowView({ seller, daysArray }: { seller: SellerRow; daysArray: number[] }) {
    return (
      <tr className="border-b border-border/40 hover:bg-accent/30 transition-colors duration-100 group">
        <td className="sticky left-0 z-10 bg-card/95 backdrop-blur-md px-4 py-2 text-sm font-medium text-foreground group-hover:bg-accent/30 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary">
                {seller.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="truncate max-w-[120px]" title={seller.name}>{seller.name}</span>
          </div>
        </td>
        {daysArray.map(day => (
          <td key={day} className="px-1 py-1.5 text-center">
            <LeadCell value={seller.leads[day] || 0} />
          </td>
        ))}
        <td className="sticky right-0 z-10 bg-card/95 backdrop-blur-md px-4 py-2 text-center group-hover:bg-accent/30 transition-colors">
          <TotalCell value={seller.total} />
        </td>
      </tr>
    );
  },
  (prev, next) => prev.seller === next.seller && prev.daysArray === next.daysArray
);

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [anchor, setAnchor] = useState<{ left: number; top: number; bottom: number; width: number } | null>(null);
  const selectedLabel = options.find(o => o.value === value)?.label || label;

  const getMenuMaxHeight = (count: number) => {
    const rowHeight = 38;
    const max = 320;
    return Math.min(max, Math.max(160, count * rowHeight));
  };

  const updateAnchor = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setAnchor({ left: r.left, top: r.top, bottom: r.bottom, width: r.width });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updateAnchor();
    const onResize = () => updateAnchor();
    const onScroll = () => updateAnchor();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [isOpen, updateAnchor]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-card/80 border border-border/60 rounded-lg hover:bg-accent/50 hover:border-border transition-all duration-200 min-w-[140px] justify-between"
        type="button"
      >
        <span className="text-foreground/90 truncate">{selectedLabel}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </motion.div>
      </button>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && anchor && (
              <>
                <motion.div
                  className="fixed inset-0 z-[9998]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="fixed z-[9999] bg-popover border border-border rounded-lg shadow-xl overflow-hidden"
                  style={{
                    left: anchor.left,
                    top: anchor.bottom + 6,
                    width: anchor.width,
                    maxHeight: getMenuMaxHeight(options.length),
                  }}
                >
                  <div className="max-h-[320px] overflow-y-auto">
                    {options.map((option, index) => (
                      <motion.button
                        key={option.value}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.015 }}
                        onClick={() => {
                          onChange(option.value);
                          setIsOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-accent/70 transition-colors duration-150 ${option.value === value ? 'bg-accent/50 text-primary' : ''}`}
                        type="button"
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

function StatsBadge({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: 'green' | 'purple' | 'orange';
}) {
  const variants = {
    green: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    purple: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30',
    orange: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${variants[variant]}`}>
      <span className="opacity-80">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

const CalendarioMensalRealTime: React.FC<CalendarioMensalRealTimeProps> = ({ isActive = true }) => {
  const [dataAtual, setDataAtual] = useState(new Date());
  const [filialSelecionada, setFilialSelecionada] = useState('');
  const [estadoSelecionado, setEstadoSelecionado] = useState('');
  const [statusSelecionado, setStatusSelecionado] = useState<StatusContato>('');
  const [origemSelecionada, setOrigemSelecionada] = useState<OrigemContato>('todos');
  const lastStableComputedRef = useRef<CalendarComputed | null>(null);
  const computedSignatureRef = useRef<string>('');
  const computeJobRef = useRef(0);
  const [rebuildToken, setRebuildToken] = useState(0);
  const [computed, setComputed] = useState<CalendarComputed>(() => ({
    sellers: [],
    dailyTotals: new Uint32Array(32),
    grandTotal: 0,
  }));

  const ano = dataAtual.getFullYear();
  const mes = dataAtual.getMonth();
  const monthNumber = mes + 1;
  const daysInMonth = new Date(ano, monthNumber, 0).getDate();
  const today = new Date();
  const isTodayMonth = today.getFullYear() === ano && today.getMonth() === mes;
  const todayDay = today.getDate();

  const monthNames = useMemo(
    () => ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    []
  );

  const { contatos, estatisticas, isLoading: isLoadingCalendario, isInitialLoading, error, hasRecentUpdates, isConnected, lastUpdate, refresh, forceFullSync } =
    useCalendarioRealTime({
      ano,
      mes,
      filialSelecionada,
      estadoSelecionado,
      origemSelecionada: origemSelecionada === 'todos' ? 'todos' : origemSelecionada,
      enabled: isActive,
    });

  const { data: filtrosOptions } = useQuery({
    queryKey: ['vendedores-filtros-options'],
    queryFn: () => vendedoresService.getFilialEstadoOptions(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: isActive,
  });

  const { data: vendedoresFiltrados } = useQuery({
    queryKey: ['vendedores-filtrados', filialSelecionada, estadoSelecionado],
    queryFn: () => vendedoresService.getVendedoresAtivos(filialSelecionada || undefined, estadoSelecionado || undefined),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: isActive,
  });

  const filiaisOptions: FilterOption[] = useMemo(() => {
    const filiais = Array.isArray(filtrosOptions?.filiais) ? filtrosOptions?.filiais : [];
    return [{ label: 'Todas as filiais', value: '' }, ...filiais.map((f: string) => ({ label: f, value: f }))];
  }, [filtrosOptions]);

  const estadosOptions: FilterOption[] = useMemo(() => {
    const estados = Array.isArray(filtrosOptions?.estados) ? filtrosOptions?.estados : [];
    return [{ label: 'Todos os estados', value: '' }, ...estados.map((e: string) => ({ label: e, value: e }))];
  }, [filtrosOptions]);

  const statusOptions: FilterOption[] = useMemo(
    () => [
      { label: 'Todos os status', value: '' },
      { label: 'Ativo', value: 'Ativo' },
      { label: 'Receptivo', value: 'Receptivo' },
    ],
    []
  );

  const origemOptions: FilterOption[] = useMemo(
    () => [
      { label: 'Todas as origens', value: 'todos' },
      { label: 'WhatsApp', value: 'whatsapp' },
      { label: 'Ligação', value: 'ligacao' },
      { label: 'E-mail', value: 'email' },
      { label: 'Balcão', value: 'balcao' },
      { label: 'Não informado', value: 'nao_informado' },
      { label: 'Análises', value: 'analises' },
      { label: 'POVT', value: 'povt' },
      { label: 'Campanhas', value: 'campanhas' },
    ],
    []
  );

  const daysArray = useMemo(() => Array.from({ length: daysInMonth }, (_, idx) => idx + 1), [daysInMonth]);

  const normalizeName = useCallback(
    (s?: string) =>
      (s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' '),
    []
  );

  const normalizeLoose = useCallback(
    (s?: string) => {
      const base = (s || '').replace(/@.*/, '').replace(/[._-]/g, ' ');
      return normalizeName(base);
    },
    [normalizeName]
  );

  const resolveVendedorNome = useCallback(
    (vendorKeyToNome: Map<string, string>, contato: any): string | null => {
      const candidatos: string[] = [];
      if (contato?.usuario) candidatos.push(String(contato.usuario));
      if (contato?.vendedor) candidatos.push(String(contato.vendedor));
      for (const cand of candidatos) {
        const n1 = normalizeName(cand);
        const n2 = normalizeLoose(cand);
        if (vendorKeyToNome.has(n1)) return vendorKeyToNome.get(n1)!;
        if (vendorKeyToNome.has(n2)) return vendorKeyToNome.get(n2)!;
      }
      return null;
    },
    [normalizeName, normalizeLoose]
  );

  const vendorKeyToNome = useMemo(() => {
    const baseVendedores = Array.isArray(vendedoresFiltrados) ? vendedoresFiltrados : [];
    const map = new Map<string, string>();
    for (const v of baseVendedores) {
      const keys = new Set<string>();
      keys.add(normalizeName(v.nomecompleto));
      keys.add(normalizeLoose(v.nomecompleto));
      if (v.email) {
        keys.add(normalizeName(v.email));
        keys.add(normalizeLoose(v.email));
      }
      for (const k of keys) map.set(k, v.nomecompleto);
    }
    return map;
  }, [vendedoresFiltrados, normalizeName, normalizeLoose]);

  const loading = isActive ? isInitialLoading || isLoadingCalendario : false;

  const rebuildSignature = useMemo(() => {
    const vendCount = Array.isArray(vendedoresFiltrados) ? vendedoresFiltrados.length : 0;
    const contatosLen = Array.isArray(contatos) ? contatos.length : 0;
    const updateId = (lastUpdate as any)?.update_id ?? 0;
    return `${ano}-${mes}|${filialSelecionada}|${estadoSelecionado}|${statusSelecionado}|${origemSelecionada}|${vendCount}|${contatosLen}|${updateId}|${rebuildToken}`;
  }, [ano, mes, filialSelecionada, estadoSelecionado, statusSelecionado, origemSelecionada, vendedoresFiltrados, contatos, lastUpdate, rebuildToken]);

  useEffect(() => {
    const jobId = ++computeJobRef.current;
    const signatureChanged = computedSignatureRef.current !== rebuildSignature;

    if (!signatureChanged && computed.sellers.length > 0) return;
    computedSignatureRef.current = rebuildSignature;

    const contatosBase = Array.isArray(contatos) ? contatos : [];
    const baseVendedores = Array.isArray(vendedoresFiltrados) ? vendedoresFiltrados : [];

    const statusLower = statusSelecionado ? statusSelecionado.toLowerCase() : '';
    const origemLower = origemSelecionada && origemSelecionada !== 'todos' ? String(origemSelecionada).toLowerCase() : '';

    const sellersRows: SellerRow[] = baseVendedores.map((v: any) => ({
      id: String(v.nomecompleto),
      name: String(v.nomecompleto),
      leads: new Uint16Array(daysInMonth + 1),
      total: 0,
    }));

    const indexByName = new Map<string, number>();
    for (let i = 0; i < sellersRows.length; i++) indexByName.set(sellersRows[i]!.name, i);

    const dailyTotalsArr = new Uint32Array(daysInMonth + 1);
    const resolveCache = new Map<string, string | null>();

    const limit = contatosBase.length;
    const batchSize = 6000;
    let i = 0;

    const processBatch = () => {
      if (jobId !== computeJobRef.current) return;

      const end = Math.min(i + batchSize, limit);
      for (; i < end; i++) {
        const c: any = contatosBase[i];
        if (!c) continue;

        if (statusLower && String(c.tipo_contato || '').toLowerCase() !== statusLower) continue;
        if (origemLower && String(c.origem || 'nao_informado').toLowerCase() !== origemLower) continue;

        const rawDateStr = c?.data_dia ? String(c.data_dia).slice(0, 10) : c?.data_hora ? String(c.data_hora).slice(0, 10) : '';
        if (rawDateStr.length !== 10) continue;
        const y = Number(rawDateStr.slice(0, 4));
        const m = Number(rawDateStr.slice(5, 7)) - 1;
        const day = Number(rawDateStr.slice(8, 10));
        if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(day)) continue;
        if (y !== ano || m !== mes) continue;
        if (day < 1 || day > daysInMonth) continue;

        const cacheKey = c?.usuario ? String(c.usuario) : c?.vendedor ? String(c.vendedor) : '';
        let nomeVendedor: string | null | undefined = cacheKey ? resolveCache.get(cacheKey) : undefined;
        if (nomeVendedor === undefined) {
          nomeVendedor = resolveVendedorNome(vendorKeyToNome, c);
          if (cacheKey) resolveCache.set(cacheKey, nomeVendedor);
        }

        if (!nomeVendedor) {
          dailyTotalsArr[day] = (dailyTotalsArr[day] || 0) + 1;
          continue;
        }

        const idx = indexByName.get(nomeVendedor);
        if (idx === undefined) {
          dailyTotalsArr[day] = (dailyTotalsArr[day] || 0) + 1;
          continue;
        }

        const row = sellersRows[idx]!;
        row.leads[day] = (row.leads[day] || 0) + 1;
        row.total += 1;
        dailyTotalsArr[day] = (dailyTotalsArr[day] || 0) + 1;
      }

      if (i < limit) {
        window.setTimeout(processBatch, 0);
        return;
      }

      let grand = 0;
      for (let d = 1; d <= daysInMonth; d++) grand += dailyTotalsArr[d] || 0;

      const nextComputed: CalendarComputed = {
        sellers: sellersRows,
        dailyTotals: dailyTotalsArr,
        grandTotal: grand,
      };

      lastStableComputedRef.current = nextComputed;
      setComputed(nextComputed);
    };

    if (typeof (window as any).requestIdleCallback === 'function') {
      (window as any).requestIdleCallback(() => processBatch(), { timeout: 250 });
    } else {
      window.setTimeout(processBatch, 0);
    }
  }, [
    rebuildSignature,
    contatos,
    vendedoresFiltrados,
    statusSelecionado,
    origemSelecionada,
    ano,
    mes,
    daysInMonth,
    resolveVendedorNome,
    vendorKeyToNome,
    computed.sellers.length,
  ]);

  useEffect(() => {
    if (!lastUpdate || lastUpdate.type !== 'contatos_update') return;
    const payload: any = (lastUpdate as any).data;
    if (!payload) return;
    if (!isTodayMonth) return;
    const rawDateStr = payload?.data_dia ? String(payload.data_dia).slice(0, 10) : payload?.data_hora ? String(payload.data_hora).slice(0, 10) : '';
    if (rawDateStr.length !== 10) return;
    const y = Number(rawDateStr.slice(0, 4));
    const m = Number(rawDateStr.slice(5, 7)) - 1;
    const day = Number(rawDateStr.slice(8, 10));
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(day)) return;
    if (y !== ano || m !== mes) return;
    if (day !== todayDay) return;

    const nomeVendedor = resolveVendedorNome(vendorKeyToNome, payload);
    const keyBase = nomeVendedor || (payload?.usuario ? String(payload.usuario) : '');
    if (!keyBase) return;

    if (lastUpdate.action !== 'create' && lastUpdate.action !== 'delete') return;

    const statusLower = statusSelecionado ? statusSelecionado.toLowerCase() : '';
    const origemLower = origemSelecionada && origemSelecionada !== 'todos' ? String(origemSelecionada).toLowerCase() : '';
    if (statusLower && String(payload.tipo_contato || '').toLowerCase() !== statusLower) return;
    if (origemLower && String(payload.origem || 'nao_informado').toLowerCase() !== origemLower) return;

    computeJobRef.current += 1;
    setComputed(prev => {
      if (!prev.sellers || prev.sellers.length === 0) return prev;

      const dailyTotalsCopy = prev.dailyTotals.slice();
      const sellersCopy = prev.sellers.slice();

      const delta = lastUpdate.action === 'delete' ? -1 : 1;
      let applied = false;

      const idx = sellersCopy.findIndex(s => s.name === keyBase);
      if (idx >= 0) {
        const row = sellersCopy[idx]!;
        const leadsCopy = row.leads.slice();
        const nextVal = Math.max(0, (leadsCopy[day] || 0) + delta);
        const prevVal = leadsCopy[day] || 0;
        leadsCopy[day] = nextVal;
        const nextTotal = Math.max(0, row.total + (nextVal - prevVal));
        sellersCopy[idx] = { ...row, leads: leadsCopy, total: nextTotal };
        applied = true;
      }

      const prevDaily = dailyTotalsCopy[day] || 0;
      dailyTotalsCopy[day] = Math.max(0, prevDaily + delta);
      const nextGrand = Math.max(0, prev.grandTotal + delta);

      const next = { sellers: sellersCopy, dailyTotals: dailyTotalsCopy, grandTotal: nextGrand };
      lastStableComputedRef.current = next;
      return next;
    });
    return;
  }, [lastUpdate, ano, mes, todayDay, isTodayMonth, resolveVendedorNome, vendorKeyToNome, statusSelecionado, origemSelecionada]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setDataAtual(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + (direction === 'prev' ? -1 : 1));
      return next;
    });
  }, []);

  const renderComputed = useMemo(() => {
    if (!loading) return computed;
    const stable = lastStableComputedRef.current;
    if (stable && stable.sellers.length > 0) return stable;
    return computed;
  }, [loading, computed]);

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full space-y-4">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title and Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {monthNames[mes]} {ano}
                </h1>
                <p className="text-sm text-muted-foreground">Acompanhamento de vendas</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <StatsBadge label="Ativos" value={estatisticas.ativos} variant="green" />
              <StatsBadge label="Receptivos" value={estatisticas.receptivos} variant="purple" />
              <StatsBadge label="Total" value={estatisticas.total} variant="orange" />
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-card/80 border border-border/60 rounded-xl p-1">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded-lg hover:bg-accent/50 transition-all duration-200"
                type="button"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4 text-foreground/70" />
              </button>
              <span className="px-3 text-sm font-medium text-foreground/80 min-w-[100px] text-center">
                {monthNames[mes].slice(0, 3)} {ano}
              </span>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-lg hover:bg-accent/50 transition-all duration-200"
                type="button"
                aria-label="Proximo mes"
              >
                <ChevronRight className="w-4 h-4 text-foreground/70" />
              </button>
            </div>
            <button
              onClick={() => {
                forceFullSync();
                refresh();
                setRebuildToken(t => t + 1);
              }}
              className="p-2.5 rounded-xl bg-card/80 border border-border/60 hover:bg-accent/50 hover:border-border transition-all duration-200"
              title="Atualizar dados"
              type="button"
            >
              <RefreshCw className={`w-4 h-4 text-foreground/70 ${hasRecentUpdates ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex items-center gap-2 flex-wrap p-3 bg-muted/30 rounded-xl border border-border/40">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-2">Filtros:</span>
          <FilterDropdown label="Filial" value={filialSelecionada} options={filiaisOptions} onChange={setFilialSelecionada} />
          <FilterDropdown label="Estado" value={estadoSelecionado} options={estadosOptions} onChange={setEstadoSelecionado} />
          <FilterDropdown label="Status" value={statusSelecionado} options={statusOptions} onChange={v => setStatusSelecionado(v as StatusContato)} />
          <FilterDropdown label="Origem" value={origemSelecionada} options={origemOptions} onChange={v => setOrigemSelecionada(v as OrigemContato)} />
        </div>

        {/* Calendar Table */}
        <motion.div
          className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto custom-scrollbar">
            {/* Loading indicator */}
            {loading && renderComputed.sellers.length > 0 && (
              <div className="pointer-events-none sticky top-0 left-0 z-[60] w-full">
                <div className="flex justify-end p-3">
                  <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2 text-xs font-medium text-primary backdrop-blur-sm shadow-sm">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                      <RefreshCw className="w-3.5 h-3.5" />
                    </motion.div>
                    <span>Atualizando dados...</span>
                  </div>
                </div>
              </div>
            )}
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-30">
                <tr className="bg-muted/50">
                  <th className="sticky left-0 z-40 bg-muted/95 backdrop-blur-md px-4 py-3 text-left text-xs font-semibold text-foreground/80 uppercase tracking-wider border-b border-border/60 min-w-[160px]">
                    Vendedor
                  </th>
                  {daysArray.map(day => {
                    const isToday = isTodayMonth && day === todayDay;
                    return (
                      <th 
                        key={day} 
                        className={`px-1 py-3 text-center text-xs font-semibold border-b border-border/60 min-w-[42px] transition-colors ${
                          isToday 
                            ? 'bg-primary/10 text-primary' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        {day}
                      </th>
                    );
                  })}
                  <th className="sticky right-0 z-40 bg-muted/95 backdrop-blur-md px-4 py-3 text-center text-xs font-semibold text-foreground uppercase tracking-wider border-b border-border/60 min-w-[70px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {error ? (
                  <tr>
                    <td colSpan={daysArray.length + 2} className="px-6 py-12">
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" x2="12" y1="8" y2="12" />
                            <line x1="12" x2="12.01" y1="16" y2="16" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-destructive">Erro ao carregar dados</p>
                          <p className="text-xs text-muted-foreground mt-1">{String(error)}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : loading && renderComputed.sellers.length === 0 ? (
                  <tr>
                    <td colSpan={daysArray.length + 2} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground">Carregando calendario</p>
                          <p className="text-xs text-muted-foreground mt-1">Buscando dados de vendedores...</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : renderComputed.sellers.length === 0 ? (
                  <tr>
                    <td colSpan={daysArray.length + 2} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <line x1="17" x2="22" y1="11" y2="11" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Nenhum vendedor encontrado</p>
                          <p className="text-xs text-muted-foreground mt-1">Tente ajustar os filtros selecionados</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {renderComputed.sellers.map(seller => (
                      <SellerRowView key={seller.id} seller={seller} daysArray={daysArray} />
                    ))}

                    <tr className="bg-muted/60 border-t-2 border-border">
                      <td className="sticky left-0 z-10 bg-muted/95 backdrop-blur-md px-4 py-3 text-xs font-bold text-foreground uppercase tracking-wide">
                        Total por Dia
                      </td>
                      {daysArray.map(day => {
                        const isToday = isTodayMonth && day === todayDay;
                        return (
                          <td key={day} className={`px-1 py-2 text-center ${isToday ? 'bg-primary/5' : ''}`}>
                            <DayTotalCell value={renderComputed.dailyTotals[day] || 0} />
                          </td>
                        );
                      })}
                      <td className="sticky right-0 z-10 bg-muted/95 backdrop-blur-md px-4 py-2 text-center">
                        <motion.div 
                          className="flex items-center justify-center w-12 h-8 rounded-lg text-sm font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        >
                          <span>{renderComputed.grandTotal}</span>
                        </motion.div>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CalendarioMensalRealTime;
