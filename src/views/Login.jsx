import { Link } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import backgroundUrl from '../assets/background.png';

function Login() {

  const handleLogin = values => {
    console.log('login', values);
    // service.userLogin({
    //   username: values.username,
    //   password: values.password,
    // }).then(res => {
    //   console.log('login res:', res.data);
    //   dispatch({type: 'user/updateInfo', payload: res.data});
    // }).catch(() => {
    //   message.warning('用户名或密码错误');
    // })
  }

  return (
    <div
      className="h-screen flex justify-center items-center bg-no-repeat bg-cover"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <div className="w-96 -mt-20 py-8 px-12 bg-white rounded-lg">
        <p className="mb-8 text-center font-bold text-xl">社会心理服务热线平台</p>
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
            <Input placeholder="用户名" prefix={<UserOutlined className="mr-2.5" />} />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="密码" prefix={<LockOutlined className="mr-2.5" />} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full mt-3.5 h-10">登录</Button>
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
