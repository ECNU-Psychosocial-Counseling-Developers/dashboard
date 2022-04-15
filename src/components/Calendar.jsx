import dayjs from 'dayjs';

const weekText = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function CalendarItem({ className, date, isActive, startTime, endTime }) {
  const isToday = new Date().getDate() === date;
  return (
    <div
      className={
        'relative flex justify-center items-center border-t bg-gray-50 overflow-hidden hover:bg-gray-100 group' +
        ' ' +
        className
      }
      style={isToday ? { border: 'solid 2px #1f2e4180' } : undefined}
    >
      {date > 0 && (
        <>
          <div>
            {isActive && (
              <div className="text-xs text-green-600 transition-all duration-200 scale-75 group-hover:scale-110">
                <div>{startTime}</div>
                <div>{endTime}</div>
              </div>
            )}
          </div>
          <div
            className={
              'absolute top-0 left-0 w-4 h-4 text-center text-white text-xs transition-opacity duration-500' +
              ' ' +
              (isActive ? 'bg-green-400 group-hover:opacity-0' : 'bg-green-200')
            }
          >
            {date}
          </div>
        </>
      )}
    </div>
  );
}

export default function Calendar(props) {
  const { className, style, dutyList } = props;
  // console.log({ dutyList });

  // 本月第一天星期几
  const firstDay = dayjs().date(1).day();
  const daysInMonth = dayjs().daysInMonth();
  const dateGrid = new Array(35).fill(-1);
  for (let i = firstDay - 1, date = 1; i <= daysInMonth; i++) {
    dateGrid[i] = date++;
  }

  return (
    <div className={'flex flex-col border ' + className} style={style}>
      {/* 顶栏 */}
      <div className="flex">
        {weekText.map(text => (
          <div
            key={text}
            className="flex-1 py-1 text-center text-green-500 text-xs bg-gray-100"
          >
            {text}
          </div>
        ))}
      </div>

      {/* 日期 */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5">
        {dateGrid.map((date, index) => {
          const weekDay = (index % 7) + 1;
          const dutyDay = dutyList.find(item => item.dutyDay === weekDay);
          return (
            <CalendarItem
              key={index}
              date={date}
              className={weekDay === 7 ? '' : 'border-r'}
              isActive={!!dutyDay}
              startTime={dutyDay?.startTime}
              endTime={dutyDay?.endTime}
            />
          );
        })}
      </div>
    </div>
  );
}
