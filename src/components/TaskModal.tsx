import { FormEvent, useEffect, useState } from 'react';
import RichTextEditor from './RichTextEditor';
import { CATEGORIES } from '../hooks/useTaskBoard';
import { DEFAULT_TASK_DESCRIPTION } from '../constants';
import { normalizeTaskContent } from '../utils/richText';
import type { TaskCategory } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: { title: string; category: TaskCategory; content: string }) => void;
}

const TaskModal = ({ isOpen, onClose, onCreate }: TaskModalProps) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('development');
  const [content, setContent] = useState(DEFAULT_TASK_DESCRIPTION);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setCategory('development');
      setContent(DEFAULT_TASK_DESCRIPTION);
    }
  }, [isOpen]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    const normalizedContent = normalizeTaskContent(content);

    onCreate({
      title: trimmedTitle,
      category,
      content: normalizedContent
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
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
            >
              {CATEGORIES.map((option) => (
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
