import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';

// Auth
import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import { ScrollToTop } from './components/ScrollToTop';

// Public Pages
import { Home } from './components/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Educators from './pages/Educators';

// Protected Pages
import { Sandbox } from './components/sandbox/Sandbox';
import { Lessons } from './components/lessons/Lessons';
import { LessonViewer } from './components/lessons/LessonViewer';
import Dashboard from './pages/Dashboard';
import FAQ from './pages/FAQ';
import Support from './pages/Support';
import Settings from './pages/Settings';
import Account from './pages/Account';
import Experiments from './components/experiments/Experiments';
import ExperimentRunner from './components/experiments/ExperimentRunner';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/educators" element={<Educators />} />

            {/* Protected routes with AppLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/sandbox" element={<Sandbox />} />
                <Route path="/learn" element={<Lessons />} />
                <Route path="/learn/:trackId/:lessonId" element={<LessonViewer />} />
                <Route path="/circuits" element={<div className="coming-soon">My Circuits - Coming Soon</div>} />
                <Route path="/experiments" element={<Experiments />} />
                <Route path="/experiments/:experimentId" element={<ExperimentRunner />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/support" element={<Support />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/account" element={<Account />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
