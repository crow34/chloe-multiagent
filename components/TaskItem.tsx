import React from 'react';
// FIX: Corrected import path for types
import type { Task } from '../types';
import CircleIcon from './icons/CircleIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle }) => {
  const isDone = task.status === 'done';

  return (
    <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg transition-colors duration-200">
      <button onClick={() => onToggle(task.id)} className="mt-1 flex-shrink-0">
        {isDone ? (
          <CheckCircleIcon className="w-6 h-6 text-green-400" />
        ) : (
          <CircleIcon className="w-6 h-6 text-slate-500 group-hover:text-indigo-400 transition-colors" />
        )}
      </button>
      <div>
        <p className={`font-semibold text-slate-200 ${isDone ? 'line-through text-slate-400' : ''}`}>
          {task.title}
        </p>
        <p className={`text-sm text-slate-400 ${isDone ? 'line-through' : ''}`}>
          {task.description}
        </p>
      </div>
    </div>
  );
};

export default TaskItem;