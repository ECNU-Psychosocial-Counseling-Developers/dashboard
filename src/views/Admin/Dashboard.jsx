import { useState, useEffect, useRef } from 'react';
import { Avatar } from 'antd';
import service from '../../service';
import { duration } from '../../utils';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { UserState } from '../../enum';
import { useSelector } from 'react-redux';

const todayChartInitOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'cross' },
  },
  grid: {
    left: 30,
    right: 30,
    bottom: 24,
    top: 8,
  },
  xAxis: {
    data: [
      '00:00',
      '01:00',
      '02:00',
      '03:00',
      '04:00',
      '05:00',
      '06:00',
      '07:00',
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
      '20:00',
      '21:00',
      '22:00',
      '23:00',
    ],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      type: 'line',
      data: [],
      areaStyle: {},
    },
  ],
};

const weekChartInitOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'cross' },
  },
  grid: {
    left: 30,
    right: 30,
    bottom: 24,
    top: 8,
  },
  xAxis: {
    data: Array.from({ length: 7 }, (_, index) =>
      dayjs()
        .subtract(6 - index, 'day')
        .format('MM/DD')
    ),
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      type: 'line',
      data: [],
    },
  ],
};

function BusyInfoItem(props) {
  const { name, state } = props;
  const render = () => {
    if (state === UserState.idle) {
      return (
        <div className="px-2 py-0.5 bg-green-theme text-gray-50">空闲</div>
      );
    } else if (state === UserState.offline) {
      return <div className="px-2 py-0.5 bg-gray-300 text-gray-50">离线</div>;
    } else {
      return <div className="px-2 py-0.5 bg-red-500 text-gray-50">忙碌</div>;
    }
  };
  return (
    <div className="flex items-center justify-between px-4 h-10 border border-t-0 border-l-0">
      <div>{name}</div>
      {render()}
    </div>
  );
}

function Empty() {
  return (
    <div className="flex justify-center items-center py-20 text-gray-400">
      <p>暂无排行数据</p>
    </div>
  );
}

function ConsultOrderItem(props) {
  const { order, name, text, avatarUrl } = props;
  const orderColorMap = {
    1: '#1890ff',
    2: '#2fc25b',
    3: '#f50',
    4: '#fadb14',
  };
  return (
    <div className="flex items-center justify-between px-4 py-1">
      <div className="flex items-center gap-3">
        <span className="text-lg" style={{ color: orderColorMap[order] }}>
          {order}
        </span>
        <Avatar size={38} src={avatarUrl} />
        <span>{name}</span>
      </div>
      <div>{text}</div>
    </div>
  );
}

function ConsultInfo(props) {
  const { title, info } = props;
  return (
    <div className="flex-1 flex flex-col justify-center items-center py-3 border-r last:border-r-0">
      <p className="mt-2 text-green-600 text-xs">{title}</p>
      <p className="mt-8 mb-6 text-4xl">{info}</p>
    </div>
  );
}

