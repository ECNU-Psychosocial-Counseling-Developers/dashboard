import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Form, Input, DatePicker } from 'antd';
import { consultResponseToTableRow, debounce } from '../../utils';
import RecordTable from '../../components/RecordTable';
import service from '../../service';

export default function Record() {
  const user = useSelector(state => state.user);

  const formValuesRef = useRef({ name: undefined, date: undefined });

  const [tableData, setTableData] = useState([]);
  const [total, setTotal] = useState(0);

  const getTableData = (pageNumber = 1, pageSize = 15) => {
    service
      .getCounselorRecord({
        pageNumber,
        pageSize,
        userId: user.userId,
        ...formValuesRef.current,
      })
      .then(res => {
        setTableData(consultResponseToTableRow(res));
        setTotal(res.data.data.total);
      });
  };

  const handleSearchFromChange = (_, allValues) => {
    const { name, date } = allValues;
    formValuesRef.current = {
      name,
      startTime: date?._d.setHours(0, 0, 0),
      endTime: date?._d.setHours(23, 59, 59),
    };
    getTableData();
  };

  const handlePageNumberChange = (pageNumber, pageSize) => {
    getTableData(pageNumber, pageSize);
  };

  useEffect(() => {
    getTableData(1, 15);
  }, []);

  return (
    <div className="relative m-4">
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
