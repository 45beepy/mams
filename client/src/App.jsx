import { Routes, Route } from 'react-router-dom';
import LoginPage from '/src/pages/LoginPage.jsx';
import DashboardPage from '/src/pages/DashboardPage.jsx';
import PrivateRoute from '/src/components/PrivateRoute.jsx';
import MainLayout from '/src/components/MainLayout.jsx';
import TransfersPage from '/src/pages/TransfersPage.jsx';
import PurchasesPage from '/src/pages/PurchasesPage.jsx';
import AssignmentsPage from '/src/pages/AssignmentsPage.jsx';

// This is the main App component definition.
// It should be in its own file, App.jsx.
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