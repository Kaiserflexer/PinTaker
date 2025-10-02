import { useState } from 'react';
import Column from './Column';
import TaskModal from './TaskModal';
import { useTaskBoard, STATUSES } from '../hooks/useTaskBoard';
import type { TaskCategory } from '../types';

const Board = () => {
  const { activeTasks, archivedTasks, addTask, restoreTask } = useTaskBoard();
  const [isModalOpen, setModalOpen] = useState(false);

  const handleCreateTask = ({
    title,
    category,
    content
  }: {
    title: string;
    category: TaskCategory;
    content: string;
  }) => {
    addTask({
      title,
      status: 'new',
      category,
      content
    });

    setModalOpen(false);
  };

  return (
    <section className="board">
      <div className="board-columns">
        {STATUSES.map(({ id, label }) => (
          <Column
            key={id}
            status={id}
            title={label}
            tasks={activeTasks.filter((task) => task.status === id)}
          />
        ))}
      </div>
      <button
        type="button"
        className="board-create-fab"
        aria-label="Создать задачу"
        onClick={() => setModalOpen(true)}
      >
        +
      </button>
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateTask}
      />
      <aside className="archive">
        <h2>Архив</h2>
        {archivedTasks.length === 0 ? (
          <p className="archive-empty">Архив пуст — удалённые карточки появятся здесь.</p>
        ) : (
          <ul className="archive-list">
            {archivedTasks.map((task) => (
              <li key={task.id} className={`archive-item archive-item--${task.category}`}>
                <div>
                  <strong>{task.title}</strong>
                  <span className="archive-status">Статус: {STATUSES.find((s) => s.id === task.status)?.label}</span>
                </div>
                <button className="archive-restore" onClick={() => restoreTask(task.id)}>
                  Восстановить
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="archive-hint">
          <p>
            Карточки можно архивировать из меню карточки, чтобы сохранить историю работы без
            окончательного удаления.
          </p>
        </div>
      </aside>
    </section>
  );
};

export default Board;
