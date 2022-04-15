import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Radio, Tabs } from 'antd';
import FormGridItem from './FormGridItem';
import FooterButtonGroup from './FooterButtonGroup';

const { TabPane } = Tabs;
const { Option } = Select;

export default function CreatePersonModal(props) {
  const { visible, onSuccess, onCancel, type = 'consult' } = props;
  const roleName = type === 'consult' ? '咨询师' : '督导';

  const [form] = Form.useForm();

  const [activeKey, setActiveKey] = useState('person');
  const [candidateList, setCandidateList] = useState([]);

  const handleFinish = () => {
    form.validateFields().then(values => {
      console.log('new counselor', values);
      // TODO: 网络请求添加咨询师
      // onSuccess()
      onCancel();
      setTimeout(() => {
        form.resetFields();
        setActiveKey('person');
      }, 100);
    });
  };

  useEffect(() => {
    // TODO: 网络获取待选取督导列表
    if (type === 'counselor') {
      setCandidateList(
        Array.from({ length: 10 }).map((_, index) => ({
          userId: index,
          name: `${roleName} ${index}`,
        }))
      );
    }
  }, [type]);

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      footer={false}
      maskClosable={false}
      forceRender
    >
      <div className="px-6">
        <div className="mb-4">
          <h2 className="text-xl mb-1">添加{roleName}</h2>
          <p className="text-xs text-green-800">
            添加{roleName}并添加其个人信息
          </p>
        </div>
        <Form colon={false} form={form}>
          <Tabs
            size="small"
            activeKey={activeKey}
            onChange={key => setActiveKey(key)}
          >
            <TabPane tab="个人信息" key="person">
              <div className="flex gap-4">
                <FormGridItem
                  label="姓名"
                  name="name"
                  render={<Input id="createNewName" placeholder="请输入姓名" />}
                  rules={[
                    {
                      pattern: /^[\u4e00-\u9fa5]{2,5}$/,
                      message: '请输入正确的姓名',
                    },
                  ]}
                />
                <FormGridItem
                  label="性别"
                  name="gender"
                  render={
                    <Radio.Group>
                      <Radio value="male">男</Radio>
                      <Radio value="female">女</Radio>
                    </Radio.Group>
                  }
                />
              </div>
              <div className="flex gap-4">
                <FormGridItem
                  label="年龄"
                  name="age"
                  render={<Input placeholder="请输入年龄" />}
                  rules={[
                    { pattern: /^\d+$/, message: '请输入正确格式的年龄' },
                  ]}
                />
                <FormGridItem
                  label="身份证号码"
                  name="IDNumber"
                  render={<Input placeholder="请输入身份证号码" />}
                  rules={[
                    {
                      pattern: /^\d{17}(\d|X)$/,
                      message: '请输入18位身份证号码',
                    },
                  ]}
                />
              </div>
              <div className="flex gap-4">
                <FormGridItem
                  label="电话"
                  name="phoneNumber"
                  render={<Input placeholder="请输入联系电话" />}
                  rules={[
                    {
                      pattern: /^1[3456789]\d{9}$/,
                      message: '请输入正确的电话号码',
                    },
                  ]}
                />
                <FormGridItem
                  label="邮箱"
                  name="email"
                  render={<Input placeholder="请输入邮箱地址" />}
                  rules={[{ type: 'email', message: '不是合法的电子邮箱地址' }]}
                />
              </div>
              {type === 'counselor' && (
                <div>
                  <div className="text-xs text-indigo-theme mb-1">绑定督导</div>
                  <Form.Item name="boundSupervisor">
                    <Select mode="multiple" id="createBoundSupervisor">
                      {candidateList.map(candidate => (
                        <Option key={candidate.userId} value={candidate.userId}>
                          {candidate.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              )}
              <FooterButtonGroup
                onCancel={onCancel}
                onOk={() => setActiveKey('work')}
              />
            </TabPane>
            <TabPane tab="工作信息" key="work">
              <div className="flex gap-4">
                <FormGridItem
                  label="用户名"
                  name="username"
                  render={<Input placeholder="请输入用户名" />}
                  rules={[
                    {
                      pattern: /^[a-zA-Z0-9_]{6,16}$/,
                      message: '请输入6-16位用户名, 仅允许使用字母和下划线',
                    },
                  ]}
                />
                <FormGridItem
                  label="密码"
                  name="password"
                  render={<Input.Password placeholder="请输入密码" />}
                  rules={[
                    {
                      pattern: /^[a-zA-Z0-9_\.,\?!@#$%^&\*\(\)]{6,16}$/,
                      message: '请输入6-16位密码',
                    },
                  ]}
                />
              </div>
              <div className="flex gap-4">
                <FormGridItem
                  label="工作单位"
                  name="department"
                  render={<Input placeholder="请输入工作单位" />}
                />
                <FormGridItem
                  label="职称"
                  name="title"
                  render={<Input placeholder="请输入个人职称" />}
                />
              </div>
              {type === 'supervisor' && (
                <div className="flex gap-4">
                  <FormGridItem
                    label="督导资质"
                    name="qualification"
                    render={
                      <Select placeholder="请选择督导资质">
                        {['初级', '中级', '高级'].map(
                          (qualification, index) => (
                            <Option key={index} value={qualification}>
                              {qualification}
                            </Option>
                          )
                        )}
                      </Select>
                    }
                  />
                  <FormGridItem
                    label="资质编号"
                    name="qualificationNumber"
                    render={<Input placeholder="请输入资质编号" />}
                  />
                </div>
              )}
              <FooterButtonGroup onCancel={onCancel} onOk={handleFinish} />
            </TabPane>
          </Tabs>
        </Form>
      </div>
    </Modal>
  );
}
