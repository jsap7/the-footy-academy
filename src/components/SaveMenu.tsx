import { useEffect, useRef, useState } from 'react';
import { clearLocalStorage, exportSaveAsJSON, parseImportedSave } from '../game/save';
import type { GameState } from '../types';
import Button from '../ui/Button';

type Props = {
  state: GameState;
  onImport: (state: GameState) => void;
};

export default function SaveMenu({ state, onImport }: Props) {
  const [open, setOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleExport = () => {
    exportSaveAsJSON(state);
    setOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = parseImportedSave(text);
      if (!imported) {
        setImportError('save file is invalid or from a different version.');
        return;
      }
      onImport(imported);
      setImportError(null);
      setOpen(false);
    } catch {
      setImportError('could not read file.');
    } finally {
      // Reset input so the same file can be imported again later.
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (
      !window.confirm(
        'reset the game? this clears your save permanently and starts a fresh academy.',
      )
    )
      return;
    clearLocalStorage();
    window.location.reload();
  };

  return (
    <div ref={menuRef} className="relative">
      <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
        save
      </Button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-hairline-bright bg-bg-elev shadow-2xl">
          <button
            type="button"
            onClick={handleExport}
            className="block w-full px-4 py-2.5 text-left text-[12px] uppercase tracking-[0.10em] text-ink hover:bg-bg-elev-2"
          >
            export save (.json)
          </button>
          <button
            type="button"
            onClick={handleImportClick}
            className="block w-full px-4 py-2.5 text-left text-[12px] uppercase tracking-[0.10em] text-ink hover:bg-bg-elev-2"
          >
            import save…
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFile}
            className="hidden"
          />
          <div className="border-t border-hairline" />
          <button
            type="button"
            onClick={handleReset}
            className="block w-full px-4 py-2.5 text-left text-[12px] uppercase tracking-[0.10em] text-warn hover:bg-bg-elev-2"
          >
            reset game…
          </button>
          {importError ? (
            <div className="border-t border-hairline px-4 py-2 text-[11px] text-warn">
              {importError}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
