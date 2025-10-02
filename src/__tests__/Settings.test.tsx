import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const openSettings = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Открыть параметры' }));
  return screen.getByRole('dialog', { name: 'Параметры' });
};

describe('Панель параметров', () => {
  beforeEach(() => {
    window.localStorage.clear();
    cleanup();
  });

  it('позволяет создавать и удалять категории с сохранением задач', async () => {
    const user = userEvent.setup();
    render(<App />);

    const settings = await openSettings(user);

    const categoryInput = within(settings).getByLabelText('Новая категория');
    await user.type(categoryInput, 'Аналитика');
    await user.click(within(settings).getByRole('button', { name: 'Добавить' }));

    expect(within(settings).getByText('Аналитика')).toBeInTheDocument();

    await user.click(within(settings).getByRole('button', { name: 'Готово' }));

    await user.click(screen.getByRole('button', { name: 'Создать задачу' }));
    const taskModal = screen.getByRole('dialog', { name: 'Новая задача' });
    const titleInput = within(taskModal).getByLabelText('Название');
    await user.type(titleInput, 'Подготовить аналитический отчёт');
    const categorySelect = within(taskModal).getByLabelText('Категория');
    await user.selectOptions(categorySelect, within(taskModal).getByRole('option', { name: 'Аналитика' }));
    await user.click(within(taskModal).getByRole('button', { name: 'Создать' }));

    const cardHeading = await screen.findByRole('heading', { name: 'Подготовить аналитический отчёт' });
    const card = cardHeading.closest('article') as HTMLElement;
    expect(within(card).getByText('Аналитика')).toBeVisible();

    const settingsAgain = await openSettings(user);
    const analyticsItem = within(settingsAgain).getByText('Аналитика').closest('li') as HTMLElement;
    await user.click(within(analyticsItem).getByRole('button', { name: 'Удалить' }));

    expect(within(settingsAgain).queryByText('Аналитика')).toBeNull();

    await user.click(within(settingsAgain).getByRole('button', { name: 'Готово' }));

    expect(within(card).getByText('Дизайн')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Создать задачу' }));
    const newModal = screen.getByRole('dialog', { name: 'Новая задача' });
    expect(within(newModal).queryByRole('option', { name: 'Аналитика' })).toBeNull();
  });

  it('переключает и сохраняет тему интерфейса', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    expect(document.documentElement.classList.contains('dark')).toBe(false);

    const settings = await openSettings(user);
    await user.click(within(settings).getByLabelText('Тёмная'));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.getPropertyValue('color-scheme')).toBe('dark');
    expect(window.localStorage.getItem('pintaker.theme')).toBe('dark');

    await user.click(within(settings).getByRole('button', { name: 'Готово' }));

    unmount();
    render(<App />);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });
});
