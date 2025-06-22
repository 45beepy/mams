import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '/src/App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '/src/context/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

/* === File: /client/src/App.jsx === */
import { Routes, Route } from 'react-router-dom';
import LoginPage from '/src/pages/LoginPage.jsx';
import DashboardPage from '/src/pages/DashboardPage.jsx';
import PrivateRoute from '/src/components/PrivateRoute.jsx';
import MainLayout from '/src/components/MainLayout.jsx';
import TransfersPage from '/src/pages/TransfersPage.jsx';
import PurchasesPage from '/src/pages/PurchasesPage.jsx';
import AssignmentsPage from '/src/pages/AssignmentsPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="transfers" element={<TransfersPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
