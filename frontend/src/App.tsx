import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';

// Auth
import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Pages
import { Sandbox } from './components/sandbox/Sandbox';
import { Lessons } from './components/lessons/Lessons';
import { LessonViewer } from './components/lessons/LessonViewer';
import { Home } from './components/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes with AppLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/sandbox" element={<Sandbox />} />
                <Route path="/learn" element={<Lessons />} />
                <Route path="/learn/:trackId/:lessonId" element={<LessonViewer />} />
                <Route path="/circuits" element={<div className="coming-soon">My Circuits - Coming Soon</div>} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
