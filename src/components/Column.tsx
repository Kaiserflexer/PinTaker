import TaskCard from './TaskCard';
import { useTaskBoard } from '../hooks/useTaskBoard';
import type { Task, TaskStatus } from '../types';

interface ColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
}

const Column = ({
  status,
  title,
  tasks
}: ColumnProps) => {
  const { moveTask, updateTask, deleteTask, archiveTask } = useTaskBoard();

  return (
    <section className={`column column--${status}`} aria-label={title}>
      <header className="column-header">
        <h2>{title}</h2>
        <span className="column-count">{tasks.length}</span>
      </header>
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
