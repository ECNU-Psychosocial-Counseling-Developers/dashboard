import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Pagination } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Calendar from '../../components/Calendar';
import RecordTable from '../../components/RecordTable';
import service from '../../service';
import {
  arrangementResponseToDutyList,
  consultResponseToTableRow,
  getMonthTotalDutyDay,
  duration,
} from '../../utils';
import { useNavigate } from 'react-router-dom';
import { UserState } from '../../enum';

// const consultData = Array.from({ length: 12 }, () => ({
//   name: '咨询师A',
//   busy: false,
// }));
// consultData[1].busy = true;

function ConsultInfo(props) {
  const { title, info } = props;
  return (
    <div className="flex-1 flex flex-col justify-center items-center border-r last:border-r-0">
      <p className="mt-2 text-green-600 text-xs">{title}</p>
      <p className="mt-8 mb-6 text-4xl">{info}</p>
    </div>
  );
}

function OnlineCounselorInfo(props) {
  const { state } = props;
  console.log('user state', state);
  if (state === UserState.idle) {
    return <div className="px-2 py-0.5 bg-green-theme text-gray-50">空闲</div>;
  } else if (state === UserState.offline) {
    return <div className="px-2 py-0.5 bg-gray-300 text-gray-50">离线</div>;
  } else {
    return <div className="px-2 py-0.5 bg-red-500 text-gray-50">忙碌</div>;
  }
}

export default function Dashboard() {
  const user = useSelector(state => state.user);
  const navigate = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [dutyList, setDutyList] = useState([]);
  const [overallStatistics, setOverallStatistics] = useState({
    todayConsultCnt: 0,
    todayTotalTime: 0,
    currentConsultCnt: 0,
  });
  const [onlineCounselorList, setOnlineCounselorList] = useState([]);

  useEffect(() => {
    service.getArrangementInfo(user.userId).then(res => {
      setDutyList(arrangementResponseToDutyList(res));
    });
    service
      .getCounselorRecord({ pageSize: 4, pageNumber: 1, userId: user.userId })
      .then(res => {
        setTableData(consultResponseToTableRow(res));
      });
    service
      .getOnDutyCounselor(dayjs().day() === 0 ? 7 : dayjs().day())
      .then(res => {
        setOnlineCounselorList(res.data.data.counselorList);
      });
    Promise.all([
      service.getTodayConsultStat(user.userId),
      service.getCurrentConsultCount(user.userId),
    ]).then(([todayConsultRes, currentConsultRes]) => {
      setOverallStatistics({
        todayConsultCnt: todayConsultRes.data.data.consultCnt,
        todayTotalTime: todayConsultRes.data.data.totalTime,
        currentConsultCnt: currentConsultRes.data.data,
      });
    });
  }, []);

  return (
    <div className="relative m-3.5 space-y-2">
      {/* top info */}
      <div className="flex gap-3" style={{ maxHeight: 600 }}>
        {/* left info */}
        <div className="flex-1 flex flex-col space-y-2">
          <div className="flex gap-3">
            <div className="flex gap-3 p-4 bg-white">
              <img
                className="w-24 object-cover"
                style={{ aspectRatio: '3 / 4' }}
                src={user.avatarUrl}
                alt="头像"
              />
              <div className="flex flex-col justify-between pr-8">
                <h2 className="text-base">{user.name}</h2>
                {/* <button className="px-3 py-1 bg-green-theme text-gray-50">
                  会话设置
                </button> */}
              </div>
            </div>
            <div className="flex-1 flex bg-white">
              <ConsultInfo
                title="今日咨询数"
                info={overallStatistics.todayConsultCnt}
              />
              <ConsultInfo
                title="今日咨询时长"
                info={duration(overallStatistics.todayTotalTime)}
              />
            </div>
          </div>
          <div className="flex-1 flex bg-white">
            <div className="flex-1">
              <div className="flex items-center justify-between p-2">
                <div>今日值班咨询师</div>
              </div>
              <div
                className="grid grid-cols-3 border-t overflow-auto"
                style={{ maxHeight: 160 }}
              >
                {onlineCounselorList.map((consult, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 h-10 border border-t-0 border-l-0"
                  >
                    <div>{consult.name}</div>
                    <OnlineCounselorInfo state={consult.state} />
                  </div>
                ))}
              </div>
            </div>
            <div
              className="flex flex-col justify-center bg-indigo-theme text-center text-gray-50"
              style={{ width: '30%' }}
            >
              <p>正在咨询数</p>
              <p className="text-4xl">{overallStatistics.currentConsultCnt}</p>
            </div>
          </div>
        </div>

        {/* right calendar */}
        <div
          className="flex flex-col px-6 py-4 w-5/12 bg-white"
          style={{ minHeight: 345 }}
        >
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-lg font-bold text-gray-600">
                {dayjs().year()} 年 {dayjs().month() + 1} 月
              </p>
              <CalendarOutlined />
            </div>
            <p className="text-gray-500 text-xs">
              本月共 {dayjs().daysInMonth()} 天，需值班{' '}
              {getMonthTotalDutyDay(dutyList.map(item => item.dutyDay))} 天
            </p>
          </div>
          <Calendar className="flex-1 mt-4" dutyList={dutyList} />
        </div>
      </div>

      {/* bottom table */}
      <div className="bg-white">
        <div className="flex justify-between px-4 py-3 text-sm">
          <div>最近完成的求助会话</div>
          <button
            className="text-green-500"
            onClick={() => navigate('/ask-record')}
          >
            查看全部 &gt;
          </button>
        </div>
        <RecordTable dataSource={tableData} />
      </div>
    </div>
  );
}
