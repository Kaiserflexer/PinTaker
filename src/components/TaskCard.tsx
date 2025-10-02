import { useEffect, useMemo, useState } from 'react';
import RichTextEditor from './RichTextEditor';
import TimerBar from './TimerBar';
import { CATEGORIES, STATUSES } from '../hooks/useTaskBoard';
import type { Task, TaskCategory, TaskStatus, TaskTimer, TaskUpdate } from '../types';

interface TaskCardProps {
  task: Task;
  onMove: (id: string, status: TaskStatus) => void;
  onUpdate: (id: string, updates: TaskUpdate) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

const statusOrder: TaskStatus[] = STATUSES.map((status) => status.id);

const TaskCard = ({ task, onMove, onUpdate, onDelete, onArchive }: TaskCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [category, setCategory] = useState<TaskCategory>(task.category);
  const [content, setContent] = useState(task.content);
  const [durationMinutes, setDurationMinutes] = useState<number>(
    task.timer?.durationMinutes ?? 30
  );

  useEffect(() => {
    setTitle(task.title);
    setCategory(task.category);
    setContent(task.content);
    setDurationMinutes(task.timer?.durationMinutes ?? 30);
  }, [task]);

  const moveTargets = useMemo(() => {
    const index = statusOrder.indexOf(task.status);
    return {
      prev: index > 0 ? statusOrder[index - 1] : null,
      next: index < statusOrder.length - 1 ? statusOrder[index + 1] : null
    };
  }, [task.status]);

  const handleSave = () => {
    onUpdate(task.id, {
      title,
      category,
      content,
      timer: task.timer
        ? { ...task.timer, durationMinutes }
        : undefined
    });
    setIsEditing(false);
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

  return (
    <article className={`task-card task-card--${category}`}>
      <header className="task-card__header">
        <div className="task-card__title">
          <span className="task-card__category">
            {CATEGORIES.find((item) => item.id === task.category)?.label ?? task.category}
          </span>
          <h3>{task.title}</h3>
        </div>
        <div className="task-card__actions">
          {moveTargets.prev && (
            <button type="button" onClick={() => onMove(task.id, moveTargets.prev!)}>
              ←
            </button>
          )}
          {moveTargets.next && (
            <button type="button" onClick={() => onMove(task.id, moveTargets.next!)}>
              →
            </button>
          )}
          <button type="button" onClick={() => setIsEditing((prev) => !prev)}>
            {isEditing ? 'Закрыть' : 'Редактировать'}
          </button>
          <button type="button" className="danger" onClick={() => onDelete(task.id)}>
            Удалить
          </button>
          <button type="button" onClick={() => onArchive(task.id)}>
            Архивировать
          </button>
        </div>
      </header>
      <section className="task-card__content" dangerouslySetInnerHTML={{ __html: task.content }} />
      {task.timer && <TimerBar timer={task.timer} />}
      {isEditing && (
        <div className="task-card__editor">
          <label className="field">
            <span>Название</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="field">
            <span>Категория</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as TaskCategory)}
            >
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
          <label className="field">
            <span>Таймер (минут)</span>
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(Number(event.target.value))}
            />
          </label>
          <div className="task-card__editor-actions">
            <button type="button" onClick={handleSave}>
              Сохранить
            </button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Отмена
            </button>
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
      )}
    </article>
  );
};

export default TaskCard;
