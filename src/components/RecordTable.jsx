import { useState } from 'react';
import { Table, Rate } from 'antd';
import dayjs from 'dayjs';
import { duration, saveFileToFileSystem } from '../utils';
import RecordDetail from './RecordDetail';

export default function RecordTable(props) {
  const [detailStatus, setDetailStatus] = useState({
    visible: false,
    consultId: -1,
  });

  const handleShowDetail = record => {
    const { consultId } = record;
    setDetailStatus({ visible: true, consultId });
  };

  const handleReturn = () => {
    setDetailStatus({ consultId: -1, visible: false });
  };

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
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record) => (
        <div className="space-x-2">
          <button
            className="px-4 py-2 bg-green-theme text-gray-50 text-xs rounded-sm"
            onClick={() => handleShowDetail(record)}
          >
            查看详情
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Table
        rowKey={record => record.consumer + record.duration}
        size="small"
        columns={tableColumns}
        pagination={false}
        {...props}
      />

      {/* 详情页 */}
      <RecordDetail status={detailStatus} handleReturn={handleReturn} />
    </div>
  );
}
