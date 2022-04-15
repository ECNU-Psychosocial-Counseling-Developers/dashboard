import { Table, Rate } from 'antd';
import dayjs from 'dayjs';
import { duration } from '../utils';

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
    render: text => duration(text),
  },
  {
    title: '咨询日期',
    dataIndex: 'date',
    key: 'date',
    render: text => dayjs(text).format('YYYY/MM/DD HH:mm:ss'),
  },
  {
    title: '咨询评级',
    dataIndex: 'score',
    key: 'score',
    render: text => <Rate disabled defaultValue={text} />,
  },
  {
    title: '咨询评价',
    dataIndex: 'comment',
    key: 'comment',
  },
  {
    title: '督导求助',
    dataIndex: 'supervisor',
    key: 'supervisor',
    render: text => (text ? text : '无'),
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    render: (text, record) => (
      <div className="space-x-2">
        <button className="px-4 py-2 bg-green-theme text-gray-50 text-xs rounded-sm">
          查看详情
        </button>
        <button className="px-4 py-2 bg-green-theme text-gray-50 text-xs rounded-sm">
          导出记录
        </button>
      </div>
    ),
  },
];

export default function AllConsultRecordTable(props) {
  return (
    <Table
      // TODO: 生产环境下不使用 random
      rowKey={record => record.consumer + record.duration + Math.random()}
      size="small"
      columns={tableColumns}
      pagination={false}
      {...props}
    />
  );
}
