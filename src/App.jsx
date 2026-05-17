import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from "./routes/routers"; // Import cấu trúc router mà bạn đã xây dựng

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;