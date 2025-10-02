import TaskCard from './TaskCard';
import { CATEGORIES, useTaskBoard } from '../hooks/useTaskBoard';
import type { Task, TaskCategory, TaskStatus } from '../types';

interface ColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  draftTitle: string;
  draftCategory: TaskCategory;
  onDraftTitleChange: (value: string) => void;
  onDraftCategoryChange: (value: TaskCategory) => void;
  onCreateTask: () => void;
}

const Column = ({
  status,
  title,
  tasks,
  draftTitle,
  draftCategory,
  onDraftTitleChange,
  onDraftCategoryChange,
  onCreateTask
}: ColumnProps) => {
  const { moveTask, updateTask, deleteTask, archiveTask } = useTaskBoard();

  return (
    <section className={`column column--${status}`} aria-label={title}>
      <header className="column-header">
        <h2>{title}</h2>
        <span className="column-count">{tasks.length}</span>
      </header>
      <div className="column-create">
        <input
          type="text"
          value={draftTitle}
          placeholder="Название задачи"
          onChange={(event) => onDraftTitleChange(event.target.value)}
        />
        <select
          value={draftCategory}
          onChange={(event) => onDraftCategoryChange(event.target.value as TaskCategory)}
        >
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
        <button type="button" className="create-button" onClick={onCreateTask}>
          Добавить
        </button>
      </div>
      <div className="column-content">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onMove={moveTask}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onArchive={archiveTask}
          />
        ))}
        {tasks.length === 0 && (
          <p className="column-empty">Нет задач. Добавьте новую карточку.</p>
        )}
      </div>
    </section>
  );
};

export default Column;
