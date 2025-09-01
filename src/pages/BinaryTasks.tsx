import React from 'react';
import { BinaryTaskManager } from '@/components/BinaryTaskManager';
import ProtectedRoute from '@/components/ProtectedRoute';

const BinaryTasks = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <BinaryTaskManager />
      </div>
    </ProtectedRoute>
  );
};

export default BinaryTasks;