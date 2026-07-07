import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';


import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import TopicsPage from './pages/TopicsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ReviewsPage from './pages/ReviewsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import QuizPage from './pages/QuizPage';
import ProgressPage from './pages/ProgressPage';
import ExercisePage from './pages/ExercisePage';
import ProfilePage from './pages/ProfilePage';


import Home from './pages/home';
import Quiz from './pages/Quiz';
import Exercise from './pages/Exercise';
import Chapter from './pages/Chapter';
import Lecon from './pages/Lecon';


import CoursesPage from './pages/Coursespage';
import CourseSectionsPage from './pages/Coursesectionspage';
import SectionDetailPage from './pages/Sectiondetailpage';


import FaqPage from './pages/FaqPage';
import ReportPage from './pages/ReportPage';


import AdminPage from './pages/AdminPage';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  return isAuthenticated ? <Navigate to="/home" replace /> : children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/home" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {}
      <Route path="/" element={<LandingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/topics" element={<TopicsPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/report" element={<ReportPage />} />

      {}
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/chapters" element={<PrivateRoute><Chapter /></PrivateRoute>} />
      <Route path="/lecon" element={<PrivateRoute><Lecon /></PrivateRoute>} />
      <Route path="/quiz" element={<PrivateRoute><QuizPage /></PrivateRoute>} />
      <Route path="/exercises" element={<PrivateRoute><ExercisePage /></PrivateRoute>} />

      {}
      <Route path="/courses"
        element={<PrivateRoute><CoursesPage /></PrivateRoute>} />
      <Route path="/courses/:courseId"
        element={<PrivateRoute><CourseSectionsPage /></PrivateRoute>} />
      <Route path="/courses/:courseId/sections/:sectionId"
        element={<PrivateRoute><SectionDetailPage /></PrivateRoute>} />

      {}
      <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="/progress" element={<PrivateRoute><ProgressPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

      {}
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

      {}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;