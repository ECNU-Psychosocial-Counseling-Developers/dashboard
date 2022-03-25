import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NotFound from './views/NotFound';
import Register from './views/Register';
import Login from './views/Login';
import Home from './views/Home';
import CounselorDashboard from './views/Counselor/Dashboard';
import CounselorRecord from './views/Counselor/Record';
import CounselorConversation from './views/Conversation/CounselorConversation';
import SupervisorDashboard from './views/Supervisor/Dashboard';
import SupervisorConsultRecord from './views/Supervisor/ConsultRecord';
import SupervisorAskRecord from './views/Supervisor/AskRecord';
import SupervisorConversation from './views/Conversation/SupervisorConversation';
import AdminDashboard from './views/Admin/Dashboard';

function App() {
  const user = useSelector(state => state.user);

  const conversation = () => {
    if (user.role === 'counselor') {
      return <CounselorConversation />;
    } else if (user.role === 'supervisor') {
      return <SupervisorConversation />;
    } else if (user.role === 'admin') {
      return <div>null</div>;
    }
  };

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />}>
          {user.role === 'counselor' && (
            <>
              <Route index element={<CounselorDashboard />} />
              <Route path="record" element={<CounselorRecord />} />
            </>
          )}
          {user.role === 'supervisor' && (
            <>
              <Route index element={<SupervisorDashboard />} />
              <Route
                path="consult-record"
                element={<SupervisorConsultRecord />}
              />
              <Route path="ask-record" element={<SupervisorAskRecord />} />
            </>
          )}
          {user.role === 'admin' && (
            <>
              <Route index element={<AdminDashboard />} />
            </>
          )}
          <Route path="/conversation/:userID" element={conversation()} />
        </Route>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="404" replace />} />
      </Routes>
    </div>
  );
}

export default App;
