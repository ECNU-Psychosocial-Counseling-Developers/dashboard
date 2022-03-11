import { useState } from 'react';
import { Form, Input, DatePicker, Table } from 'antd';
import { debounce } from '../../utils';

import RecordTable from './RecordTable';

const fakeTableDate = [

];

export default function Record() {
  const [tableDate, setTableDate] = useState(fakeTableDate);

  const [form] = Form.useForm();

  const getTableData = (_, allValues) => {
    console.log('get new data by:', allValues);
    // 
  };

  return (
    <div className="m-4">
      <Form layout="inline" colon={false} onValuesChange={debounce(getTableData, 500)}>
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
        pagination={{ size: 'default', defaultCurrent: 1, total: 100, defaultPageSize: 20, showSizeChanger: false }}
      />
    </div>
  );
}
