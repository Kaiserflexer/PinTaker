import Board from './components/Board';
import { TaskBoardProvider } from './hooks/useTaskBoard';

const App = () => {
  return (
    <TaskBoardProvider>
      <main className="app-shell">
        <header className="app-header">
          <h1>Доска задач PinTaker</h1>
          <p>
            Управляйте задачами, редактируйте rich-text содержимое и отслеживайте дедлайны
            с помощью встроенного таймера.
          </p>
        </header>
        <Board />
      </main>
    </TaskBoardProvider>
  );
};

export default App;
