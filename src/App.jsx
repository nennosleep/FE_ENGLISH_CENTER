import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes/router';
import { ToastProvider } from './core/components';

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