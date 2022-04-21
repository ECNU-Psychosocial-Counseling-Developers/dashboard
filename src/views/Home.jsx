import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import SideBar from '../components/SideBar';
import Header from '../components/Header';
import { timState, getConversationList } from '../im';

function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  const updateConversation = () => {
    getConversationList().then(res => {
      console.log('conversationList →', res);
      dispatch({
        type: 'conversation/get',
        payload: res.data.conversationList,
      });
    });
  };

  if (!timState.receiveCallback) {
    timState.receiveCallback = () => {
      updateConversation();
    };
  }

  useEffect(() => {
    if (!user.userId) {
      navigate('/login');
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (timState.isReady) {
        clearInterval(timer);
        updateConversation();
      }
    }, 50);
  }, [user.userId]);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <SideBar />
      <main className="flex-1">
        <Header />
        <Outlet />
      </main>
    </div>
  );
}

export default Home;
