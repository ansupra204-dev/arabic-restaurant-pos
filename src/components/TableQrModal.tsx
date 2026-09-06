import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer, X } from 'lucide-react';
import { useLanguage } from '@/i18n/useLanguage';

interface TableQrModalProps {
  onClose: () => void;
}

export function TableQrModal({ onClose }: TableQrModalProps) {
  const { t } = useLanguage();
  const [codes, setCodes] = useState<Record<number, string>>({});

  useEffect(() => {
    let cancelled = false;
    const baseUrl = window.location.origin;
    void Promise.all(Array.from({ length: 12 }, async (_, index) => {
      const table = index + 1;
      const url = `${baseUrl}/table/${table}`;
      return [table, await QRCode.toDataURL(url, { width: 220, margin: 1 })] as const;
    })).then((entries) => {
      if (!cancelled) setCodes(Object.fromEntries(entries));
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/60 p-4">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-5 dark:bg-slate-900">
        <div className="mb-5 flex items-center justify-between print:hidden">
          <h2 className="text-xl font-bold">{t.tableQrCodes}</h2>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-white"><Printer className="h-4 w-4" />{t.printQrCodes}</button>
            <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={t.close}><X className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }, (_, index) => index + 1).map((table) => (
            <div key={table} className="rounded-xl border border-slate-200 p-3 text-center dark:border-slate-700">
              <p className="font-bold">{t.table} {table}</p>
              {codes[table] ? <img src={codes[table]} alt={`${t.table} ${table}`} className="mx-auto my-2 w-full max-w-[180px]" /> : <div className="my-2 aspect-square animate-pulse bg-slate-100 dark:bg-slate-800" />}
              <p className="text-xs text-slate-500">{t.scanToOrder}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
