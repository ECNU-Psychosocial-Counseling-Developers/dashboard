import { useState, useEffect } from 'react';
import { Avatar } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import {
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ProfileOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { IconShakeHand } from '../icons';
import { useSelector } from 'react-redux';
import { IconCross } from '../icons';
import { setMessageRead, deleteConversation } from '../im';

const userToLink = {
  counselor: [
    { label: '首页', link: '', icon: <HomeOutlined /> },
    { label: '咨询记录', link: 'record', icon: <FileTextOutlined /> },
  ],
  supervisor: [
    { label: '首页', link: '', icon: <HomeOutlined /> },
    { label: '咨询记录', link: 'consult-record', icon: <FileTextOutlined /> },
    { label: '求助记录', link: 'ask-record', icon: <IconShakeHand /> },
  ],
  admin: [
    { label: '首页', link: '', icon: <HomeOutlined /> },
    { label: '咨询记录', link: 'consult-record', icon: <FileTextOutlined /> },
    { label: '排班表', link: 'calendar', icon: <CalendarOutlined /> },
    { label: '求助记录', link: 'help-record', icon: <ProfileOutlined /> },
    { label: '咨询师管理', link: 'counselor-manage', icon: <UserOutlined /> },
    { label: '访客管理', link: 'visitor-manage', icon: <TeamOutlined /> },
  ],
};

function NavMenu({ user, navigate }) {
  const menuItems = userToLink[user.role];
  return (
    <div>
      <ul>
        {menuItems.map(item => (
          <li key={item.label}>
            <button
              className="flex items-center text-left w-full px-6 py-3 gap-4  hover:bg-gray-700"
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
  const conversationList = useSelector(state => state.conversationList);
  const userID = useParams();
  // interface ChatList {
  //   name: string;
  //   avatarUrl: string;
  //   userID: string;
  //   unreadCount: number;
  //   conversationID: string;
  // }
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    const newChatList = conversationList.map(conversation => {
      return {
        userID: conversation.userProfile.userID,
        unreadCount: conversation.unreadCount,
        conversationID: conversation.conversationID,
      };
    });
    if (newChatList.length) {
      // TODO: ajax 请求获取聊天人信息, unreadCount conversation 获取
      // params: [userID1, userID2, ...]
      // res: [{name, ...}, {name, ...}, {name, ...}]

      const params = newChatList.map(item => item.userID);
      const res = Array.from({ length: newChatList.length }, () => ({
        name: '牡丹',
        avatarUrl: 'https://placekitten.com/g/100/100',
      }));
      Promise.resolve(res).then(res => {
        setChatList(() => {
          return newChatList.map((item, index) => ({
            ...item,
            name: res[index].name,
            avatarUrl: res[index].avatarUrl,
          }));
        });
      });
    }
  }, [conversationList]);

  const jumpToConversation = targetUserID => {
    if (userID === targetUserID) {
      return;
    }
    // 点击后与该用户的会话标记为已读
    setChatList(prevList => {
      const newList = [...prevList];
      const clickItemIndex = newList.findIndex(
        item => item.userID === targetUserID
      );
      const clickItem = newList[clickItemIndex];
      newList.splice(clickItemIndex, 1);
      newList.unshift({ ...clickItem, unreadCount: 0 });

      setMessageRead({ conversationID: clickItem.conversationID });
      sessionStorage.setItem('currentConversationID', clickItem.conversationID);
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
      navigate(`/conversation/${newChatList[0].userID}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div>
      <p className="px-6 py-4 text-xs">会话列表</p>
      <ul>
        {chatList.map((chatItem, index) => {
          return (
            <li className="relative flex items-center" key={index}>
              <button
                className="flex justify-between items-center w-full pl-6 pr-10 py-3 hover:bg-gray-700"
                onClick={() => jumpToConversation(chatItem.userID)}
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
                className="absolute right-2 flex justify-center items-center w-4 h-4 rounded-full opacity-0 hover:bg-gray-50 hover:opacity-70 hover:text-gray-900"
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

  const navigate = useNavigate();

  return (
    <aside className="w-48 flex-shrink-0 text-white bg-indigo-theme">
      <div className="flex justify-center items-center space-x-3 mt-5 mb-6">
        <Avatar size={64} src="https://placekitten.com/g/300/300" />
        <p className="text-gray-50">欢迎，{user.name}</p>
      </div>
      <NavMenu user={user} navigate={navigate} />
      <ChatMenu navigate={navigate} />
    </aside>
  );
}

export default SideBar;
