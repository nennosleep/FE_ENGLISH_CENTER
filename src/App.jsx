import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes/routers';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './features/auth';
function App() {
  return (
   <ToastProvider>
      <RouterProvider
        router={router}
        future={{ v7_startTransition: true }}
      />
    </ToastProvider>
  );
}

export default App;