import { useState, useEffect } from 'react';
import { Table, Form, Input, Rate } from 'antd';
import {
  debounce,
  duration,
  roundSemi,
  weekNumberToCharacter,
} from '../../utils';
import CreatePersonModal from './components/CreatePersonModal';
import ModifyPersonModal from './components/ModifyPersonModal';
import { Role } from '../../enum';

export default function CounselorManage() {
  const [createPersonModalVisible, setCreatePersonModalVisible] =
    useState(false);
  const [modifyModalVisible, setModifyModalVisible] = useState(false);
  const [tableData, setTableData] = useState([]);

  // TODO: 这里的role 字段正确吗
  const [currentInfo, setCurrentInfo] = useState({
    name: '',
    role: Role.counselor,
    boundSupervisor: [],
    counselorSum: 0,
    duration: 1000,
    averageRate: 3,
    workingDay: [1, 2, 5],
  });

  const handleSearchFromChange = (_, allValues) => {
    const { name } = allValues;
    console.log(name);
    // getTableData(1, 3, name, date);
  };

  const handlePageNumberChange = () => {};

  const handleCreateNewCounselor = () => {};

  useEffect(() => {
    // TODO: 网络获取数据
    setTableData(
      Array.from({ length: 100 }, (_, index) => ({
        name: `姓名${index}`,
        role: '咨询师',
        boundSupervisor: ['督导1', '督导2'],
        consultSum: 12423,
        duration: Math.floor(Math.random() * 10000),
        averageRate: Math.random() * 5 + 1,
        workingDay: [1, 2, 4, 5],
      }))
    );
  }, []);

  const tableColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '身份',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '绑定督导',
      dataIndex: 'boundSupervisor',
      key: 'boundSupervisor',
      render: supervisorList => (
        <div className="truncate" style={{ maxWidth: 200 }}>
          {supervisorList.join(', ')}
        </div>
      ),
    },
    {
      title: '总咨询数',
      dataIndex: 'consultSum',
      key: 'consultSum',
    },
    {
      title: '咨询总时长',
      dataIndex: 'duration',
      key: 'duration',
      render: seconds => duration(seconds),
    },
    {
      title: '平均咨询评级',
      dataIndex: 'averageRate',
      key: 'averageRate',
      render: rate => (
        <Rate disabled defaultValue={roundSemi(rate)} allowHalf />
      ),
    },
    {
      title: '周值班安排',
      dataIndex: 'workingDay',
      key: 'workingDay',
      render: dayList =>
        dayList.map(day => `周${weekNumberToCharacter[day]}`).join(', '),
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record) => (
        <button
          className="px-6 py-2 bg-green-theme text-gray-50 text-xs rounded-sm"
          onClick={() => {
            setCurrentInfo(record);
            setModifyModalVisible(true);
          }}
        >
          修改
        </button>
      ),
    },
  ];

  return (
    <div className="mx-4 my-2">
      <div className="flex justify-between items-center">
        <Form
          layout="inline"
          colon={false}
          onValuesChange={debounce(handleSearchFromChange, 500)}
        >
          <div>
            <div className="mb-1 text-xs text-indigo-900">搜索姓名</div>
            <Form.Item name="name">
              <Input placeholder="输入姓名进行搜索" />
            </Form.Item>
          </div>
        </Form>
        <button
          className="px-6 py-2 bg-green-theme text-gray-50 rounded-sm"
          onClick={() => setCreatePersonModalVisible(true)}
        >
          新增咨询师
        </button>
      </div>
      <Table
        className="mt-2"
        rowKey={record => record.name + record.duration}
        size="small"
        columns={tableColumns}
        pagination={{
          size: 'default',
          defaultCurrent: 1,
          total: 100,
          defaultPageSize: 10,
          showSizeChanger: false,
          onChange: handlePageNumberChange,
        }}
        dataSource={tableData}
      />

      <CreatePersonModal
        visible={createPersonModalVisible}
        onCancel={() => setCreatePersonModalVisible(false)}
        onSuccess={handleCreateNewCounselor}
        type="counselor"
      />

      <ModifyPersonModal
        visible={modifyModalVisible}
        onCancel={() => setModifyModalVisible(false)}
        currentInfo={currentInfo}
        type="counselor"
      />
    </div>
  );
}
