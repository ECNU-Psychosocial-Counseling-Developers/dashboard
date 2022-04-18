import { useState, useEffect } from 'react';
import { Table, Form, Input, message } from 'antd';
import { debounce } from '../../utils';
import service from '../../service';
import { Role } from '../../enum';

export default function UserManage() {
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState([]);

  const getTableData = (pageNumber = 1, pageSize = 10, name) => {
    service
      .getCustomerList({
        pageNumber,
        pageSize,
        name,
      })
      .then(res => {
        if (res.data.code !== 200) {
          message.error('获取失败');
          return;
        }
        setTableData(res.data.data.customerList);
        setTotalCount(res.data.data.totalCount);
      });
  };

  const handleSearchFromChange = (_, allValues) => {
    const { searchName } = allValues;
    getTableData(1, 3, searchName);
  };

  const handlePageNumberChange = (pageNumber, pageSize) => {
    getTableData(pageNumber, pageSize);
  };

  const toggleBlack = person => {
    const successCallback = () => getTableData(1, 10);
    if (person.black) {
      service.unblackCustomer(person.id).then(res => {
        if (res.data.code !== 200) {
          message.error('解除禁用失败');
        }
        message.success('解除禁用成功');
        successCallback();
      });
    } else {
      service.blackCustomer(person.id).then(res => {
        if (res.data.code !== 200) {
          message.error('禁用失败');
        }
        message.success('禁用成功');
        successCallback();
      });
    }
  };

  useEffect(() => {
    getTableData(1, 10);
  }, []);

  const tableColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '电子邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '紧急联系人',
      dataIndex: 'contactName',
      key: 'contactName',
    },
    {
      title: '紧急联系人电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
    },
    {
      title: '身份',
      dataIndex: 'role',
      key: 'role',
      render: role => (role === Role.customer ? '用户' : '咨询师'),
    },
    {
      title: '状态',
      dataIndex: 'black',
      key: 'black',
      render: status => (status ? '禁用' : '正常'),
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record) => (
        <>
          {record.black ? (
            <button
              className="py-2 w-20 bg-green-theme text-gray-50 text-xs rounded-sm"
              onClick={() => toggleBlack(record)}
            >
              解除禁用
            </button>
          ) : (
            <button
              className="py-2 w-20 bg-red-400 text-gray-50 text-xs rounded-sm"
              onClick={() => toggleBlack(record)}
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
          total: totalCount,
          defaultPageSize: 10,
          showSizeChanger: false,
          onChange: handlePageNumberChange,
        }}
        dataSource={tableData}
      />
    </div>
  );
}
