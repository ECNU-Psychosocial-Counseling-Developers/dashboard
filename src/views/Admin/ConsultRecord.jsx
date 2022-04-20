import { useState, useEffect } from 'react';
import { Input, Form, DatePicker } from 'antd';
import AllConsultRecordTable from '../../components/AllConsultRecordTable';
import { debounce, allConsultResponseToTableRow } from '../../utils';
import service from '../../service';
import dayjs from 'dayjs';

export default function ConsultRecord() {
  const [tableData, setTableData] = useState([]);
  const [total, setTotal] = useState(0);

  const getTableData = (
    pageNumber = 1,
    pageSize = 10,
    name,
    startTime,
    endTime
  ) => {
    service
      .getAllConsultRecord({
        pageNumber,
        pageSize,
        name,
        startTime,
        endTime,
      })
      .then(res => {
        console.log(res);
        setTableData(allConsultResponseToTableRow(res));
        setTotal(res.data.data.total);
      });
  };

  const handleSearchFromChange = (_, allValues) => {
    const { name, date } = allValues;
    console.log({ date });
    getTableData(
      1,
      10,
      name,
      date ? dayjs(date._d).startOf('day').valueOf() : undefined,
      date ? dayjs(date._d).endOf('day').valueOf() : undefined
    );
  };

  const handlePageNumberChange = (pageNumber, pageSize) => {
    console.log(pageNumber, pageSize);
    getTableData(pageNumber, pageSize);
  };

  useEffect(() => {
    getTableData(1, 10);
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
      <AllConsultRecordTable
        className="mt-4 bg-white"
        pagination={{
          size: 'default',
          defaultCurrent: 1,
          total: total,
          defaultPageSize: 10,
          showSizeChanger: false,
          onChange: handlePageNumberChange,
        }}
        dataSource={tableData}
      />
    </div>
  );
}
