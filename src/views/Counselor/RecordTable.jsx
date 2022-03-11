import { Table, Rate } from 'antd';
import dayjs from 'dayjs';

const tableColumns = [
  {
    title: '咨询人',
    dataIndex: 'consumer',
    key: 'consumer',
  },
  {
    title: '咨询时长',
    dataIndex: 'duration',
    key: 'duration',
    render: text => dayjs.duration(text * (10 ** 3)).format('HH:mm:ss'),
  },
  {
    title: '咨询日期',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: '咨询评级',
    dataIndex: 'rate',
    key: 'rate',
    render: text => <Rate disabled defaultValue={text} />
  },
  {
    title: '咨询评价',
    dataIndex: 'comment',
    key: 'comment',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    render: (text, record) => (
      <div className="space-x-2">
        <button className="px-4 py-2 bg-green-300 text-gray-50 text-xs rounded">查看详情</button>
        <button className="px-4 py-2 bg-green-300 text-gray-50 text-xs rounded">导出记录</button>
      </div>
    )
  }
];

export default function RecordTable(props) {
  return (
    <Table
      size="small"
      columns={tableColumns}
      pagination={false}
      {...props}
    />
  );
}
