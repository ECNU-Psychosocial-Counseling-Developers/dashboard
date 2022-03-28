import { useState, useEffect } from 'react';
import { Table, Form, Input } from 'antd';
import { debounce, duration, weekNumberToCharacter } from '../../utils';
import CreatePersonModal from './components/CreatePersonModal';
import ModifyPersonModal from './components/ModifyPersonModal';

export default function CounselorManage() {
  const [createPersonModalVisible, setCreatePersonModalVisible] =
    useState(false);
  const [modifyModalVisible, setModifyModalVisible] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [currentInfo, setCurrentInfo] = useState({
    name: '',
    role: 'supervisor',
    boundCounselor: [],
    supervisorSum: 0,
    duration: 1000,
    workingDay: [1, 2, 5],
  });

  const handleSearchFromChange = (_, allValues) => {
    const { searchName } = allValues;
    console.log(searchName);
    // getTableData(1, 3, name, date);
  };

  const handlePageNumberChange = () => {};

  const handleCreateNewCounselor = () => {};

  useEffect(() => {
    // TODO: 网络获取数据
    setTableData(
      Array.from({ length: 100 }, (_, index) => ({
        name: `督导 ${index}`,
        role: '督导',
        boundCounselor: ['咨询师 1', '咨询师 2'],
        supervisorSum: 12423,
        duration: Math.floor(Math.random() * 10000),
        workingDay: [2, 4, 7],
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
      title: '绑定咨询师',
      dataIndex: 'boundCounselor',
      key: 'boundCounselor',
      render: counselorList => (
        <div className="truncate" style={{ maxWidth: 200 }}>
          {counselorList.join(', ')}
        </div>
      ),
    },
    {
      title: '总督导次数',
      dataIndex: 'supervisorSum',
      key: 'supervisorSum',
    },
    {
      title: '督导总时长',
      dataIndex: 'duration',
      key: 'duration',
      render: seconds => duration(seconds),
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
            <Form.Item name="searchName">
              <Input placeholder="输入姓名进行搜索" />
            </Form.Item>
          </div>
        </Form>
        <button
          className="px-6 py-2 bg-green-theme text-gray-50 rounded-sm"
          onClick={() => setCreatePersonModalVisible(true)}
        >
          新增督导
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
          defaultPageSize: 15,
          showSizeChanger: false,
          onChange: handlePageNumberChange,
        }}
        dataSource={tableData}
      />

      <CreatePersonModal
        visible={createPersonModalVisible}
        onCancel={() => setCreatePersonModalVisible(false)}
        onSuccess={handleCreateNewCounselor}
        type="supervisor"
      />

      <ModifyPersonModal
        visible={modifyModalVisible}
        onCancel={() => setModifyModalVisible(false)}
        currentInfo={currentInfo}
        type="supervisor"
      />
    </div>
  );
}
