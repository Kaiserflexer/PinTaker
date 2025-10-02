import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren
} from 'react';

import type { TaskCategoryOption } from '../../types';

type MockTaskBoardValue = {
  categories: TaskCategoryOption[];
};

const MockTaskBoardContext = createContext<MockTaskBoardValue | null>(null);

const MockTaskBoardProvider = ({
  categories,
  children
}: PropsWithChildren<{ categories: TaskCategoryOption[] }>) => {
  const value = useMemo(() => ({ categories }), [categories]);

  return (
    <MockTaskBoardContext.Provider value={value}>{children}</MockTaskBoardContext.Provider>
  );
};

vi.mock('../../hooks/useTaskBoard', () => ({
  useTaskBoard: () => {
    const context = useContext(MockTaskBoardContext);

    if (!context) {
      throw new Error('MockTaskBoardProvider is required for this test');
    }

    return context;
  }
}));

import TaskModal from '../TaskModal';

describe('TaskModal', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn()
    });
  });

  const handleClose = vi.fn();
  const handleCreate = vi.fn();

  const TestHarness = () => {
    const [categories, setCategories] = useState<TaskCategoryOption[]>([
      { id: 'design', label: 'Дизайн' },
      { id: 'development', label: 'Разработка' }
    ]);

    return (
      <MockTaskBoardProvider categories={categories}>
        <TaskModal isOpen onClose={handleClose} onCreate={handleCreate} />
        <button
          type="button"
          onClick={() =>
            setCategories([
              { id: 'research', label: 'Исследование' },
              { id: 'marketing', label: 'Маркетинг' }
            ])
          }
        >
          Обновить категории
        </button>
      </MockTaskBoardProvider>
    );
  };

  it('сохраняет пользовательский ввод при обновлении списка категорий', async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    const modal = screen.getByRole('dialog', { name: 'Новая задача' });
    const titleInput = within(modal).getByLabelText('Название');
    const categorySelect = within(modal).getByLabelText('Категория') as HTMLSelectElement;
    const descriptionEditor = within(modal).getByLabelText('Описание новой задачи');

    await user.clear(titleInput);
    await user.type(titleInput, 'Срочная задача');
    await user.selectOptions(categorySelect, 'development');

    await user.click(descriptionEditor);
    await user.keyboard('{Control>}{KeyA}{/Control}{Backspace}Подробное описание');

    await user.click(screen.getByRole('button', { name: 'Обновить категории' }));

    expect(titleInput).toHaveValue('Срочная задача');
    expect(categorySelect.value).toBe('research');
    expect(descriptionEditor).toHaveTextContent('Подробное описание');
  });
});
