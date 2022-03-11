import { Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ProfileOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';

const userToLink = {
  counselor: [
    { label: '首页', link: '', icon: <HomeOutlined /> },
    { label: '咨询记录', link: 'record', icon: <FileTextOutlined /> },
  ],
  supervisor: [
    { label: '首页', link: '', icon: <HomeOutlined /> },
    { label: '会话记录', link: 'record', icon: <FileTextOutlined /> },
  ],
  admin: [
    { label: '首页', link: '', icon: <HomeOutlined /> },
    { label: '咨询记录', link: 'consult-record', icon: <FileTextOutlined /> },
    { label: '排班表', link: 'calendar', icon: <CalendarOutlined /> },
    { label: '求助记录', link: 'help-record', icon: <ProfileOutlined /> },
    { label: '咨询师管理', link: 'counselor-manage', icon: <UserOutlined /> },
    { label: '访客管理', link: 'visitor-manage', icon: <TeamOutlined /> },
  ]
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
              onClick={() => { navigate(item.link) }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ChatMenu({ user, navigate }) {
  // TODO: 网络获取正在聊天的对象
  const onlinePerson = [
    { avatarUrl: 'http://localhost:4000/src/assets/photo.webp', name: '刘亦菲', messageNumber: 0 },
    { avatarUrl: 'https://placekitten.com/g/200/200', name: '小猫🐱', messageNumber: 2 },
  ];
  return (
    <div>
      <p className="px-6 py-4 text-xs">会话列表</p>
      <ul>
        {onlinePerson.map(person => (
          <li key={person.name}>
            <button className="flex justify-between items-center w-full pl-6 pr-4 py-3 hover:bg-gray-700">
              <div className="space-x-4">
                <Avatar src={person.avatarUrl} />
                <span className="text-sm">{person.name}</span>
              </div>
              {person.messageNumber > 0 &&
                <span className="rounded-full line-height square w-4 bg-red-500 text-xs">{person.messageNumber}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SideBar() {
  const user = useSelector(state => state.user);

  const navigate = useNavigate();

  return (
    <aside className="w-48 text-white" style={{ background: 'var(--side-bg)' }}>
      <div className="flex justify-center items-center space-x-3 mt-5 mb-6">
        <Avatar size={64} src="https://placekitten.com/g/300/300" />
        <p className="text-gray-50">欢迎，咨询师</p>
      </div>
      <NavMenu user={user} navigate={navigate} />
      <ChatMenu user={user} navigate={navigate} />
    </aside>
  );
}

export default SideBar;
