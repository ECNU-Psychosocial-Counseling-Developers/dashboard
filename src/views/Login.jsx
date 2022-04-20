import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import backgroundUrl from '../assets/background.png';
import { useDispatch } from 'react-redux';
import { login, getConversationList } from '../im';
import { Role } from '../enum';
import service from '../service';
import { UserResToUserInfo } from '../utils';

const secondUserID = import.meta.env.VITE_USER_ID;
if (secondUserID) {
  console.log('Use  second userID now:', secondUserID);
}

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = values => {
    console.log('login', values);
    // fake user info, same as defaultState
    // dispatch({
    //   type: 'user/login',
    //   payload: {
    //     name: secondUserID ? '春生' : '福贵',
    //     username: 'chunsheng',
    //     userId: secondUserID || '1',
    //     role: roleMap[values.username] ?? Role.counselor,
    //     avatarUrl: 'http://localhost:4000/src/assets/photo.webp',
    //   },
    // });

    service
      .login(values.username, values.password)
      .then(data => {
        let userInfo = data;
        if (data.role !== Role.admin) {
          userInfo = UserResToUserInfo(data);
        }
        dispatch({
          type: 'user/login',
          payload: userInfo,
        });
        if (data.role === Role.counselor || data.role === Role.supervisor) {
          console.log('TIM login, userId = %s', userInfo.userId);
          login(userInfo.userId.toString());
        }
        console.log({ data });
        navigate('/');
      })
      .catch(err => {
        console.error('login error', err);
        message.error('用户名或密码错误');
      });
  };

  return (
    <div
      className="h-screen flex justify-center items-center bg-no-repeat bg-cover"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <div className="w-96 -mt-20 py-8 px-12 bg-white rounded-lg bg-opacity-60 backdrop-blur-md">
        <p className="mb-8 text-center font-bold text-xl">
          社会心理服务热线平台
        </p>
        <Form
          colon={false}
          onFinish={handleLogin}
          onFinishFailed={errInfo => console.log(errInfo)}
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              placeholder="用户名"
              prefix={<UserOutlined className="mr-2.5" />}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              placeholder="密码"
              prefix={<LockOutlined className="mr-2.5" />}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full mt-3.5 h-10"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        <div className="mb-4 text-center text-xs">
          还没有创建账户？点击
          <Link to="/register" className="text-blue-600 hover:underline">
            注册
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
