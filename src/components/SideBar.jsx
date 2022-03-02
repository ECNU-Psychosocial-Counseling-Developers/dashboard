import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

function SideBar(props) {
  const { children } = props;

  return (
    <aside>
      <div>
        <Avatar size={64} icon={<UserOutlined />} />
        <p>欢迎，咨询师</p>
      </div>
      { children }
    </aside>
  );
}

export default SideBar;
