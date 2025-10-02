import { FormEvent, MouseEvent, useEffect, useState } from 'react';
import { ThemeMode, useTaskBoard } from '../hooks/useTaskBoard';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { categories, addCategory, removeCategory, theme, setTheme } = useTaskBoard();
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewCategory('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const created = addCategory(newCategory);
    if (!created) {
      setError('Введите название категории.');
      return;
    }

    setNewCategory('');
    setError('');
  };

  const handleRemove = (categoryId: string) => {
    const removed = removeCategory(categoryId);
    if (!removed) {
      setError('Нельзя удалить последнюю категорию.');
    } else {
      setError('');
    }
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode);
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={handleOverlayClick}>
      <div
        className="modal settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="settings-modal-title">Параметры</h2>
          <button type="button" className="modal-close" aria-label="Закрыть" onClick={onClose}>
            ×
          </button>
        </header>

        <section className="settings-section">
          <h3>Категории</h3>
          <p className="settings-description">
            Создайте собственные категории или удалите лишние. Задачи с удалённой категорией
            получат первую доступную из списка.
          </p>
          <form className="settings-category-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Новая категория</span>
              <input
                type="text"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="Например, Аналитика"
              />
            </label>
            <button type="submit" className="modal-submit">
              Добавить
            </button>
          </form>
          <ul className="settings-category-list">
            {categories.map((category) => (
              <li key={category.id} className="settings-category-item">
                <div>
                  <strong>{category.label}</strong>
                  <span className="settings-category-id">{category.id}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(category.id)}
                  disabled={categories.length <= 1}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="settings-section">
          <h3>Тема</h3>
          <p className="settings-description">
            Переключайтесь между светлой и тёмной темой. Настройки сохраняются в этом браузере.
          </p>
          <fieldset className="settings-theme" aria-label="Выбор темы">
            <legend className="sr-only">Тема оформления</legend>
            <label>
              <input
                type="radio"
                name="color-theme"
                value="light"
                checked={theme === 'light'}
                onChange={() => handleThemeChange('light')}
              />
              Светлая
            </label>
            <label>
              <input
                type="radio"
                name="color-theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={() => handleThemeChange('dark')}
              />
              Тёмная
            </label>
          </fieldset>
        </section>

        {error && <p className="settings-error" role="alert">{error}</p>}

        <footer className="modal-footer">
          <button type="button" className="primary" onClick={onClose}>
            Готово
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;
