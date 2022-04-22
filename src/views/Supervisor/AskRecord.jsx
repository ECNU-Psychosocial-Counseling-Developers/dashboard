import { useState, useEffect, useRef } from 'react';
import { Input, Form, DatePicker } from 'antd';
import RecordTable from '../../components/RecordTable';
import { consultResponseToTableRow, debounce } from '../../utils';
import service from '../../service';
import { useSelector } from 'react-redux';

const { RangePicker } = DatePicker;

export default function AskRecord() {
  const user = useSelector(state => state.user);

  const formValuesRef = useRef({
    name: undefined,
    startTime: undefined,
    endTime: undefined,
  });

  const [tableData, setTableData] = useState([]);
  const [total, setTotal] = useState(0);

  const getTableData = (pageNumber = 1, pageSize = 20) => {
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
      startTime: date?.at(0)._d.setHours(0, 0, 0),
      endTime: date?.at(1)._d.setHours(23, 59, 59),
    };
    getTableData();
  };

  const handlePageNumberChange = (pageNumber, pageSize) => {
    getTableData(pageNumber, pageSize);
  };

  const handleBatchExportRecord = () => {
    console.log('批量导出');
  };

  useEffect(() => {
    getTableData(1, 15);
  }, []);

  return (
    <div className="relative m-4">
      <div className="flex justify-between items-end">
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
              <RangePicker placeholder={['选择开始日期', '选择结束日期']} />
            </Form.Item>
          </div>
        </Form>
      </div>
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
        type="session"
      />
    </div>
  );
}
