import { useSelector } from 'react-redux';
import { Pagination } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Calendar from '../../components/Calendar';
import RecordTable from '../../components/RecordTable';

const consultData = Array.from({ length: 12 }, () => ({
  name: '咨询师A',
  busy: false,
}));
consultData[1].busy = true;

const tableData = [
  {
    key: 0,
    consumer: '张先生',
    duration: 1000,
    date: dayjs().format('YYYY/MM/DD HH:mm:ss'),
    rate: Math.floor(Math.random() * 5) + 1,
    comment: '搞得不丑',
  },
  {
    key: 1,
    consumer: '李先生',
    duration: 2000,
    date: dayjs().format('YYYY/MM/DD HH:mm:ss'),
    rate: Math.floor(Math.random() * 5) + 2,
    comment: '搞得不丑',
  },
  {
    key: 2,
    consumer: '王先生',
    duration: 500,
    date: dayjs().format('YYYY/MM/DD HH:mm:ss'),
    rate: Math.floor(Math.random() * 5) + 1,
    comment: '搞得不丑',
  },
  {
    key: 3,
    consumer: '刘先生',
    duration: 10,
    date: dayjs().format('YYYY/MM/DD HH:mm:ss'),
    rate: 5,
    comment: '搞得不丑',
  },
];

export default function Dashboard(props) {
  const user = useSelector(state => state.user);

  const renderConsultInfo = (title, info) => {
    return (
      <div className="flex-1 flex flex-col justify-center items-center border-r last:border-r-0">
        <p className="mt-2 text-green-600 text-xs">{title}</p>
        <p className="mt-8 mb-6 text-4xl">{info}</p>
      </div>
    );
  };

  return (
    <div className="m-3.5 space-y-2">
      {/* top info */}
      <div className="flex gap-3" style={{ maxHeight: 600 }}>
        {/* left info */}
        <div className="flex-1 space-y-2">
          <div className="flex gap-3">
            <div className="flex gap-3 p-4 bg-white">
              <img
                className="w-24 object-cover"
                src={user.avatarUrl}
                alt="头像"
              />
              <div className="flex flex-col justify-between">
                <h2 className="text-base">{user.name}</h2>
                <button className="px-3 py-1 bg-green-theme text-gray-50">
                  会话设置
                </button>
              </div>
            </div>
            <div className="flex-1 flex bg-white">
              {renderConsultInfo('今日咨询数', 35)}
              {renderConsultInfo('今日咨询时长', '6:12:30')}
            </div>
          </div>
          <div className="flex bg-white">
            <div className="flex-1">
              <div className="flex items-center justify-between p-2">
                <div>在线咨询师</div>
                <Pagination defaultCurrent={1} total={10} size="small" />
              </div>
              <div className="grid grid-cols-3 border-t">
                {consultData.map((consult, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 py-1.5 border border-t-0 border-l-0"
                  >
                    <div>{consult.name}</div>
                    {consult.busy ? (
                      <div className="px-2 py-0.5 bg-red-500 text-gray-50">
                        忙碌
                      </div>
                    ) : (
                      <div className="px-2 py-0.5 bg-green-theme text-gray-50">
                        空闲
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div
              className="flex flex-col justify-center bg-indigo-theme text-center text-gray-50"
              style={{ width: '30%' }}
            >
              <p>正在咨询数</p>
              <p className="text-4xl">8</p>
            </div>
          </div>
        </div>

        {/* right calendar */}
        <div className="flex flex-col px-6 py-4 w-5/12 bg-white">
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-lg font-bold text-gray-600">
                {dayjs().year()} 年 {dayjs().month() + 1} 月
              </p>
              <CalendarOutlined />
            </div>
            <p className="text-gray-500 text-xs">
              本月共 {dayjs().daysInMonth()} 天，需值班 XX 天
            </p>
          </div>
          <Calendar className="flex-1 mt-4" />
        </div>
      </div>

      {/* bottom table */}
      <div className="bg-white">
        <div className="flex justify-between px-4 py-3 text-sm">
          <div>最近完成的求助会话</div>
          <button className="text-green-500">查看全部 &gt;</button>
        </div>
        <RecordTable dataSource={tableData} />
      </div>
    </div>
  );
}
