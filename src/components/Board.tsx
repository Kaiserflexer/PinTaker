import { useState } from 'react';
import Column from './Column';
import { useTaskBoard, STATUSES } from '../hooks/useTaskBoard';
import type { TaskCategory, TaskStatus } from '../types';

const Board = () => {
  const { activeTasks, archivedTasks, addTask, restoreTask } = useTaskBoard();
  const [draftTitles, setDraftTitles] = useState<Record<TaskStatus, string>>({
    'new': '',
    'in-progress': '',
    'done': ''
  });
  const [draftCategories, setDraftCategories] = useState<Record<TaskStatus, TaskCategory>>({
    'new': 'development',
    'in-progress': 'development',
    'done': 'development'
  });

  const handleCreateTask = (status: TaskStatus) => {
    const title = draftTitles[status].trim();
    if (!title) {
      return;
    }

    addTask({
      title,
      status,
      category: draftCategories[status],
      content: '<p>Нажмите, чтобы отредактировать описание задачи.</p>'
    });

    setDraftTitles((prev) => ({ ...prev, [status]: '' }));
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
            draftTitle={draftTitles[id]}
            onDraftTitleChange={(value) =>
              setDraftTitles((prev) => ({ ...prev, [id]: value }))
            }
            draftCategory={draftCategories[id]}
            onDraftCategoryChange={(value) =>
              setDraftCategories((prev) => ({ ...prev, [id]: value }))
            }
            onCreateTask={() => handleCreateTask(id)}
          />
        ))}
      </div>
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
