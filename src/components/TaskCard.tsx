import { useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import TimerBar from './TimerBar';
import TaskEditModal from './TaskEditModal';
import { CATEGORIES, STATUSES } from '../hooks/useTaskBoard';
import { TASK_PLACEHOLDER_CONTENT } from '../constants/taskContent';
import { STATUSES, useTaskBoard } from '../hooks/useTaskBoard';
import type { Task, TaskStatus, TaskUpdate } from '../types';

interface TaskCardProps {
  task: Task;
  onMove: (id: string, status: TaskStatus) => void;
  onUpdate: (id: string, updates: TaskUpdate) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

const statusOrder: TaskStatus[] = STATUSES.map((status) => status.id);
const TaskCard = ({ task, onMove, onUpdate, onDelete, onArchive }: TaskCardProps) => {
  const { categories } = useTaskBoard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardRef = useRef<HTMLElement | null>(null);

  const moveTargets = useMemo(() => {
    const index = statusOrder.indexOf(task.status);
    return {
      prev: index > 0 ? statusOrder[index - 1] : null,
      next: index < statusOrder.length - 1 ? statusOrder[index + 1] : null
    };
  }, [task.status]);

  const handleDelete = () => {
    setIsModalOpen(false);
    onDelete(task.id);
  };

  const handleArchive = () => {
    setIsModalOpen(false);
    onArchive(task.id);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handlePlaceholderKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpenModal();
    }
  };

  const isPlaceholder = task.content === TASK_PLACEHOLDER_CONTENT;

  const categoryLabel = useMemo(() => {
    return categories.find((item) => item.id === task.category)?.label ?? task.category;
  }, [categories, task.category]);


  return (
    <article ref={cardRef} className={`task-card task-card--${task.category}`}>
      <header className="task-card__header">
        <div className="task-card__title">
          <span className="task-card__category">
            {categoryLabel}
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
          <button type="button" onClick={handleOpenModal}>
            Редактировать
          </button>
          <button type="button" className="danger" onClick={handleDelete}>
            Удалить
          </button>
          <button type="button" onClick={handleArchive}>
            Архивировать
          </button>
        </div>
      </header>
      <section
        className={`task-card__content${isPlaceholder ? ' task-card__content--placeholder' : ''}`}
        dangerouslySetInnerHTML={{ __html: task.content }}
        onClick={isPlaceholder ? handleOpenModal : undefined}
        onKeyDown={isPlaceholder ? handlePlaceholderKeyDown : undefined}
        role={isPlaceholder ? 'button' : undefined}
        tabIndex={isPlaceholder ? 0 : undefined}
        aria-label={isPlaceholder ? 'Добавить описание задачи' : undefined}
      />
      {task.timer && <TimerBar timer={task.timer} />}
      <TaskEditModal
        task={task}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={onUpdate}
        onMove={onMove}
        onArchive={handleArchive}
        container={cardRef.current}
      />
    </article>
  );
};

export default TaskCard;
