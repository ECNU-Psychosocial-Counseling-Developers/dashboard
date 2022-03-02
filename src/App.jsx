import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NotFound from './views/NotFound';
import Register from './views/Register';
import Login from './views/Login';
import Home from './views/Home';

function App() {
  const user = useSelector(state => state.user);

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />}>
          {user.role === 'counselor' && (
            <>
              <Route index element={<div>counselor</div>} />
            </>
          )}
          {user.role === 'supervisor' && (
            <>
              <Route index element={<div>supervisor</div>} />
            </>
          )}
          {user.role === 'admin' && (
            <>
              <Route index element={<div>admin</div>} />
            </>
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

export default App
