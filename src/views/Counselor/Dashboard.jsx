import { Rate } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import Calendar from '../../components/Calendar';
import photoUrl from '../../assets/photo.webp';

import RecordTable from '../../components/RecordTable';

dayjs.extend(duration);

// duration 以秒为单位
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

function Dashboard() {
  const renderConsultInfo = (title, info) => {
    return (
      <div className="flex-1 flex flex-col justify-center items-center border-r last:border-r-0">
        <p className="mt-2 text-green-600 text-xs">{title}</p>
        <p className="mt-8 mb-6 text-4xl">{info}</p>
      </div>
    );
  };

  return (
    <div className="m-4">
      {/* Top */}
      <div className="flex items-stretch mb-4">
        <div className="flex-1 flex flex-col">
          {/* 个人信息 */}
          <div className="mb-4 p-4 flex bg-white space-x-4">
            <img className="w-28 object-cover" src={photoUrl} alt="头像" />
            <div className="flex-1 flex flex-col">
              <div>
                <div className="flex space-x-3 items-center">
                  <p className="text-base">咨询师</p>
                  <div className="flex items-center space-x-1 text-green-300 font-bold text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-300"></div>
                    <div>在线</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div>我的综合评价</div>
                <Rate disabled defaultValue={3} />
              </div>
              <button className="px-1 py-1 w-max bg-green-500 text-white text-xs rounded-sm">
                咨询设置
              </button>
            </div>
            <div className="w-48 flex flex-col justify-center items-center text-white space-y-1 bg-indigo-theme">
              <p className="">累计完成咨询</p>
              <p className="text-3xl">12353</p>
            </div>
          </div>
          {/* 咨询次数时长信息 */}
          <div className="flex-1 flex p-4 bg-white">
            {renderConsultInfo('今日咨询数', 35)}
            {renderConsultInfo('今日咨询时长', '6:12:30')}
            {renderConsultInfo('当前会话数', 2)}
          </div>
        </div>

        <div className="flex flex-col h-96 ml-4 px-6 py-4 w-6/12 bg-white">
          {/* 日程表组件 */}
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

      {/* Bottom */}
      <div className="bg-white">
        <div className="flex justify-between px-4 py-3 text-sm">
          <div>最近完成的咨询</div>
          <button className="text-green-500">查看全部 &gt;</button>
        </div>
        <RecordTable dataSource={tableData} />
      </div>
    </div>
  );
}

export default Dashboard;
