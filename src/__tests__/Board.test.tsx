import { describe, expect, beforeEach, vi, afterEach, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const getColumn = (name: string) => {
  const heading = screen.getAllByRole('heading', { name })[0];
  return heading.closest('section') as HTMLElement;
};

describe('Доска задач PinTaker', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('добавляет новую карточку в нужную колонку', async () => {
    const user = userEvent.setup();
    render(<App />);

    const newColumn = getColumn('Новый');
    const titleInput = within(newColumn).getByPlaceholderText('Название задачи');

    await user.type(titleInput, 'Написать документацию');
    await user.click(within(newColumn).getByRole('button', { name: 'Добавить' }));

    expect(within(newColumn).getByRole('heading', { name: 'Написать документацию' })).toBeVisible();
  });

  it('перемещает и архивирует карточку', async () => {
    const user = userEvent.setup();
    render(<App />);

    const newColumn = getColumn('Новый');
    const titleInput = within(newColumn).getByPlaceholderText('Название задачи');

    await user.type(titleInput, 'Починить сборку');
    await user.click(within(newColumn).getByRole('button', { name: 'Добавить' }));

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

    const newColumn = getColumn('Новый');
    const titleInput = within(newColumn).getByPlaceholderText('Название задачи');

    await user.type(titleInput, 'Проверить отчёт');
    await user.click(within(newColumn).getByRole('button', { name: 'Добавить' }));

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
    vi.useRealTimers();
  });
});
