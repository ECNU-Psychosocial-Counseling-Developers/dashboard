import dayjs from 'dayjs';
import { CalendarOutlined } from '@ant-design/icons';

const weekText = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function CalendarItem({ className, date, isActive = Math.random() < 0.5 }) {
  return (
    <div className={'relative flex justify-center items-center border-t bg-gray-50 ' + className}>
      {date > 0 && (
        <>
          <div>{isActive && <CalendarOutlined style={{ fontSize: 28, color: '#eaeaea' }} />}</div>
          <div
            className={'absolute top-0 left-0 w-4 h-4 text-center text-white text-xs ' +
              (isActive ? 'bg-green-400' : 'bg-green-200')}
          >
            {date}
          </div>
        </>
      )}
    </div>
  );
}

export default function Calendar(props) {
  const { className, style } = props;

  // 本月第一天星期几
  const weekDay = dayjs().date(1).day();
  const daysInMonth = dayjs().daysInMonth();
  const dateGrid = new Array(35).fill(-1);
  for (let i = weekDay - 1, date = 1; i <= daysInMonth; i++) {
    dateGrid[i] = date++;
  }

  return (
    <div className={'flex flex-col border ' + className} style={style}>
      {/* 顶栏 */}
      <div className="flex">
        {weekText.map(text => (
          <div key={text} className="flex-1 py-1 text-center text-green-500 text-xs bg-gray-100">{text}</div>
        ))}
      </div>

      {/* 日期 */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5">
        {dateGrid.map((date, index) => <CalendarItem key={index} date={date} className={(index + 1) % 7 ? 'border-r' : ''} />)}
      </div>
    </div>
  );
}
