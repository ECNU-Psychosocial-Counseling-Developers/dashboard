import { useState, useEffect } from 'react';
import { Table, Form, Input } from 'antd';
import { debounce, duration, weekNumberToCharacter } from '../../utils';
import dayjs from 'dayjs';

export default function UserManage() {
  const [tableData, setTableData] = useState([]);

  const handleSearchFromChange = (_, allValues) => {
    const { searchName } = allValues;
    console.log(searchName);
    // getTableData(1, 3, name, date);
  };

  const handlePageNumberChange = () => {
    setTableData(
      Array.from({ length: 10 }, (_, index) => ({
        name: `李白 ${index}`,
        role: '用户',
        gender: Math.random() > 0.5 ? 'male' : 'female',
        username: window.btoa(Math.random()),
        phoneNumber: (Math.random() * 10 ** 8).toFixed(0),
        emergencyContact: '杜甫' + index,
        emergencyContactPhone: (Math.random() * 10 ** 8).toFixed(0),
        lastConsultTime: Date.now(),
        status: Math.random() > 0.5 ? 'blocked' : 'normal',
      }))
    );
  };

  useEffect(() => {
    // TODO: 网络获取数据
    setTableData(
      Array.from({ length: 10 }, (_, index) => ({
        name: `李白 ${index}`,
        role: '用户',
        gender: Math.random() > 0.5 ? 'male' : 'female',
        username: window.btoa(Math.random()),
        phoneNumber: (Math.random() * 10 ** 8).toFixed(0),
        emergencyContact: '杜甫' + index,
        emergencyContactPhone: (Math.random() * 10 ** 8).toFixed(0),
        lastConsultTime: Date.now(),
        status: Math.random() > 0.5 ? 'blocked' : 'normal',
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
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: gender => (gender === 'male' ? '男' : '女'),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: username => (
        <div title={username} className="w-36 truncate">
          {username}
        </div>
      ),
    },
    {
      title: '联系电话',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: '紧急联系人',
      dataIndex: 'emergencyContact',
      key: 'emergencyContact',
    },
    {
      title: '紧急联系人电话',
      dataIndex: 'emergencyContactPhone',
      key: 'emergencyContactPhone',
    },
    {
      title: '身份',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '上次咨询时间',
      dataIndex: 'lastConsultTime',
      key: 'lastConsultTime',
      render: time => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: status => (status === 'blocked' ? '禁用' : '正常'),
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record) => (
        <>
          {record.status === 'blocked' ? (
            <button
              className="py-2 w-20 bg-green-theme text-gray-50 text-xs rounded-sm"
              onClick={() => {}}
            >
              解除禁用
            </button>
          ) : (
            <button
              className="py-2 w-20 bg-red-400 text-gray-50 text-xs rounded-sm"
              onClick={() => {}}
            >
              禁用
            </button>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="mx-4 my-2">
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

      {/* <CreatePersonModal
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
      /> */}
    </div>
  );
}
