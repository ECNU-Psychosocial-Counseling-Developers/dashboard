import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Avatar, Modal, Input, message } from 'antd';
import { IconCalendarEdit } from '../../icons';
import AddPersonModal from './components/AddPersonModal';
import { weekNumberToCharacter } from '../../utils';
import service from '../../service';
import { Role } from '../../enum';

const weekText = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function CalendarItem({ className, date, active, onClick, count }) {
  const isLegalDate = date > 0;
  return (
    <div
      className={
        'relative flex justify-center items-center border-t' + ' ' + className
      }
      style={{
        border: active && isLegalDate ? 'solid 2px rgb(31, 46, 65)' : undefined,
        cursor: isLegalDate ? 'pointer' : undefined,
        minHeight: 70,
      }}
      onClick={onClick}
    >
      {isLegalDate && (
        <>
          <div
            className="absolute top-0 left-0 w-6 h-6 text-white text-center leading-6 bg-green-theme"
            style={{ background: active ? 'rgb(31, 46, 65)' : undefined }}
          >
            {date}
          </div>
          <div>
            <p>咨询师 {count.counselorCount}</p>
            <p>督导 {count.supervisorCount}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function Calendar() {
  const weekDay = dayjs().date(1).day();
  const daysInMonth = dayjs().daysInMonth();
  const dateGrid = new Array(35).fill(-1);
  for (let i = weekDay - 1, date = 1; i <= daysInMonth; i++) {
    dateGrid[i] = date++;
  }

  const [activeDate, setActiveDate] = useState(new Date().getDate());
  const [tabStatus, setTabStatus] = useState({
    key: 'counselor',
    barWidth: '32px',
    barLeft: '32px',
  });
  const [peopleList, setPeopleList] = useState({
    counselor: [],
    supervisor: [],
  });
  const [addPersonModalVisible, setAddPersonModalVisible] = useState(false);

  // 0: Monday, 1: Tuesday, ..., 6: Sunday
  const [dutyDayInfoList, setDutyDayInfoList] = useState(
    Array.from({ length: 7 }, () => ({
      counselorCount: 0,
      supervisorCount: 0,
    }))
  );

  const handleClickOutCalendar = e => {
    let element = e.target;
    while (element) {
      if (
        element.classList.contains('calendar-container') ||
        element.classList.contains('calendar-sidebar') ||
        element.classList.contains('ant-modal-root') ||
        element.classList.contains('ant-select-dropdown')
      ) {
        return;
      }
      element = element.parentElement;
    }
    setActiveDate(new Date().getDate());
  };

  // 点击某一日期框，在侧边栏显示该日期的值班人员
  const handleClickDate = date => {
    if (date < 1) {
      return;
    }
    setActiveDate(date);
    const dutyDay =
      dayjs().date(date).day() === 0 ? 7 : dayjs().date(date).day();
    Promise.all([
      service.getOnDutyCounselor(dutyDay),
      service.getOnDutySupervisor(dutyDay),
    ]).then(([counselorRes, supervisorRes]) => {
      setPeopleList({
        counselor: counselorRes.data.data.counselorList,
        supervisor: supervisorRes.data.data.counselorList,
      });
    });
  };

  const handleClickTabButton = key => {
    setTabStatus({
      key,
      barLeft: key === 'counselor' ? '32px' : '132px',
      barWidth: key === 'counselor' ? '32px' : '20px',
    });
  };

  const updateCalendar = () => {
    service.getAllArrangement().then(res => {
      const { arrangementList } = res.data.data;
      const dutyStateInWeek = Array.from({ length: 7 }, () => ({
        counselorCount: 0,
        supervisorCount: 0,
      }));
      arrangementList.forEach(({ dutyDay, role }) => {
        if (role === Role.counselor) {
          dutyStateInWeek[dutyDay - 1].counselorCount++;
        } else {
          dutyStateInWeek[dutyDay - 1].supervisorCount++;
        }
      });
      setDutyDayInfoList(dutyStateInWeek);
    });
  };

  const updateSidebar = () => {
    const dutyDay = dayjs().day() === 0 ? 7 : dayjs().day();
    Promise.all([
      service.getOnDutyCounselor(dutyDay),
      service.getOnDutySupervisor(dutyDay),
    ]).then(([counselorRes, supervisorRes]) => {
      setPeopleList({
        counselor: counselorRes.data.data.counselorList,
        supervisor: supervisorRes.data.data.counselorList,
      });
    });
  };

  const handleAddPerson = payload => {
    const { counselorId, dutyDay, role, startTime, endTime } = payload;
    return service
      .createArrangement(counselorId, dutyDay, role, startTime, endTime)
      .then(res => {
        if (res.data.code !== 200) {
          message.error('添加失败');
        }
        message.success('添加成功');
        updateCalendar();
        setAddPersonModalVisible(false);
      });
  };

  const handleDeletePerson = (person, date) => {
    const dutyDay = dayjs().date(date).day();
    // TODO: http delete person, update peopleList
    const deleteArrangement = () => {
      console.log('delete', person);
      service.deleteArrangement(dutyDay, person.id).then(res => {
        if (res.data.code !== 200) {
          message.error('删除失败');
          return;
        }
        message.success('删除成功');
        setPeopleList(prevPeopleList => {
          const newPeopleList = { ...prevPeopleList };
          if (person.role === Role.counselor) {
            newPeopleList.counselor = prevPeopleList.counselor.filter(
              item => item.id !== person.id
            );
          } else {
            newPeopleList.supervisor = prevPeopleList.supervisor.filter(
              item => item.id !== person.id
            );
          }
          return newPeopleList;
        });
        updateCalendar();
      });
    };
    const modal = Modal.confirm({
      title: '删除',
      content: (
        <p>
          确认删除
          <span className="inline-block font-bold mx-1">
            {person.name}（UserID: {person.id}）
          </span>
          吗？
        </p>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        deleteArrangement();
        modal.destroy();
      },
      onCancel: () => modal.destroy(),
    });
  };

  useEffect(() => {
    updateCalendar();
    updateSidebar();

    window.addEventListener('click', handleClickOutCalendar);
    return () => {
      window.removeEventListener('click', handleClickOutCalendar);
    };
  }, []);

  return (
    <div className="flex m-4 bg-white" style={{ height: 'calc(100vh - 96px)' }}>
      {/* 日历 */}
      <div className="flex-1 flex flex-col px-8 py-6 overflow-auto">
        <h2 className="flex items-center gap-2 text-2xl text-indigo-theme">
          {dayjs().format('YYYY年MM月')}
          <IconCalendarEdit />
        </h2>
        <div className="flex-1 flex flex-col" style={{ minWidth: 700 }}>
          {/* 顶栏 */}
          <div className="flex border border-b-0">
            {weekText.map(text => (
              <div
                key={text}
                className="flex-1 py-1.5 text-center text-indigo-theme text-xs border-r last:border-r-0"
              >
                {text}
              </div>
            ))}
          </div>

          {/* 日期 */}
          <div className="calendar-container flex-1 grid grid-cols-7 grid-rows-5 border border-t-0 select-none">
            {dateGrid.map((date, index) => (
              <CalendarItem
                key={index}
                date={date}
                className={(index + 1) % 7 ? 'border-r' : ''}
                active={activeDate === date}
                count={dutyDayInfoList[index % 7]}
                onClick={() => handleClickDate(date)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 侧边栏 */}
      <div className="calendar-sidebar flex flex-col w-48 border-l">
        <div className="flex justify-center items-center py-4 text-lg">
          {dayjs(new Date().setDate(activeDate))
            .format('M月D日 星期d')
            .replace(/星期(\d)/, (_, p1) => '星期' + weekNumberToCharacter[p1])}
        </div>
        <div className="relative flex border-t border-b">
          <button
            className="flex-1 py-2"
            onClick={() => handleClickTabButton('counselor')}
          >
            咨询师
          </button>
          <button
            className="flex-1 py-2"
            onClick={() => handleClickTabButton('supervisor')}
          >
            督导
          </button>
          <div
            className="absolute left-0 bottom-0.5 h-0.5 rounded-full bg-indigo-theme opacity-75 transition-all"
            style={{
              transform: `translateX(${tabStatus.barLeft})`,
              width: tabStatus.barWidth,
            }}
          ></div>
        </div>
        <button
          className="block w-full py-2 text-center border-b"
          onClick={() => setAddPersonModalVisible(true)}
        >
          <span>
            {tabStatus.key === 'counselor' ? '+ 添加咨询师' : '+ 添加督导'}
          </span>
        </button>
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <div
            className="flex transition-transform"
            style={{
              transform: `translateX(${
                tabStatus.key === 'counselor' ? '0' : '-192px'
              })`,
            }}
          >
            <ul className="flex-shrink-0 w-48 mb-0">
              {peopleList.counselor?.map(counselor => (
                <li
                  key={counselor.id}
                  className="flex items-center justify-between px-4 py-2 border-b"
                >
                  <div className="flex items-center gap-4">
                    <Avatar src={counselor.photo} size={30} />
                    <span className="text-xs">{counselor.name}</span>
                  </div>
                  <button
                    className="text-xs text-red-700"
                    onClick={() => handleDeletePerson(counselor, activeDate)}
                  >
                    移除
                  </button>
                </li>
              ))}
            </ul>
            <ul className="flex-shrink-0 w-48 mb-0">
              {peopleList.supervisor?.map(supervisor => (
                <li
                  key={supervisor.id}
                  className="flex items-center justify-between px-4 py-2 border-b"
                >
                  <div className="flex items-center gap-4">
                    <Avatar src={supervisor.photo} size={30} />
                    <span className="text-xs">{supervisor.name}</span>
                  </div>
                  <button
                    className="text-xs text-red-700"
                    onClick={() => handleDeletePerson(supervisor, activeDate)}
                  >
                    移除
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 添加咨询师/督导 Modal */}
      <AddPersonModal
        visible={addPersonModalVisible}
        date={activeDate}
        type={tabStatus.key}
        onFinish={handleAddPerson}
        onCancel={() => setAddPersonModalVisible(false)}
      />
    </div>
  );
}
