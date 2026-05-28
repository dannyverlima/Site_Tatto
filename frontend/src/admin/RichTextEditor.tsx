import { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Palette, Heading1, Heading2 } from 'lucide-react';
import { normalizeHtml } from '../app/utils/html';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

const toolbarButtonClass =
  'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white/80 transition hover:bg-white/10 hover:text-white';

const colors = [
  { label: 'Branco', value: '#ffffff' },
  { label: 'Cinza', value: '#d1d5db' },
  { label: 'Dourado', value: '#d4af37' },
  { label: 'Vermelho', value: '#ef4444' },
  { label: 'Verde', value: '#22c55e' },
  { label: 'Azul', value: '#38bdf8' },
];

const exec = (command: string, value?: string) => {
  document.execCommand(command, false, value);
};

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const nextValue = normalizeHtml(value);
    if (element.innerHTML !== nextValue) {
      element.innerHTML = nextValue;
    }
  }, [value]);

  const sync = () => {
    if (!ref.current) return;
    onChange(normalizeHtml(ref.current.innerHTML));
  };

  const handleCommand = (command: string, value?: string) => {
    exec(command, value);
    sync();
    ref.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      handleCommand('bold');
    }
  };

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" className={toolbarButtonClass} onClick={() => handleCommand('formatBlock', 'h2')} title="Título">
          <Heading1 className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => handleCommand('formatBlock', 'h3')} title="Subtítulo">
          <Heading2 className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => handleCommand('bold')} title="Negrito">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => handleCommand('italic')} title="Itálico">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => handleCommand('underline')} title="Sublinhado">
          <Underline className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => handleCommand('justifyLeft')} title="Alinhar à esquerda">
          <AlignLeft className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => handleCommand('justifyCenter')} title="Centralizar">
          <AlignCenter className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => handleCommand('justifyRight')} title="Alinhar à direita">
          <AlignRight className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => handleCommand('justifyFull')} title="Justificar">
          <AlignJustify className="h-4 w-4" />
        </button>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white/80">
          <Palette className="h-4 w-4" />
          <select
            className="bg-transparent text-sm outline-none"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) handleCommand('foreColor', event.target.value);
              event.currentTarget.value = '';
            }}
          >
            <option value="" disabled>
              Cor
            </option>
            {colors.map((color) => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className={`min-h-[180px] rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-white outline-none ring-0 transition focus:border-white/20 focus:bg-white/[0.07] [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mb-3 ${className ?? ''}`}
        style={{ whiteSpace: 'pre-wrap' }}
      />

      <style>{`
        [contenteditable=true][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: rgba(255,255,255,0.35);
        }
      `}</style>
    </div>
  );
}