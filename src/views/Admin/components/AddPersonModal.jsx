import { useState, useEffect } from 'react';
import { Modal, Form, Select, TimePicker } from 'antd';
import service from '../../../service';
import dayjs from 'dayjs';
import { Role } from '../../../enum';

const { Option } = Select;

export default function AddPersonModal(props) {
  const {
    visible,
    onFinish,
    onCancel,
    type = 'counselor',
    className,
    date,
  } = props;

  const [peopleList, setPeopleList] = useState([]);

  const typeText = type === 'counselor' ? '咨询师' : '督导';
  const dutyDay = dayjs().date(date).day() ? dayjs().date(date).day() : 7;

  const [form] = Form.useForm();

  const handleConfirm = () => {
    form.validateFields().then(values => {
      const requestPayload = {
        counselorId: values.userId,
        dutyDay,
        role: type === 'counselor' ? Role.counselor : Role.supervisor,
        startTime: dayjs(values.time[0]._d).format('HH:mm:ss'),
        endTime: dayjs(values.time[1]._d).format('HH:mm:ss'),
      };
      onFinish(requestPayload);
      setTimeout(() => {
        form.resetFields();
      }, 100);
    });
  };

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (type === 'counselor') {
      service.getOffDutyCounselor(dutyDay).then(res => {
        setPeopleList(res.data.data.counselorList);
      });
    } else {
      service.getOffDutySupervisor(dutyDay).then(res => {
        setPeopleList(res.data.data.counselorList);
      });
    }
  }, [visible]);

  return (
    <Modal
      className={className}
      visible={visible}
      footer={false}
      onCancel={onCancel}
      width={450}
      forceRender
    >
      <div className="px-6 py-5">
        <h2 className="text-xl mb-1">添加{typeText}</h2>
        <p className="text-xs text-green-700">为选中日期添加值班{typeText}</p>
        <Form colon={false} form={form}>
          <div className="mt-5">
            <p className="text-xs mb-1">搜索{typeText}</p>
            <Form.Item
              name="userId"
              style={{ marginBottom: 0 }}
              rules={[{ required: true, message: '请选择值班用户' }]}
            >
              <Select
                className="w-full"
                showSearch
                filterOption={(inputValue, option) =>
                  option.children.indexOf(inputValue) >= 0
                }
              >
                {peopleList.map(people => (
                  <Option key={people.id} value={people.id}>
                    {people.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div className="mt-5 mb-8">
            <p className="text-xs mb-1">选择值班时间段</p>
            <Form.Item name="time" style={{ marginBottom: 0 }}>
              <TimePicker.RangePicker
                className="w-full"
                placeholder={['值班开始时间', '值班结束时间']}
              />
            </Form.Item>
          </div>
        </Form>
        <div className="flex justify-end gap-3">
          <button
            className="px-8 py-1.5 bg-green-theme bg-opacity-50 text-green-800"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className="px-8 py-1.5 bg-green-theme text-gray-50"
            onClick={handleConfirm}
          >
            确认
          </button>
        </div>
      </div>
    </Modal>
  );
}
