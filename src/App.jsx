import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes/routers';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './features/auth';

function App() {
  return (
    <ToastProvider>
      {/* AuthProvider phải nằm trong RouterProvider để context hoạt động với router */}
      <RouterProvider
        router={router}
        future={{ v7_startTransition: true }}
      />
    </ToastProvider>
  );
}

export default App;