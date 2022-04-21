import { useState, useEffect } from 'react';
import { Table } from 'antd';
import { AppointmentStatus } from '../../enum';
import service from '../../service';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

function getRandomStatus() {
  const number = Math.random();
  if (number < 0.25) {
    return AppointmentStatus.notStarted;
  } else if (number < 0.5) {
    return AppointmentStatus.ongoing;
  } else if (number < 0.75) {
    return AppointmentStatus.finished;
  } else {
    return AppointmentStatus.expired;
  }
}

const appointmentStatusMap = {
  [AppointmentStatus.notStarted]: {
    text: '未开始',
    bgColor: '#eaeaea',
    textColor: '#333',
  },
  [AppointmentStatus.ongoing]: {
    text: '进行中',
    bgColor: '#ee0',
    textColor: '#333',
  },
  [AppointmentStatus.finished]: {
    text: '已完成',
    bgColor: '#1fa',
    textColor: '#fff',
  },
  [AppointmentStatus.expired]: {
    text: '已过期',
    bgColor: '#e88',
    textColor: '#fff',
  },
};

function AppointmentStatusTag({ status }) {
  const { text, bgColor, textColor } = appointmentStatusMap[status];
  return (
    <div
      className="inline-block px-1 py-0.5 text-gray-50 text-xs rounded-sm"
      style={{
        background: bgColor,
        color: textColor,
      }}
    >
      <span className="block transform scale-90">{text}</span>
    </div>
  );
}

export default function Appointment() {
  const user = useSelector(state => state.user);

  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const tableColumns = [
    {
      title: '预约人',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '预约日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '预约时间段',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '预约状态',
      dataIndex: 'status',
      key: 'status',
      render: status => <AppointmentStatusTag status={status} />,
    },
  ];

  const getTableData = (pageNumber, pageSize) => {
    service
      .getAppointmentList(user.userId, {
        pageNumber,
        pageSize,
      })
      .then(res => {
        if (res.data.code !== 200) {
          message.error('获取失败');
          return;
        }
        setTableData(
          res.data.data.appointmentList.map(item => ({
            id: item.id,
            customerName: item.customerName,
            date: dayjs(item.startTime).format('YYYY-MM-DD'),
            time: `${dayjs(item.startTime).format('HH:mm')} - ${dayjs(
              item.endTime
            ).format('HH:mm')}`,
            status: item.state,
          }))
        );
        setTotalCount(res.data.totalCount);
      });
  };

  useEffect(() => {
    getTableData(1, 13);
  }, []);

  return (
    <div className="my-2 mx-3 mb-0">
      <Table
        size="small"
        columns={tableColumns}
        rowKey={record => record.id}
        pagination={{
          size: 'default',
          defaultCurrent: 1,
          total: totalCount,
          defaultPageSize: 13,
          showSizeChanger: false,
          style: { margin: '10px auto' },
        }}
        dataSource={tableData}
      />
    </div>
  );
}
