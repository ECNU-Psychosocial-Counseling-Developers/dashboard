import { useState, useEffect } from 'react';
import { Avatar, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import {
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ProfileOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { IconAppointment, IconShakeHand } from '../icons';
import { useDispatch, useSelector } from 'react-redux';
import { IconCross } from '../icons';
import { setMessageRead, deleteConversation } from '../im';
import { Role } from '../enum';
import service from '../service';
import { UserResToUserInfo } from '../utils';

const userToLink = {
  [Role.counselor]: [
    { label: '首页', link: '', icon: <HomeOutlined /> },
    { label: '预约记录', link: 'appointment', icon: <IconAppointment /> },
    { label: '咨询记录', link: 'record', icon: <FileTextOutlined /> },
  ],
  [Role.supervisor]: [
    { label: '首页', link: '', icon: <HomeOutlined /> },
    { label: '咨询记录', link: 'consult-record', icon: <FileTextOutlined /> },
    { label: '求助记录', link: 'ask-record', icon: <IconShakeHand /> },
  ],
  [Role.admin]: [
    { label: '首页', link: '', icon: <HomeOutlined /> },
    { label: '咨询记录', link: 'consult-record', icon: <FileTextOutlined /> },
    { label: '排班表', link: 'calendar', icon: <CalendarOutlined /> },
    { label: '咨询师管理', link: 'counselor-manage', icon: <UserOutlined /> },
    { label: '督导管理', link: 'supervisor-manage', icon: <ProfileOutlined /> },
    { label: '用户管理', link: 'user-manage', icon: <TeamOutlined /> },
  ],
};

function NavMenu({ user, navigate }) {
  const menuItems = userToLink[user.role];
  const activeLink = location.pathname.slice(1);

  const activeClassName = 'bg-gray-600';

  return (
    <div>
      <ul>
        {menuItems.map(item => (
          <li key={item.label}>
            <button
              className={
                'flex items-center text-left w-full px-6 py-3 gap-4  hover:bg-gray-700' +
                (activeLink === item.link ? ' ' + activeClassName : '')
              }
              onClick={() => {
                navigate(item.link);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChatMenu({ navigate }) {
  console.log('re render chat menu');

  const conversationList = useSelector(state => state.conversationList);
  const user = useSelector(state => state.user);
  const userId = useParams();
  // interface ChatList {
  //   name: string;
  //   avatarUrl: string;
  //   userId: string;
  //   unreadCount: number;
  //   conversationID: string;
  // }
  const [chatList, setChatListDebug] = useState([]);

  const setChatList = (...args) => {
    console.log('setChatList', ...args);
    setChatListDebug(...args);
  };

  useEffect(() => {
    console.log('side bar get conversation list', { conversationList });
    const expectedConversationID = localStorage.getItem(
      localStorage.getItem('currentConversationID')
    );
    const newChatList = conversationList
      .filter(
        conversation => conversation.conversationID !== expectedConversationID
      )
      .map(conversation => {
        return {
          userId: conversation.userProfile.userID,
          unreadCount: conversation.unreadCount,
          conversationID: conversation.conversationID,
        };
      });
    console.log({ newChatList }, newChatList.length);
    if (newChatList.length) {
      // default chat person list
      let res = Array.from({ length: newChatList.length }, (_, index) => ({
        name: newChatList[index].userId,
        avatarUrl: 'https://placekitten.com/g/100/100',
      }));
      if (user.role === Role.counselor) {
        Promise.all(
          newChatList.map(item => service.getCustomerInfo(item.userId))
        ).then(resArr => {
          console.log('resArr', { resArr });
          res = resArr.map(item => ({
            ...item.data.data,
            photo: item.data.data?.photo || 'https://placekitten.com/g/100/100',
          }));
          console.log('res', res);
          setChatList(() => {
            return newChatList.map((item, index) => ({
              ...item,
              name: res[index].name,
              avatarUrl: res[index].photo,
            }));
          });
        });
      } else if (user.role === Role.supervisor) {
        Promise.all(
          newChatList.map(item => service.getCounselorInfo(item.userId))
        ).then(resArr => {
          console.log('resArr', { resArr });
          res = resArr.map(item => ({
            ...item.data.data,
            photo: item.data.data.photo || 'https://placekitten.com/g/100/100',
          }));
          setChatList(() => {
            return newChatList.map((item, index) => ({
              ...item,
              name: res[index].name,
              avatarUrl: res[index].photo,
            }));
          });
        });
      }
    }
  }, [conversationList]);

  const jumpToConversation = targetUserID => {
    console.log('jump conversation', targetUserID);
    if (userId === targetUserID) {
      return;
    }
    // 点击后与该用户的会话标记为已读
    setChatList(prevList => {
      const newList = [...prevList];
      const clickItemIndex = newList.findIndex(
        item => item.userId === targetUserID
      );
      const clickItem = newList[clickItemIndex];
      newList.splice(clickItemIndex, 1);
      newList.unshift({ ...clickItem, unreadCount: 0 });

      setMessageRead({ conversationID: clickItem.conversationID });
      localStorage.setItem('currentConversationID', clickItem.conversationID);
      return newList;
    });

    // TODO: 更改为 base64 形式
    navigate(`/conversation/${targetUserID}`);
  };

  const handleDeleteConversation = conversationID => {
    deleteConversation(conversationID);
    const newChatList = chatList.filter(
      item => item.conversationID !== conversationID
    );
    setChatList(newChatList);
    if (newChatList.length) {
      navigate(`/conversation/${newChatList[0].userId}`);
    } else {
      navigate('/');
    }
  };

  console.log('render chat info', chatList);

  return (
    <div>
      <p className="px-6 py-4 text-xs">会话列表</p>
      <ul>
        {chatList.map((chatItem, index) => {
          return (
            <li className="relative flex items-center group" key={index}>
              <button
                className="flex justify-between items-center w-full pl-6 pr-10 py-3 hover:bg-gray-700"
                onClick={() => jumpToConversation(chatItem.userId)}
              >
                <div className="space-x-4">
                  <Avatar src={chatItem.avatarUrl} />
                  <span className="text-sm">{chatItem.name}</span>
                </div>
                {chatItem.unreadCount > 0 && (
                  <span className="rounded-full line-height square w-4 bg-red-500 text-xs">
                    {chatItem.unreadCount}
                  </span>
                )}
              </button>
              <button
                className="absolute right-2 flex justify-center items-center w-4 h-4 rounded-full opacity-0 group-hover:bg-gray-50 group-hover:opacity-70 group-hover:text-gray-900"
                onClick={() =>
                  handleDeleteConversation(chatItem.conversationID)
                }
              >
                <IconCross />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SideBar() {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const updateUserInfo = avatarUrl => {
    if (user.role === Role.counselor) {
      service
        .getCounselorInfo(user.userId)
        .then(res => {
          if (res.data.code !== 200) {
            return;
          }
          return res.data.data;
        })
        .then(userInfo => {
          const nextUserInfo = {
            ...userInfo,
            photo: avatarUrl,
          };
          return Promise.all([
            nextUserInfo,
            service.modifyCounselor(user.role, nextUserInfo),
          ]);
        })
        .then(([userInfo, res]) => {
          if (res.data.code !== 200) {
            return;
          }
          dispatch({
            type: 'user/update',
            payload: UserResToUserInfo(userInfo),
          });
        });
    } else if (user.role === Role.supervisor) {
      service
        .getSupervisorInfo(user.userId)
        .then(res => {
          if (res.data.code !== 200) {
            return;
          }
          return res.data.data;
        })
        .then(userInfo => {
          const nextUserInfo = {
            ...userInfo,
            photo: avatarUrl,
          };
          return Promise.all([
            nextUserInfo,
            service.modifyCounselor(user.role, nextUserInfo),
          ]);
        })
        .then(([userInfo, res]) => {
          if (res.data.code !== 200) {
            return;
          }
          dispatch({
            type: 'user/update',
            payload: UserResToUserInfo(userInfo),
          });
        });
    } else {
      message.info('仅咨询师和督导支持头像修改');
    }
  };

  const handleUploadAvatar = e => {
    const avatarFile = e.target.files[0];
    service.uploadImage(avatarFile).then(res => {
      if (res.data.code !== 200) {
        message.error('头像上传失败');
      }
      const avatarUrl = res.data.data;
      updateUserInfo(avatarUrl);
    });
  };

  console.log('side bar', user);

  return (
    <aside className="w-48 flex-shrink-0 text-white bg-indigo-theme">
      <div className="flex justify-center items-center space-x-3 mt-5 mb-6">
        <input
          className="hidden"
          type="file"
          name="avatar-input"
          id="avatar-upload"
          onChange={handleUploadAvatar}
        />
        <label htmlFor="avatar-upload" className={'cursor-pointer'}>
          <Avatar
            size={64}
            src={user.avatarUrl || 'https://placekitten.com/g/100/100'}
          />
        </label>
        <p className="text-gray-50">欢迎，{user.name ?? '管理员'}</p>
      </div>
      <NavMenu user={user} navigate={navigate} />
      {user.role !== Role.admin && <ChatMenu navigate={navigate} />}
    </aside>
  );
}

export default SideBar;
