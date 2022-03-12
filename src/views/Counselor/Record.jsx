import { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Table } from 'antd';
import { debounce } from '../../utils';

import RecordTable from './RecordTable';
import service from '../../service';

export default function Record() {
  const [tableData, setTableData] = useState([]);
  const [total, setTotal] = useState(0);

  const getTableData = (pageNumber = 1, pageSize = 20, name = '', date) => {
    service
      .getCounselorRecord({
        pageNumber,
        pageSize,
        name,
        date,
      })
      .then(res => {
        console.log(res.data);
        setTableData(res.data.data);
        setTotal(res.data.total);
      });
  };

  const handleSearchFromChange = (_, allValues) => {
    const { name, date } = allValues;
    console.log(new Date(date._d).getTime());
    getTableData(1, 3, name, date);
  };

  const handlePageNumberChange = (pageNumber, pageSize) => {
    console.log(pageNumber, pageSize);
    getTableData(pageNumber, pageSize);
  };

  useEffect(() => {
    getTableData(1, 15);
  }, []);

  return (
    <div className="m-4">
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
        <div>
          <div className="mb-1 text-xs text-indigo-900">选择日期</div>
          <Form.Item name="date">
            <DatePicker placeholder="请选择日期" />
          </Form.Item>
        </div>
      </Form>
      <RecordTable
        className="mt-4 bg-white"
        pagination={{
          size: 'default',
          defaultCurrent: 1,
          total: total,
          defaultPageSize: 15,
          showSizeChanger: false,
          onChange: handlePageNumberChange,
        }}
        dataSource={tableData}
      />
    </div>
  );
}
