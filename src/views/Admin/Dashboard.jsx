import { useState, useEffect, useRef } from 'react';
import { Pagination, Avatar } from 'antd';
import * as echarts from 'echarts';
import dayjs from 'dayjs';

const consultData = Array.from({ length: 12 }, () => ({
  name: '咨询师A',
  busy: false,
}));
consultData[1].busy = true;

const supervisorData = Array.from({ length: 4 }, (_, index) => ({
  name: '督导' + index,
  busy: false,
}));
supervisorData[1].busy = true;

const consultOrderData = Array.from({ length: 4 }, (_, index) => ({
  name: '咨询师' + index,
}));

function BusyInfoItem(props) {
  const { name, busy } = props;
  return (
    <div className="flex items-center justify-between px-4 py-1.5 border border-t-0 border-l-0">
      <div>{name}</div>
      {busy ? (
        <div className="px-2 py-0.5 bg-red-500 text-gray-50">忙碌</div>
      ) : (
        <div className="px-2 py-0.5 bg-green-theme text-gray-50">空闲</div>
      )}
    </div>
  );
}

function ConsultInfoItem(props) {
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

export default function Dashboard() {
  const todayConsultChart = useRef();
  const weekConsultChart = useRef();

  const renderConsultInfo = (title, info) => {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-3 border-r last:border-r-0">
        <p className="mt-2 text-green-600 text-xs">{title}</p>
        <p className="mt-8 mb-6 text-4xl">{info}</p>
      </div>
    );
  };

  useEffect(() => {
    // if (!todayConsultChart.current) {
    todayConsultChart.current = echarts.init(
      document.getElementById('today-consult-chart')
    );
    weekConsultChart.current = echarts.init(
      document.getElementById('week-consult-chart')
    );

    todayConsultChart.current.setOption({
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
    });

    weekConsultChart.current.setOption({
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
    });

    Promise.resolve().then(() => {
      const randomData = length =>
        Array.from({ length }, () => Math.round(Math.random() * 100));
      todayConsultChart.current.setOption({
        series: [
          {
            type: 'line',
            data: randomData(24),
          },
        ],
      });
      weekConsultChart.current.setOption({
        series: [{ type: 'line', data: randomData(7) }],
      });
    });
    return () => {
      todayConsultChart.current.dispose();
      weekConsultChart.current.dispose();
    };
  }, []);

  return (
    <div className="m-4 space-y-3.5">
      {/* top */}
      <div className="flex gap-3">
        <div className="w-4/12 flex p-3 bg-white shadow">
          {renderConsultInfo('今日咨询数', '35')}
          {renderConsultInfo('今日咨询时长', '6:12:30')}
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
              <div>在线咨询师</div>
              <Pagination defaultCurrent={1} total={10} size="small" />
            </div>
            <div className="grid grid-cols-3 border-t">
              {consultData.map((consult, index) => (
                <BusyInfoItem
                  key={index}
                  name={consult.name}
                  busy={consult.busy}
                />
              ))}
            </div>
          </div>
          <div className="w-48 flex flex-col justify-center items-center text-white space-y-1 bg-indigo-theme">
            <p className="">当前的咨询师会话</p>
            <p className="text-3xl">12353</p>
          </div>
        </div>

        <div className="flex" style={{ flex: '2 1 0' }}>
          <div className="flex-1 flex flex-col bg-white shadow">
            <p className="flex-1 flex items-center px-3">当前督导</p>
            <div className="border-t">
              {supervisorData.map((supervisor, index) => (
                <BusyInfoItem
                  key={index}
                  name={supervisor.name}
                  busy={supervisor.busy}
                />
              ))}
            </div>
          </div>
          <div className="w-48 flex flex-col justify-center items-center text-white space-y-1 bg-indigo-theme">
            <p className="">当前的督导会话</p>
            <p className="text-3xl">7712</p>
          </div>
        </div>
      </div>

      {/* bottom */}
      <div className="flex gap-3">
        <div
          className="flex flex-col pt-3 px-4 pb-1 bg-white shadow"
          style={{ flex: '2 1 0' }}
        >
          <p className="pb-3 text-xs text-indigo-theme">7日咨询数量统计</p>
          <div className="flex-1" id="week-consult-chart"></div>
        </div>
        <div className="flex-1 pb-3 bg-white shadow">
          <p className="p-3 text-indigo-theme">当月咨询数量排行</p>
          <div className="space-y-1">
            {consultOrderData.map((consult, index) => (
              <ConsultInfoItem
                key={index}
                order={index + 1}
                avatarUrl="https://placekitten.com/35/35"
                name={consult.name}
                text={245}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 pb-3 bg-white shadow">
          <p className="p-3 text-indigo-theme">当月好评数量排行</p>
          <div className="space-y-1">
            {consultOrderData.map((consult, index) => (
              <ConsultInfoItem
                key={index}
                order={index + 1}
                avatarUrl="https://placekitten.com/35/35"
                name={consult.name}
                text="好评数: 245"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
