import { useEffect, useState } from 'react';
import { Modal, Avatar } from 'antd';
import RadioCardGroup from '../../../components/RadioCardGroup';

const mockSupervisorInfoList = [
  {
    name: '弗洛伊德',
    avatarUrl: 'https://placekitten.com/g/50/50',
    userID: '10',
  },
  {
    name: '柏拉图',
    avatarUrl: 'https://placekitten.com/g/50/50',
    userID: '11',
  },
  {
    name: '爱因斯坦',
    avatarUrl: 'https://placekitten.com/g/50/50',
    userID: '12',
  },
  {
    name: '哆啦A梦',
    avatarUrl: 'https://placekitten.com/g/50/50',
    userID: '13',
  },
];

export default function SelectSupervisorModal(props) {
  const { visible, onCancel, onSubmit } = props;

  const [value, setValue] = useState('');
  const [supervisorInfoList, setSupervisorInfoList] = useState([]);

  const handleSubmit = () => {
    if (value) {
      console.log('select supervisor', value);
      onSubmit(value);
    }
  };

  useEffect(() => {
    // TODO: 获取当前可以请求的督导
    setSupervisorInfoList(mockSupervisorInfoList);
  }, []);

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      title="选择要请求的督导"
      footer={false}
      width={400}
    >
      <div className="px-4">
        <RadioCardGroup
          name="supervisor"
          options={supervisorInfoList.map(info => ({
            value: info.userID,
            content: (
              <div className="flex items-center gap-3 px-4 py-2 mb-2 rounded border">
                <Avatar src={info.avatarUrl} />
                <p>{info.name}</p>
              </div>
            ),
          }))}
          onChange={val => setValue(val)}
          checkedClassName="block rounded cursor-pointer text-gray-50 bg-green-theme"
          unCheckedClassName="block rounded cursor-pointer"
        />
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            className="px-4 py-1 bg-green-theme rounded-sm text-gray-50 opacity-70"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            type="button"
            className="px-4 py-1 bg-green-theme rounded-sm text-gray-50"
            onClick={handleSubmit}
          >
            确认
          </button>
        </div>
      </div>
    </Modal>
  );
}
