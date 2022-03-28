import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Avatar, Modal, Input } from 'antd';
import { IconCalendarEdit } from '../../icons';
import AddPersonModal from './components/AddPersonModal';
import { weekNumberToCharacter } from '../../utils';

const consultData = Array.from({ length: 20 }, (_, index) => ({
  name: '咨询师' + (index + 1),
  avatarUrl: 'https://placekitten.com/35/35',
  userID: index,
}));

const supervisorData = Array.from({ length: 20 }, (_, index) => ({
  name: '督导' + (index + 1),
  avatarUrl: 'https://placekitten.com/35/35',
  userID: index,
}));

const weekText = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function CalendarItem({ className, date, active, onClick }) {
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
            <p>咨询师 18</p>
            <p>督导 2</p>
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

  const [activeDate, setActiveDate] = useState(0);
  const [tabStatus, setTabStatus] = useState({
    key: 'counselor',
    barWidth: '32px',
    barLeft: '32px',
  });
  const [peopleList, setPeopleList] = useState({
    consult: [],
    supervisor: [],
  });
  const [addPersonModalVisible, setAddPersonModalVisible] = useState(false);

  const handleClickOutCalendar = e => {
    let element = e.target;
    while (element) {
      if (element.classList.contains('calendar-container')) {
        return;
      }
      element = element.parentElement;
    }
    setActiveDate(0);
  };

  const handleClickDate = date => {
    setActiveDate(date);
  };

  const handleClickTabButton = key => {
    setTabStatus({
      key,
      barLeft: key === 'counselor' ? '32px' : '132px',
      barWidth: key === 'counselor' ? '32px' : '20px',
    });
  };

  const handleAddPerson = userID => {
    console.log('new userID', userID);
  };

  const handleDeletePerson = person => {
    // TODO: http delete person, update peopleList
    const service = () => {
      console.log('delete', person.userID);
    };
    const modal = Modal.confirm({
      title: '删除',
      content: (
        <p>
          确认删除
          <span className="inline-block font-bold mx-1">
            {person.name}（UserID: {person.userID}）
          </span>
          吗？
        </p>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        service();
        modal.destroy();
      },
      onCancel: () => modal.destroy(),
    });
  };

  useEffect(() => {
    window.addEventListener('click', handleClickOutCalendar);
    return () => {
      window.removeEventListener('click', handleClickOutCalendar);
    };
  }, []);

  return (
    <div className="flex m-4 bg-white" style={{ height: 'calc(100vh - 96px)' }}>
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
                onClick={() => handleClickDate(date)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col w-48 border-l">
        <div className="flex justify-center items-center py-4 text-lg">
          {`${dayjs().format('M月D日')} 星期${
            weekNumberToCharacter[dayjs().day()]
          }`}
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
              {consultData.map((consult, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between px-4 py-2 border-b"
                >
                  <div className="flex items-center gap-4">
                    <Avatar src={consult.avatarUrl} size={30} />
                    <span className="text-xs">{consult.name}</span>
                  </div>
                  <button
                    className="text-xs text-red-700"
                    onClick={() => handleDeletePerson(consult)}
                  >
                    移除
                  </button>
                </li>
              ))}
            </ul>
            <ul className="flex-shrink-0 w-48 mb-0">
              {supervisorData.map((supervisor, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between px-4 py-2 border-b"
                >
                  <div className="flex items-center gap-4">
                    <Avatar src={supervisor.avatarUrl} size={30} />
                    <span className="text-xs">{supervisor.name}</span>
                  </div>
                  <button
                    className="text-xs text-red-700"
                    onClick={() => handleDeletePerson(supervisor)}
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
        type={tabStatus.key}
        onFinish={handleAddPerson}
        onCancel={() => setAddPersonModalVisible(false)}
      />
    </div>
  );
}
