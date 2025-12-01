import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';

// Pages
import { Sandbox } from './components/sandbox/Sandbox';
import { Lessons } from './components/lessons/Lessons';
import { LessonViewer } from './components/lessons/LessonViewer';
import { Home } from './components/Home';

const queryClient = new QueryClient();

function Navigation() {
  return (
    <nav className="nav">
      <div className="nav-brand">
        <span className="nav-logo">◈</span>
        <span className="nav-title">QUANTA</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Home
        </NavLink>
        <NavLink to="/sandbox" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Sandbox
        </NavLink>
        <NavLink to="/learn" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Learn
        </NavLink>
      </div>
    </nav>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app">
          <Navigation />
          <main className="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sandbox" element={<Sandbox />} />
              <Route path="/learn" element={<Lessons />} />
              <Route path="/learn/:trackId/:lessonId" element={<LessonViewer />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
