import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes/routers';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './features/auth';
import { Toaster } from 'react-hot-toast';
function App() {
  return (
   <ToastProvider>
      <RouterProvider
        router={router}
        future={{ v7_startTransition: true }}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
    </ToastProvider>
  );
}

export default App;