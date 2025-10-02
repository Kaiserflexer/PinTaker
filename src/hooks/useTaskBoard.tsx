import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Task,
  TaskCategory,
  TaskCategoryOption,
  TaskStatus,
  TaskTimer,
  TaskUpdate
} from '../types';

const STORAGE_KEY = 'pintaker.tasks';
const CATEGORY_STORAGE_KEY = 'pintaker.categories';
const THEME_STORAGE_KEY = 'pintaker.theme';

export type ThemeMode = 'light' | 'dark';

export const STATUSES: { id: TaskStatus; label: string }[] = [
  { id: 'new', label: 'Новый' },
  { id: 'in-progress', label: 'В работе' },
  { id: 'done', label: 'Выполнено' }
];

const DEFAULT_CATEGORIES: TaskCategoryOption[] = [
  { id: 'design', label: 'Дизайн' },
  { id: 'development', label: 'Разработка' },
  { id: 'research', label: 'Исследование' },
  { id: 'marketing', label: 'Маркетинг' },
  { id: 'support', label: 'Поддержка' }
];

interface TaskBoardContextValue {
  tasks: Task[];
  activeTasks: Task[];
  archivedTasks: Task[];
  categories: TaskCategoryOption[];
  addCategory: (label: string) => TaskCategoryOption | null;
  removeCategory: (id: TaskCategory) => boolean;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  addTask: (input: {
    title: string;
    content?: string;
    status: TaskStatus;
    category: TaskCategory;
    timer?: TaskTimer | null;
  }) => void;
  updateTask: (id: string, updates: TaskUpdate) => void;
  deleteTask: (id: string) => void;
  archiveTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  restoreTask: (id: string) => void;
}

const TaskBoardContext = createContext<TaskBoardContextValue | undefined>(undefined);

const readFromStorage = (): Task[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Не удалось загрузить задачи', error);
    return [];
  }
};

const writeToStorage = (tasks: Task[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const readCategoriesFromStorage = (): TaskCategoryOption[] => {
  if (typeof window === 'undefined') {
    return DEFAULT_CATEGORIES;
  }

  try {
    const raw = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw) as TaskCategoryOption[];
    if (!Array.isArray(parsed)) {
      return DEFAULT_CATEGORIES;
    }
    const sanitized = parsed.filter(
      (item): item is TaskCategoryOption =>
        typeof item?.id === 'string' && typeof item?.label === 'string'
    );
    return sanitized.length > 0 ? sanitized : DEFAULT_CATEGORIES;
  } catch (error) {
    console.error('Не удалось загрузить категории', error);
    return DEFAULT_CATEGORIES;
  }
};

const writeCategoriesToStorage = (categories: TaskCategoryOption[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
};

const readThemeFromStorage = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'dark' ? 'dark' : 'light';
};

const writeThemeToStorage = (theme: ThemeMode) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
};

const applyTheme = (theme: ThemeMode) => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.style.setProperty('color-scheme', theme);
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export const TaskBoardProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => readFromStorage());
  const [categories, setCategories] = useState<TaskCategoryOption[]>(() =>
    readCategoriesFromStorage()
  );
  const [theme, setThemeState] = useState<ThemeMode>(() => readThemeFromStorage());

  useEffect(() => {
    writeCategoriesToStorage(categories);
  }, [categories]);

  useEffect(() => {
    applyTheme(theme);
    writeThemeToStorage(theme);
  }, [theme]);

  const persist = (nextTasks: Task[]) => {
    setTasks(nextTasks);
    writeToStorage(nextTasks);
  };

  const ensureCategory = (category: TaskCategory): TaskCategory => {
    if (categories.some((item) => item.id === category)) {
      return category;
    }
    return categories[0]?.id ?? category;
  };

  const createCategoryId = (label: string) => {
    const normalized = label.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const base = normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `category-${generateId()}`;

    let candidate = base;
    let index = 1;

    while (categories.some((item) => item.id === candidate)) {
      candidate = `${base}-${index++}`;
    }

    return candidate;
  };

  const addTask: TaskBoardContextValue['addTask'] = ({
    title,
    content = '',
    status,
    category,
    timer
  }) => {
    const task: Task = {
      id: generateId(),
      title,
      content,
      status,
      category: ensureCategory(category),
      archived: false,
      timer: timer ?? undefined
    };
    persist([...tasks, task]);
  };

  const updateTask: TaskBoardContextValue['updateTask'] = (id, updates) => {
    persist(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...updates,
              category:
                updates.category !== undefined ? ensureCategory(updates.category) : task.category,
              timer: updates.timer === null ? undefined : updates.timer ?? task.timer
            }
          : task
      )
    );
  };

  const deleteTask: TaskBoardContextValue['deleteTask'] = (id) => {
    persist(tasks.filter((task) => task.id !== id));
  };

  const archiveTask: TaskBoardContextValue['archiveTask'] = (id) => {
    updateTask(id, { archived: true });
  };

  const restoreTask: TaskBoardContextValue['restoreTask'] = (id) => {
    updateTask(id, { archived: false });
  };

  const moveTask: TaskBoardContextValue['moveTask'] = (id, status) => {
    updateTask(id, { status });
  };

  const addCategory: TaskBoardContextValue['addCategory'] = (label) => {
    const trimmed = label.trim();
    if (!trimmed) {
      return null;
    }

    const newCategory: TaskCategoryOption = {
      id: createCategoryId(trimmed),
      label: trimmed
    };

    setCategories([...categories, newCategory]);
    return newCategory;
  };

  const removeCategory: TaskBoardContextValue['removeCategory'] = (id) => {
    if (categories.length <= 1) {
      return false;
    }

    const exists = categories.some((item) => item.id === id);
    if (!exists) {
      return false;
    }

    const nextCategories = categories.filter((item) => item.id !== id);
    setCategories(nextCategories);

    const fallback = nextCategories[0]?.id;
    if (fallback) {
      persist(tasks.map((task) => (task.category === id ? { ...task, category: fallback } : task)));
    }

    return true;
  };

  const setTheme: TaskBoardContextValue['setTheme'] = (nextTheme) => {
    setThemeState(nextTheme);
  };

  const toggleTheme: TaskBoardContextValue['toggleTheme'] = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo<TaskBoardContextValue>(
    () => ({
      tasks,
      activeTasks: tasks.filter((task) => !task.archived),
      archivedTasks: tasks.filter((task) => task.archived),
      categories,
      addCategory,
      removeCategory,
      theme,
      setTheme,
      toggleTheme,
      addTask,
      updateTask,
      deleteTask,
      archiveTask,
      moveTask,
      restoreTask
    }),
    [tasks, categories, theme]
  );

  return <TaskBoardContext.Provider value={value}>{children}</TaskBoardContext.Provider>;
};

export const useTaskBoard = () => {
  const context = useContext(TaskBoardContext);
  if (!context) {
    throw new Error('useTaskBoard должен использоваться внутри TaskBoardProvider');
  }
  return context;
};
