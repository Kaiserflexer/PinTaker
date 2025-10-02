import { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}

const commands: { id: string; icon: string; label: string; command?: string }[] = [
  { id: 'bold', icon: 'B', label: 'Полужирный', command: 'bold' },
  { id: 'italic', icon: 'I', label: 'Курсив', command: 'italic' },
  { id: 'underline', icon: 'U', label: 'Подчёркнутый', command: 'underline' },
  { id: 'ul', icon: '•', label: 'Список', command: 'insertUnorderedList' }
];

const RichTextEditor = ({ value, onChange, ariaLabel }: RichTextEditorProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  const handleCommand = (command: string) => {
    document.execCommand(command);
    ref.current?.focus();
    onChange(ref.current?.innerHTML ?? '');
  };

  const handleInsertImage = () => {
    const url = window.prompt('Вставьте URL изображения');
    if (!url) {
      return;
    }
    document.execCommand('insertImage', false, url);
    onChange(ref.current?.innerHTML ?? '');
  };

  const handleInsertTable = () => {
    const rows = Number.parseInt(window.prompt('Количество строк таблицы?') ?? '2', 10) || 2;
    const cols = Number.parseInt(window.prompt('Количество столбцов?') ?? '2', 10) || 2;
    const table = document.createElement('table');
    table.className = 'rte-table';
    for (let row = 0; row < rows; row += 1) {
      const tr = document.createElement('tr');
      for (let col = 0; col < cols; col += 1) {
        const td = document.createElement('td');
        td.appendChild(document.createElement('br'));
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      ref.current?.appendChild(table);
    } else {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(table);
    }
    onChange(ref.current?.innerHTML ?? '');
  };

  const handleInput: React.FormEventHandler<HTMLDivElement> = () => {
    onChange(ref.current?.innerHTML ?? '');
  };

  return (
    <div className="rte">
      <div className="rte-toolbar" role="toolbar" aria-label="Форматирование текста">
        {commands.map((button) => (
          <button
            type="button"
            key={button.id}
            className="rte-button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => button.command && handleCommand(button.command)}
            aria-label={button.label}
          >
            {button.icon}
          </button>
        ))}
        <button type="button" className="rte-button" onClick={handleInsertImage}>
          🖼
        </button>
        <button type="button" className="rte-button" onClick={handleInsertTable}>
          ☐
        </button>
      </div>
      <div
        ref={ref}
        className="rte-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        aria-label={ariaLabel}
      />
    </div>
  );
};

export default RichTextEditor;
