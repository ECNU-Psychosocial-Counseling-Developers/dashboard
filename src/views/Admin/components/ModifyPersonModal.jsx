import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Radio, Tabs } from 'antd';
import { weekNumberToCharacter } from '../../../utils';
import RadioCardGroup from '../../../components/RadioCardGroup';
import FooterButtonGroup from './FooterButtonGroup';
import FormGridItem from './FormGridItem';

const { Option } = Select;

export default function CreatePersonModal(props) {
  const { visible, onSuccess, onCancel, type = 'consult', currentInfo } = props;
  const roleName = type === 'consult' ? '咨询师' : '督导';

  const [currentWorkingDay, setCurrentWorkingDay] = useState([]);
  const [candidateList, setCandidateList] = useState([]);

  const [form] = Form.useForm();

  const handleFinish = () => {
    form.validateFields().then(values => {
      console.log({ ...values, workingDay: currentWorkingDay });
      // TODO: 网络请求添加咨询师
      // onSuccess()
      // onCancel();
    });
  };

  useEffect(() => {
    // TODO: 网络获取待选取督导列表
    if (type === 'counselor') {
      setCandidateList(
        Array.from({ length: 10 }).map((_, index) => ({
          userID: index,
          name: `${roleName} ${index}`,
        }))
      );
    }
  }, [type]);

  useEffect(() => {
    if (type === 'supervisor') {
      form.setFieldsValue({
        name: currentInfo.name,
        boundSupervisor: currentInfo.boundSupervisor,
      });
    } else {
      form.setFieldsValue({ name: currentInfo.name });
    }
    setCurrentWorkingDay(currentInfo.workingDay);
  }, [currentInfo]);

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      footer={false}
      maskClosable={false}
      forceRender
    >
      <div className="px-8 py-3">
        <div className="mb-4">
          <h2 className="text-xl mb-1">修改{roleName}信息</h2>
          <p className="text-xs text-green-800">修改{roleName}个人信息</p>
        </div>
        <Form
          colon={false}
          form={form}
          initialValues={{ workingDay: ['1', '3', '7'], name: '不是' }}
        >
          <div className="flex-1 mb-4">
            <div className="flex gap-4">
              <FormGridItem
                label="姓名"
                name="name"
                render={<Input id="newName" placeholder="输入新的姓名" />}
              />
              {type === 'counselor' && (
                <FormGridItem
                  label="绑定督导"
                  name="boundSupervisor"
                  render={
                    <Select mode="multiple" id="modifyBoundSupervisor">
                      {candidateList.map(candidate => (
                        <Option key={candidate.userID} value={candidate.userID}>
                          {candidate.name}
                        </Option>
                      ))}
                    </Select>
                  }
                />
              )}
            </div>

            <div className="text-xs text-indigo-theme mt-5 mb-1">
              周值班安排
            </div>
            <RadioCardGroup
              name="supervisor"
              options={Array.from({ length: 7 }, (_, index) => ({
                value: index + 1,
                content: '周' + weekNumberToCharacter[index + 1],
              }))}
              className="grid grid-cols-4 gap-2 select-none mb-8"
              uncheckedClassName="flex items-center justify-center px-4 py-2 bg-gray-300 opacity-50 cursor-pointer"
              checkedClassName="flex items-center justify-center px-4 py-2 bg-indigo-theme text-gray-50 cursor-pointer"
              multiply
              initialValue={currentWorkingDay}
              onChange={val => setCurrentWorkingDay(val)}
            />
          </div>
        </Form>
        <FooterButtonGroup onCancel={onCancel} onOk={handleFinish} />
      </div>
    </Modal>
  );
}
