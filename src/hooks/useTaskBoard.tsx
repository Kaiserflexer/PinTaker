import React, { createContext, useContext, useMemo, useState } from 'react';
import { Task, TaskCategory, TaskStatus, TaskTimer, TaskUpdate } from '../types';

const STORAGE_KEY = 'pintaker.tasks';

export const STATUSES: { id: TaskStatus; label: string }[] = [
  { id: 'new', label: 'Новый' },
  { id: 'in-progress', label: 'В работе' },
  { id: 'done', label: 'Выполнено' }
];

export const CATEGORIES: { id: TaskCategory; label: string }[] = [
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

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export const TaskBoardProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => readFromStorage());

  const persist = (nextTasks: Task[]) => {
    setTasks(nextTasks);
    writeToStorage(nextTasks);
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
      category,
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

  const value = useMemo<TaskBoardContextValue>(
    () => ({
      tasks,
      activeTasks: tasks.filter((task) => !task.archived),
      archivedTasks: tasks.filter((task) => task.archived),
      addTask,
      updateTask,
      deleteTask,
      archiveTask,
      moveTask,
      restoreTask
    }),
    [tasks]
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
