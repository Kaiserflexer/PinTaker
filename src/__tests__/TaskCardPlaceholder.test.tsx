import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskCard from '../components/TaskCard';
import { TASK_PLACEHOLDER_CONTENT } from '../constants/taskContent';
import type { Task } from '../types';
import { TaskBoardProvider } from '../hooks/useTaskBoard';

vi.mock('../components/TaskEditModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? (
      <div role="dialog" aria-label="Редактирование задачи">
        Редактирование задачи
      </div>
    ) : null
}));

vi.mock('../components/TimerBar', () => ({
  default: () => null
}));

const baseTask: Task = {
  id: 'task-1',
  title: 'Тестовая задача',
  content: TASK_PLACEHOLDER_CONTENT,
  status: 'new',
  category: 'development',
  archived: false
};

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe('TaskCard placeholder behaviour', () => {
  it('opens the edit modal when clicking the placeholder content', async () => {
    const user = userEvent.setup();

    render(
      <TaskBoardProvider>
        <TaskCard
          task={baseTask}
          onMove={vi.fn()}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
          onArchive={vi.fn()}
        />
      </TaskBoardProvider>
    );

    const placeholder = screen.getByRole('button', { name: 'Добавить описание задачи' });
    await user.click(placeholder);

    expect(screen.getByRole('dialog', { name: 'Редактирование задачи' })).toBeInTheDocument();
  });

  it('does not interfere with existing descriptions', async () => {
    const user = userEvent.setup();

    render(
      <TaskBoardProvider>
        <TaskCard
          task={{ ...baseTask, content: '<p>Описание заполнено</p>' }}
          onMove={vi.fn()}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
          onArchive={vi.fn()}
        />
      </TaskBoardProvider>
    );

    const content = screen.getByText('Описание заполнено');
    await user.click(content);

    expect(screen.queryByRole('dialog', { name: 'Редактирование задачи' })).not.toBeInTheDocument();
  });
});
