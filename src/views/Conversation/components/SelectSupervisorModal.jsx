import { useEffect, useState } from 'react';
import { Modal, Avatar } from 'antd';
import RadioCardGroup from '../../../components/RadioCardGroup';
import service from '../../../service';

export default function SelectSupervisorModal(props) {
  const { visible, onCancel, onSubmit } = props;

  const [value, setValue] = useState('');
  const [supervisorInfoList, setSupervisorInfoList] = useState([]);

  const handleSubmit = () => {
    if (value) {
      onSubmit(value);
    }
  };

  useEffect(() => {
    if (visible) {
      service.getOnlineSupervisor().then(res => {
        // TODO: photo url replace
        const supervisorList = res.data.data.counselorList.map(info => ({
          ...info,
          photo: 'https://placekitten.com/g/50/50',
        }));
        setSupervisorInfoList(supervisorList);
      });
    }
  }, [visible]);

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
            value: info.id,
            content: (
              <div className="flex items-center gap-3 px-4 py-2 mb-2 rounded border">
                <Avatar src={info.photo} />
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
