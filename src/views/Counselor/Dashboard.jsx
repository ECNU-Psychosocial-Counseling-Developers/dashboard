import { useState, useEffect } from 'react';
import { Rate } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Calendar from '../../components/Calendar';
import photoUrl from '../../assets/photo.webp';
import RecordTable from '../../components/RecordTable';
import service from '../../service';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  consultResponseToTableRow,
  arrangementResponseToDutyList,
  getMonthTotalDutyDay,
  roundSemi,
  duration,
} from '../../utils';

function ConsultInfo(props) {
  const { title, info } = props;
  return (
    <div className="flex-1 flex flex-col justify-center items-center border-r last:border-r-0">
      <p className="mt-2 text-green-600 text-xs">{title}</p>
      <p className="mt-8 mb-6 text-4xl">{info}</p>
    </div>
  );
}

function Dashboard() {
  const user = useSelector(state => state.user);
  const navigate = useNavigate();

  const [overallStatistics, setOverallStatistics] = useState({
    avgScore: 0,
    consultCnt: 0,
    currentConsultCnt: 0,
    todayConsultCnt: 0,
    todayTotalTime: 0,
  });
  const [tableData, setTableData] = useState([]);
  const [dutyList, setDutyList] = useState([]);

  useEffect(() => {
    service
      .getCounselorRecord({ pageSize: 4, pageNumber: 1, userId: user.userId })
      .then(res => {
        setTableData(consultResponseToTableRow(res));
      });
    service.getArrangementInfo(user.userId).then(res => {
      setDutyList(arrangementResponseToDutyList(res));
    });
    Promise.all([
      service.getCounselorAverageScore(user.userId),
      service.getTodayConsultStat(user.userId),
      service.getCurrentConsultCount(user.userId),
    ]).then(([avgScoreRes, todayConsultStatRes, currentConsultCntRes]) => {
      setOverallStatistics({
        avgScore: avgScoreRes.data.data.avgScore,
        consultCnt: avgScoreRes.data.data.totalCount,
        currentConsultCnt: currentConsultCntRes.data.data,
        todayConsultCnt: todayConsultStatRes.data.data.consultCnt,
        todayTotalTime: todayConsultStatRes.data.data.totalTime,
      });
    });
  }, []);

  return (
    <div className="relative m-4">
      {/* Top */}
      <div className="flex items-stretch mb-4">
        <div className="flex-1 flex flex-col">
          {/* 个人信息 */}
          <div className="mb-4 p-4 flex bg-white space-x-4">
            <img
              className="w-28 object-cover"
              style={{ aspectRatio: '3 / 4' }}
              src={user.avatarUrl}
              alt="头像"
            />
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
                <Rate
                  disabled
                  value={roundSemi(overallStatistics.avgScore)}
                  allowHalf
                />
              </div>
              <button className="px-1 py-1 w-max bg-green-500 text-white text-xs rounded-sm">
                咨询设置
              </button>
            </div>
            <div className="w-48 flex flex-col justify-center items-center text-white space-y-1 bg-indigo-theme">
              <p className="">累计完成咨询</p>
              <p className="text-3xl">{overallStatistics.consultCnt}</p>
            </div>
          </div>
          {/* 咨询次数时长信息 */}
          <div className="flex-1 flex p-4 bg-white">
            <ConsultInfo
              title="今日咨询数"
              info={overallStatistics.todayConsultCnt}
            />
            <ConsultInfo
              title="今日咨询时长"
              info={duration(overallStatistics.todayTotalTime)}
            />
            <ConsultInfo
              title="当前会话数"
              info={overallStatistics.currentConsultCnt}
            />
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
              本月共 {dayjs().daysInMonth()} 天，需值班{' '}
              {getMonthTotalDutyDay(dutyList.map(item => item.dutyDay))} 天
            </p>
          </div>
          <Calendar className="flex-1 mt-4" dutyList={dutyList} />
        </div>
      </div>

      {/* Bottom */}
      <div className="bg-white">
        <div className="flex justify-between px-4 py-3 text-sm">
          <div>最近完成的咨询</div>
          <button
            className="text-green-500"
            onClick={() => navigate('/record')}
          >
            查看全部 &gt;
          </button>
        </div>
        <RecordTable dataSource={tableData} />
      </div>
    </div>
  );
}

export default Dashboard;
