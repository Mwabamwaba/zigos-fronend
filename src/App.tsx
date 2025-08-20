import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SOWList from './components/SOW/SOWList';
import SOWBuilder from './components/SOW/SOWBuilder';
import Repository from './components/Repository';
import ApprovalDashboard from './components/ApprovalDashboard';
import Settings from './components/Settings';
import Dashboard from './components/Dashboard';
import ProjectDetails from './components/project/ProjectDetails';
import ProjectManagement from './components/project/ProjectManagement';
import FirefliesIntegration from './components/FirefliesIntegration';
import MeetingNotes from './components/MeetingNotes';
import ArchitectureGenerator from './components/ArchitectureGenerator';
import FirefliesTestPage from './components/Fireflies/FirefliesTestPage';
import HubSpotCallback from './components/HubSpot/HubSpotCallback';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import AuthGate from './components/auth/AuthGate';
import ProtectedRoute from './components/auth/ProtectedRoute';


export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentView = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    return path.slice(1).split('/')[0] as 'dashboard' | 'sow' | 'repository' | 'approvals' | 'settings' | 'admin';
  };

  const handleViewChange = (view: 'dashboard' | 'sow' | 'repository' | 'approvals' | 'settings' | 'admin') => {
    navigate(`/${view === 'dashboard' ? '' : view}`);
  };

  return (
    <Routes>
      {/* Public authentication routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/auth-gate" element={<AuthGate />} />
      
      {/* Protected application routes - temporarily bypassed for development */}
      <Route path="/*" element={
        <div className="h-screen flex flex-col bg-gray-50">
          <div className="flex-1 flex overflow-hidden">
            <Sidebar onViewChange={handleViewChange} currentView={getCurrentView()} />
            
            <div className="flex-1 overflow-y-auto">
              <Routes>
                  <Route path="/" element={
                    <div className="h-full">
                      <Dashboard />
                    </div>
                  } />
                  <Route path="/sow" element={
                    <div className="h-full flex">
                      <SOWList />
                    </div>
                  } />
                  <Route path="/sow/:id" element={
                    <div className="h-full">
                      <SOWBuilder />
                    </div>
                  } />
                  <Route path="/repository" element={
                    <div className="h-full">
                      <Repository />
                    </div>
                  } />
                  <Route path="/project/:id" element={
                    <div className="h-full">
                      <ProjectDetails />
                    </div>
                  } />
                  <Route path="/project/:id/manage" element={
                    <div className="h-full">
                      <ProjectManagement />
                    </div>
                  } />
                  <Route path="/approvals" element={
                    <div className="h-full">
                      <ApprovalDashboard />
                    </div>
                  } />
                  <Route path="/settings" element={
                    <div className="h-full">
                      <Settings />
                    </div>
                  } />

                  <Route path="/fireflies" element={
                    <div className="min-h-full p-4">
                      <FirefliesIntegration />
                    </div>
                  } />
                  <Route path="/meetings" element={
                    <div className="min-h-full p-4">
                      <MeetingNotes />
                    </div>
                  } />
                  <Route path="/architecture" element={
                    <div className="min-h-full p-4">
                      <ArchitectureGenerator />
                    </div>
                  } />
                  <Route path="/fireflies-test" element={
                    <div className="min-h-full p-4">
                      <FirefliesTestPage />
                    </div>
                  } />
                  <Route path="/oauth/hubspot/callback" element={
                    <div className="min-h-full p-4">
                      <HubSpotCallback />
                    </div>
                  } />
                </Routes>
              </div>
            </div>
          </div>
      } />
    </Routes>
  );
}