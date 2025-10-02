import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import RichTextEditor from './RichTextEditor';
import { normalizeTaskContent } from '../utils/richText';

import { TASK_PLACEHOLDER_CONTENT } from '../constants/taskContent';
import { useTaskBoard } from '../hooks/useTaskBoard';
import type { TaskCategory } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: { title: string; category: TaskCategory; content: string }) => void;
}

const TaskModal = ({ isOpen, onClose, onCreate }: TaskModalProps) => {
  const { categories } = useTaskBoard();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('development');
  const [content, setContent] = useState(TASK_PLACEHOLDER_CONTENT);
  const fallbackCategory = useMemo(() => categories[0]?.id ?? '', [categories]);

  const wasOpenRef = useRef(false);

  useEffect(() => {
    const wasOpen = wasOpenRef.current;

    if (!wasOpen && isOpen) {
      setTitle('');
      setCategory(fallbackCategory || 'development');
      setContent(TASK_PLACEHOLDER_CONTENT);
    }

    wasOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!category || !categories.some((option) => option.id === category)) {
      setCategory(fallbackCategory);

    }
  }, [isOpen, category, categories, fallbackCategory]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    const normalizedContent = normalizeTaskContent(content);
    onCreate({
      title: trimmedTitle,
      category: category || fallbackCategory,
      content: normalizedContent
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal--compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="create-task-title">Новая задача</h2>
          <button type="button" className="modal-close" aria-label="Закрыть" onClick={onClose}>
            ×
          </button>
        </header>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Название</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Например, подготовить презентацию"
              autoFocus
            />
          </label>
          <label className="field">
            <span>Категория</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as TaskCategory)}
              disabled={categories.length === 0}
            >
              {categories.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Описание</span>
            <RichTextEditor
              value={content}
              onChange={setContent}
              ariaLabel="Описание новой задачи"
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="modal-submit">
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
