import { describe, expect, beforeEach, vi, afterEach, it } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const getColumn = (name: string) => {
  const heading = screen.getAllByRole('heading', { name })[0];
  return heading.closest('section') as HTMLElement;
};

const createTask = async (user: ReturnType<typeof userEvent.setup>, title: string) => {
  await user.click(screen.getByRole('button', { name: 'Создать задачу' }));

  const modal = screen.getByRole('dialog', { name: 'Новая задача' });
  const titleInput = within(modal).getByLabelText('Название');

  await user.clear(titleInput);
  await user.type(titleInput, title);
  await user.click(within(modal).getByRole('button', { name: 'Создать' }));
};

describe('Доска задач PinTaker', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('добавляет новую карточку в нужную колонку', async () => {
    const user = userEvent.setup();
    render(<App />);

    await createTask(user, 'Написать документацию');
    await screen.findByRole('heading', { name: 'Написать документацию' });

    const newColumn = getColumn('Новый');

    expect(within(newColumn).getByRole('heading', { name: 'Написать документацию' })).toBeVisible();
  });

  it('перемещает и архивирует карточку', async () => {
    const user = userEvent.setup();
    render(<App />);

    await createTask(user, 'Починить сборку');
    await screen.findByRole('heading', { name: 'Починить сборку' });

    const newColumn = getColumn('Новый');

    const createdHeading = within(newColumn).getByRole('heading', { name: 'Починить сборку' });
    const card = createdHeading.closest('article') as HTMLElement;
    await user.click(within(card).getByRole('button', { name: '→' }));

    const inProgressColumn = getColumn('В работе');
    const movedHeading = within(inProgressColumn).getByRole('heading', { name: 'Починить сборку' });
    expect(movedHeading).toBeVisible();

    const movedCard = movedHeading.closest('article') as HTMLElement;

    await user.click(within(movedCard).getByRole('button', { name: 'Архивировать' }));

    expect(within(inProgressColumn).queryByRole('heading', { name: 'Починить сборку' })).toBeNull();
    expect(screen.getByText('Починить сборку')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Восстановить' })).toBeVisible();
  });

  it('запускает таймер выполнения', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);

    await createTask(user, 'Проверить отчёт');

    const newColumn = getColumn('Новый');

    const heading = within(newColumn).getByRole('heading', { name: 'Проверить отчёт' });
    const card = heading.closest('article') as HTMLElement;
    await user.click(within(card).getByRole('button', { name: 'Редактировать' }));

    const timerInput = within(card).getByLabelText('Таймер (минут)');
    await user.clear(timerInput);
    await user.type(timerInput, '1');
    await user.click(within(card).getByRole('button', { name: 'Запустить таймер' }));

    vi.advanceTimersByTime(500);

    expect(within(card).getByText(/Осталось/)).toBeVisible();

    vi.useRealTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });
});
