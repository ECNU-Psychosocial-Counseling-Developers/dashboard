import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NotFound from './views/NotFound';
import Register from './views/Register';
import Login from './views/Login';
import Home from './views/Home';
import CounselorDashboard from './views/Counselor/Dashboard';
import CounselorRecord from './views/Counselor/Record';
import CounselorAppointment from './views/Counselor/Appointment';
import CounselorConversation from './views/Conversation/CounselorConversation';
import SupervisorDashboard from './views/Supervisor/Dashboard';
import SupervisorConsultRecord from './views/Supervisor/ConsultRecord';
import SupervisorAskRecord from './views/Supervisor/AskRecord';
import SupervisorConversation from './views/Conversation/SupervisorConversation';
import AdminDashboard from './views/Admin/Dashboard';
import AdminConsultRecord from './views/Admin/ConsultRecord';
import AdminCalendar from './views/Admin/Calendar';
import AdminSupervisorManage from './views/Admin/SupervisorManage';
import AdminCounselorManage from './views/Admin/CounselorManage';
import AdminUserManage from './views/Admin/UserManage';
import { Role } from './enum';

function App() {
  const user = useSelector(state => state.user);

  const conversation = () => {
    if (user.role === Role.counselor) {
      return <CounselorConversation />;
    } else if (user.role === Role.supervisor) {
      return <SupervisorConversation />;
    } else if (user.role === Role.admin) {
      return <div>null</div>;
    }
  };

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />}>
          {user.role === Role.counselor && (
            <>
              <Route index element={<CounselorDashboard />} />
              <Route path="appointment" element={<CounselorAppointment />} />
              <Route path="record" element={<CounselorRecord />} />
            </>
          )}
          {user.role === Role.supervisor && (
            <>
              <Route index element={<SupervisorDashboard />} />
              <Route
                path="consult-record"
                element={<SupervisorConsultRecord />}
              />
              <Route path="ask-record" element={<SupervisorAskRecord />} />
            </>
          )}
          {user.role === Role.admin && (
            <>
              <Route index element={<AdminDashboard />} />
              <Route path="consult-record" element={<AdminConsultRecord />} />
              <Route path="calendar" element={<AdminCalendar />} />
              <Route
                path="counselor-manage"
                element={<AdminCounselorManage />}
              />
              <Route
                path="supervisor-manage"
                element={<AdminSupervisorManage />}
              />
              <Route path="user-manage" element={<AdminUserManage />} />
            </>
          )}
          {user.role !== Role.admin && (
            <Route path="/conversation/:userId" element={conversation()} />
          )}
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
