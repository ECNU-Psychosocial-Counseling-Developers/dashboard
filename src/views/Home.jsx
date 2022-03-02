import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SideBar from '../components/SideBar';
import Header from '../components/Header';

function Home() {
  const navigate = useNavigate();
  const user = useSelector(state => state.user);

  useEffect(() => {
    if (!user.role) {
      navigate('/login');
    }
  }, [user]);

  return (
    <div>
      <SideBar />
      <main>
        <Header />
        <Outlet />
      </main>
    </div>
  );
}

export default Home;
