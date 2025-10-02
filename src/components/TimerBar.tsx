import { useEffect, useMemo, useState } from 'react';
import type { TaskTimer } from '../types';

interface TimerBarProps {
  timer: TaskTimer;
}

const TimerBar = ({ timer }: TimerBarProps) => {
  const deadline = useMemo(
    () => timer.startedAt + timer.durationMinutes * 60 * 1000,
    [timer.durationMinutes, timer.startedAt]
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const totalMs = timer.durationMinutes * 60 * 1000;
  const remaining = Math.max(deadline - now, 0);
  const progress = Math.max(0, Math.min(1, 1 - remaining / totalMs));
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const isExpired = remaining === 0;

  return (
    <div className={`timer ${isExpired ? 'timer--expired' : ''}`} role="status" aria-live="polite">
      <div className="timer-label">
        {isExpired ? 'Время истекло' : `Осталось ${minutes}м ${seconds.toString().padStart(2, '0')}с`}
      </div>
      <div className="timer-bar">
        <span className="timer-progress" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
};

export default TimerBar;
