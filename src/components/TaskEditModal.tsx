import { type MouseEvent, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import RichTextEditor from './RichTextEditor';
import { CATEGORIES, STATUSES } from '../hooks/useTaskBoard';
import { normalizeTaskContent } from '../utils/richText';
import type { Task, TaskCategory, TaskStatus, TaskTimer, TaskUpdate } from '../types';

interface TaskEditModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: TaskUpdate) => void;
  onMove: (id: string, status: TaskStatus) => void;
  onArchive: (id: string) => void;
  container?: Element | null;
}

const statusOrder: TaskStatus[] = STATUSES.map((status) => status.id);

const TaskEditModal = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onMove,
  onArchive,
  container
}: TaskEditModalProps) => {
  const [title, setTitle] = useState(task.title);
  const [category, setCategory] = useState<TaskCategory>(task.category);
  const [content, setContent] = useState(task.content);
  const [durationMinutes, setDurationMinutes] = useState<number>(task.timer?.durationMinutes ?? 30);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTitle(task.title);
    setCategory(task.category);
    setContent(task.content);
    setDurationMinutes(task.timer?.durationMinutes ?? 30);
  }, [isOpen, task]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const moveTargets = useMemo(() => {
    const index = statusOrder.indexOf(task.status);
    return {
      prev: index > 0 ? statusOrder[index - 1] : null,
      next: index < statusOrder.length - 1 ? statusOrder[index + 1] : null
    };
  }, [task.status]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSave = () => {
    onUpdate(task.id, {
      title,
      category,
      content: normalizeTaskContent(content),
      timer: task.timer ? { ...task.timer, durationMinutes } : undefined
    });
    onClose();
  };

  const handleStartTimer = () => {
    if (!durationMinutes || durationMinutes <= 0) {
      return;
    }

    const timer: TaskTimer = {
      durationMinutes,
      startedAt: Date.now()
    };

    onUpdate(task.id, { timer });
  };

  const handleResetTimer = () => {
    onUpdate(task.id, { timer: null });
  };

  const modalContent = (
    <div className="modal-overlay" role="presentation" onClick={handleOverlayClick}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`task-modal-${task.id}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id={`task-modal-${task.id}`}>Редактирование задачи</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </header>

        <div className="modal-task-meta">
          <span className="modal-task-status">Статус: {STATUSES.find((status) => status.id === task.status)?.label}</span>
          <div className="modal-task-actions">
            {moveTargets.prev && (
              <button type="button" onClick={() => onMove(task.id, moveTargets.prev!)}>
                Перенести в «{STATUSES.find((status) => status.id === moveTargets.prev)?.label}»
              </button>
            )}
            {moveTargets.next && (
              <button type="button" onClick={() => onMove(task.id, moveTargets.next!)}>
                Перенести в «{STATUSES.find((status) => status.id === moveTargets.next)?.label}»
              </button>
            )}
            <button type="button" onClick={() => onArchive(task.id)}>
              Архивировать
            </button>
          </div>
        </div>

        <div className="modal-body">
          <label className="field">
            <span>Название</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="field">
            <span>Категория</span>
            <select value={category} onChange={(event) => setCategory(event.target.value as TaskCategory)}>
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Описание</span>
            <RichTextEditor value={content} onChange={setContent} ariaLabel="Описание задачи" />
          </label>
          <div className="modal-timer">
            <label className="field">
              <span>Таймер (минут)</span>
              <input
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
              />
            </label>
            <div className="modal-timer-actions">
              <button type="button" onClick={handleStartTimer}>
                Запустить таймер
              </button>
              {task.timer && (
                <button type="button" onClick={handleResetTimer}>
                  Сбросить таймер
                </button>
              )}
            </div>
          </div>
        </div>

        <footer className="modal-footer">
          <button type="button" onClick={handleSave} className="primary">
            Сохранить
          </button>
          <button type="button" onClick={onClose} className="secondary">
            Отмена
          </button>
        </footer>
      </div>
    </div>
  );

  const target = container ?? (typeof document !== 'undefined' ? document.body : null);

  return target ? createPortal(modalContent, target) : null;
};

export default TaskEditModal;
