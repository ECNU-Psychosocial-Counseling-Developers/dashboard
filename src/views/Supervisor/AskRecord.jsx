import { useState, useEffect } from 'react';
import { Input, Form, DatePicker } from 'antd';
import RecordTable from '../../components/RecordTable';
import { debounce } from '../../utils';
import service from '../../service';

const { RangePicker } = DatePicker;

export default function AskRecord() {
  const [tableData, setTableData] = useState([]);
  const [total, setTotal] = useState(0);

  const getTableData = (
    pageNumber = 1,
    pageSize = 20,
    name = '',
    startTime,
    endTime
  ) => {
    // service
    //   .getCounselorRecord({
    //     pageNumber,
    //     pageSize,
    //     name,
    //     date,
    //   })
    //   .then(res => {
    //     console.log(res.data);
    //     setTableData(res.data.data);
    //     setTotal(res.data.total);
    //   });
  };

  const handleSearchFromChange = (_, allValues) => {
    const { name, date } = allValues;
    console.log(name, date[0]._d.getTime(), date[1]._d.getTime());
    // console.log(new Date(date._d).getTime());
    // getTableData(1, 3, name, date);
  };

  const handlePageNumberChange = (pageNumber, pageSize) => {
    console.log(pageNumber, pageSize);
    getTableData(pageNumber, pageSize);
  };

  const handleBatchExportRecord = () => {
    console.log('批量导出');
  };

  useEffect(() => {
    getTableData(1, 15);
  }, []);

  return (
    <div className="m-4">
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
        <button
          className="px-3 py-1 bg-green-theme text-gray-50 rounded-sm"
          onClick={handleBatchExportRecord}
        >
          批量导出求助记录
        </button>
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
      />
    </div>
  );
}