export default function Dashboard() {
  const user = useSelector(state => state.user);

  const todayConsultChart = useRef();
  const weekConsultChart = useRef();

  const [todayConsultStat, setTodayConsultState] = useState({
    consultCnt: 0,
    totalTime: 0,
  });
  const [counselorCountRank, setCounselorCountRank] = useState([]);
  const [counselorScoreRank, setCounselorScoreRank] = useState([]);
  const [onlineCounselorList, setOnlineCounselorList] = useState([]);
  const [onlineSupervisorList, setOnlineSupervisorList] = useState([]);
  const [conversationCount, setConversationCount] = useState({
    consultCount: 0,
    sessionCount: 0,
  });

  useEffect(() => {
    todayConsultChart.current = echarts.init(
      document.getElementById('today-consult-chart')
    );
    weekConsultChart.current = echarts.init(
      document.getElementById('week-consult-chart')
    );

    todayConsultChart.current.setOption(todayChartInitOption);

    weekConsultChart.current.setOption(weekChartInitOption);

    service.getTodayAllConsultStat().then(res => {
      const { consultCnt, totalTime, consultHourCountList } = res.data.data;
      setTodayConsultState({
        consultCnt,
        totalTime,
      });
      todayConsultChart.current.setOption({
        series: [
          {
            type: 'line',
            data: consultHourCountList.map(item => item.count),
          },
        ],
      });
    });

    service
      .getConsultCount({
        startTime: dayjs().subtract(6, 'day').startOf('day').valueOf(),
        endTime: dayjs().endOf('day').valueOf(),
      })
      .then(res => {
        const { consultCountList } = res.data.data;
        const dayNumber = 7;
        const weekData = new Array(dayNumber).fill(0);
        const weekTimeStampList = Array.from(
          { length: dayNumber },
          (_, index) => {
            return dayjs().subtract(index, 'day').startOf('day').valueOf();
          }
        ).reverse();
        consultCountList.forEach(data => {
          const dayIndex = weekTimeStampList.indexOf(data.date);
          if (dayIndex > -1) {
            weekData[dayIndex] = data.count;
          }
        });
        weekConsultChart.current.setOption({
          series: [{ type: 'line', data: weekData }],
        });
      });

    service.getCounselorMonthCountRank().then(res => {
      setCounselorCountRank(res.data.data.consultCountRankVOList);
    });
    service.getCounselorMonthScoreRank().then(res => {
      setCounselorScoreRank(res.data.data.consultScoreRankVOList);
    });
    service
      .getOnDutyCounselor(dayjs().day() === 0 ? 7 : dayjs().day())
      .then(res => {
        setOnlineCounselorList(res.data.data.counselorList);
      });
    service.getOnlineSupervisor().then(res => {
      setOnlineSupervisorList(res.data.data.counselorList);
    });
    service.getAdminConsultCount(user.userId).then(res => {
      setConversationCount({
        consultCount: res.data.data.consultCount,
        sessionCount: res.data.data.sessionCount,
      });
    });
    return () => {
      todayConsultChart.current.dispose();
      weekConsultChart.current.dispose();
    };
  }, []);

  return (
    <div className="flex-col m-4 space-y-3.5">
      {/* top */}
      <div className="flex gap-3">
        <div className="w-4/12 flex p-3 bg-white shadow">
          <ConsultInfo title="今日咨询数" info={todayConsultStat.consultCnt} />
          <ConsultInfo
            title="今日咨询时长"
            info={duration(todayConsultStat.totalTime)}
          />
        </div>
        <div className="flex-1 flex flex-col pt-3 px-4 pb-1 bg-white shadow">
          <p className="pb-3 text-xs text-indigo-theme">今日咨询数量变化</p>
          <div className="flex-1" id="today-consult-chart"></div>
        </div>
      </div>

      {/* middle */}
      <div className="flex gap-3">
        <div className="flex" style={{ flex: '3 1 0' }}>
          <div className="flex-1 bg-white shadow">
            <div className="flex items-center justify-between p-2">
              <div>今日值班咨询师</div>
            </div>
            <div
              className="grid grid-cols-3 border-t overflow-auto"
              style={{ maxHeight: 40 * 4 }}
            >
              {onlineCounselorList.map((counselor, index) => (
                <BusyInfoItem
                  key={index}
                  name={counselor.name}
                  state={counselor.state}
                />
              ))}
            </div>
          </div>
          <div className="w-48 flex flex-col justify-center items-center text-white space-y-1 bg-indigo-theme">
            <p className="">当前的咨询师会话</p>
            <p className="text-3xl">{conversationCount.consultCount}</p>
          </div>
        </div>

        <div className="flex" style={{ flex: '2 1 0' }}>
          <div className="flex-1 flex flex-col bg-white shadow">
            <p className="flex-1 flex items-center px-3">当前督导</p>
            <div className="border-t overflow-auto" style={{ height: 39 * 4 }}>
              {!onlineSupervisorList.length && (
                <div className="flex justify-center py-12 text-gray-400 select-none">
                  暂无在线督导
                </div>
              )}
              {onlineSupervisorList.map((supervisor, index) => (
                <BusyInfoItem
                  key={index}
                  name={supervisor.name}
                  state={supervisor.state}
                />
              ))}
            </div>
          </div>
          <div className="w-48 flex flex-col justify-center items-center text-white space-y-1 bg-indigo-theme">
            <p className="">当前的督导会话</p>
            <p className="text-3xl">{conversationCount.sessionCount}</p>
          </div>
        </div>
      </div>

      {/* bottom */}
      <div className="flex flex-shrink-0 gap-3">
        <div
          className="flex flex-col pt-3 px-4 pb-1 bg-white shadow"
          style={{ flex: '2 1 0' }}
        >
          <p className="pb-3 text-xs text-indigo-theme">7日咨询数量统计</p>
          <div className="flex-1" id="week-consult-chart"></div>
        </div>
        <div className="flex-1 pb-3 bg-white shadow">
          <p className="p-3 text-indigo-theme">当月咨询数量排行</p>
          {counselorCountRank.length > 0 ? (
            <div className="space-y-1">
              {counselorCountRank.map(
                ({ counselorId, counselorName, consultCount }, index) => (
                  <ConsultOrderItem
                    key={counselorId}
                    order={index + 1}
                    avatarUrl="https://placekitten.com/35/35"
                    name={counselorName}
                    text={consultCount}
                  />
                )
              )}
            </div>
          ) : (
            <Empty />
          )}
        </div>
        <div className="flex-1 pb-3 bg-white shadow">
          <p className="p-3 text-indigo-theme">当月平均评分排行</p>
          {counselorScoreRank.length > 0 ? (
            <div className="space-y-1">
              {counselorScoreRank.map(
                ({ counselorId, counselorName, avgScore }, index) => (
                  <ConsultOrderItem
                    key={counselorId}
                    order={index + 1}
                    avatarUrl="https://placekitten.com/35/35"
                    name={counselorName}
                    text={
                      <div className="space-x-2">
                        <span>平均分:</span>
                        <span>{avgScore ? avgScore : 0}</span>
                      </div>
                    }
                  />
                )
              )}
            </div>
          ) : (
            <Empty />
          )}
        </div>
      </div>
    </div>
  );
}
