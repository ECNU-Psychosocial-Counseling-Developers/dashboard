import { useState } from 'react';
import { Popover, Modal, Form, Input, message } from 'antd';
import IconLogout from '../icons/IconLogout';
import logoUrl from '../assets/logo.svg';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

function Header() {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const [form] = Form.useForm();

  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogout = () => {
    dispatch({ type: 'user/logout' });
    navigate('/login');
  };

  const handleChangePassword = ({
    prevPassword,
    newPassword,
    confirmNewPassword,
  }) => {
    // TODO: 调用修改密码接口
    console.log(prevPassword, newPassword, confirmNewPassword);
    if (newPassword !== confirmNewPassword) {
      message.warning('两次输入密码不一致');
      return;
    }
  };

  const passwordRules = [{ required: true, message: '必填信息' }];

  return (
    <header className="bg-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-12 h-12 flex justify-center items-center rounded-full bg-green-50">
          <img className="w-8" src={logoUrl} alt="logo" />
        </div>
        <p className="ml-6 my-0 text-lg">心理学院在线咨询</p>
      </div>
      <div className="mr-4">
        <Popover
          content={
            <ul>
              <li>
                <button
                  className="px-4 py-2 hover:bg-gray-50"
                  onClick={handleLogout}
                >
                  退出账户
                </button>
              </li>
              <li>
                <button
                  className="px-4 py-2 hover:bg-gray-50"
                  onClick={() => setPasswordVisible(true)}
                >
                  修改密码
                </button>
              </li>
            </ul>
          }
        >
          <IconLogout style={{ fontSize: 22 }} />
        </Popover>
      </div>
      <Modal
        width={400}
        title="修改密码"
        okText="确认"
        cancelText="取消"
        visible={passwordVisible}
        forceRender
        onOk={() => form.submit()}
        onCancel={() => setPasswordVisible(false)}
      >
        <Form
          form={form}
          style={{ padding: '0 30px' }}
          colon={false}
          onFinish={handleChangePassword}
        >
          <Form.Item name="prevPassword" rules={passwordRules}>
            <Input.Password visibilityToggle={false} placeholder="旧密码" />
          </Form.Item>
          <Form.Item name="newPassword" rules={passwordRules}>
            <Input.Password visibilityToggle={false} placeholder="新密码" />
          </Form.Item>
          <Form.Item name="confirmNewPassword" rules={passwordRules}>
            <Input.Password visibilityToggle={false} placeholder="确认新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </header>
  );
}

export default Header;
