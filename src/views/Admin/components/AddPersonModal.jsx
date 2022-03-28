import { useState, useEffect } from 'react';
import { Modal, Select } from 'antd';

const { Option } = Select;

export default function AddPersonModal(props) {
  const { visible, onFinish, onCancel, type = 'counselor' } = props;

  const [value, setValue] = useState('');
  const [peopleList, setPeopleList] = useState([]);

  const typeText = type === 'counselor' ? '咨询师' : '督导';

  useEffect(() => {
    // 查询咨询师或督导
    Promise.resolve().then(() => {
      setPeopleList(
        Array.from({ length: 10 }, (_, index) => ({
          name: typeText + ' ' + index,
          userID: index,
        }))
      );
    });
  }, [type]);

  return (
    <Modal visible={visible} footer={false} onCancel={onCancel} width={450}>
      <div className="px-6 py-5">
        <h2 className="text-xl mb-1">添加{typeText}</h2>
        <p className="text-xs text-green-700">为选中日期添加值班{typeText}</p>
        <div className="mt-5 mb-8">
          <p className="text-xs mb-1">搜索{typeText}</p>
          <Select
            className="w-full"
            showSearch
            filterOption={(inputValue, option) =>
              option.children.indexOf(inputValue) >= 0
            }
            value={value}
            onChange={val => setValue(val)}
          >
            {peopleList.map((people, index) => (
              <Option key={index} value={people.userID}>
                {people.name}
              </Option>
            ))}
          </Select>
        </div>
        <div className="flex justify-end gap-3">
          <button
            className="px-8 py-1.5 bg-green-theme bg-opacity-50 text-green-800"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className="px-8 py-1.5 bg-green-theme text-gray-50"
            onClick={() => onFinish(value)}
          >
            确认
          </button>
        </div>
      </div>
    </Modal>
  );
}
