import { useState } from 'react';
import { Rate, Avatar, message } from 'antd';
import { IconExport, IconReturn } from '../icons';
import dayjs from 'dayjs';
import ChatBubble from '../views/Conversation/components/ChatBubbles';
import { useEffect } from 'react';
import { duration } from '../utils';

export const initialRecordDetail = {
  duration: 0,
  score: 0,
  comment: '',
  customer: {
    id: 0,
    avatarUrl: '',
    name: '',
  },
  counselor: {
    id: '1',
    avatarUrl: '',
    name: '',
  },
  supervisor: {
    id: 2,
    avatarUrl: '',
    name: '',
  },
  messageList: {
    consultMessageList: [],
    sessionMessageList: [],
  },
};

function SideButton({ Icon, onClick, text, disabled = false }) {
  return (
    <button
      style={disabled ? { pointerEvents: 'none' } : undefined}
      className="w-full py-2.5 flex justify-center items-center gap-4 hover:text-gray-300 active:text-gray-500"
      onClick={onClick}
    >
      <Icon style={{ fontSize: 26 }} />
      <span>{text}</span>
    </button>
  );
}

function Message({ isLeft, text, sendTime, leftAvatarUrl, rightAvatarUrl }) {
  const avatarUrl = isLeft ? leftAvatarUrl : rightAvatarUrl;
  const positionStyle = isLeft
    ? {
        left: '40px',
      }
    : {
        right: '40px',
      };
  return (
    <div className="relative mb-3.5 group">
      <ChatBubble text={text} isLeft={isLeft} avatarUrl={avatarUrl} />
      <p
        className="absolute text-xs hidden group-hover:block transform scale-75 text-gray-400"
        style={positionStyle}
      >
        {dayjs(sendTime).format('YYYY 年 MM 月 DD 日 HH:mm:ss')}
      </p>
    </div>
  );
}

export default function RecordDetail(props) {
  const { status, handleReturn } = props;
  const { visible, consultId } = status;

  console.log('status', { status });

  const [recordDetail, setRecordDetail] = useState(initialRecordDetail);

  const handleExportRecord = messageList => {
    saveFileToFileSystem(JSON.stringify(messageList), '咨询记录');
  };

  useEffect(() => {
    if (!visible) {
      return;
    }
    Promise.all([
      service.getConsultInfo(consultId),
      service.getConsultMessage(consultId),
    ])
      .then(([infoRes, messageRes]) => {
        if (infoRes.data.code !== 200 || messageRes.data.code !== 200) {
          message.error('获取详情信息失败');
        }

        const consultInfo = infoRes.data.data;
        const messageInfo = messageRes.data.data;
        console.log(consultInfo, messageInfo);

        if (messageInfo.sessionMessageList.length > 0) {
          const sessionId = messageInfo.sessionId;
          return Promise.all([
            consultInfo,
            messageInfo,
            service.getConsultInfo(sessionId),
          ]);
        }
        return Promise.all([consultInfo, messageInfo, null]);
      })
      .then(([consultInfo, messageInfo, sessionRes]) => {
        console.log('record detail', consultInfo, messageInfo, sessionRes);
        let supervisorId = -1;
        if (sessionRes && sessionRes.data.code === 200) {
          supervisorId = sessionRes.data.data.counseledId;
        }
        setRecordDetail({
          visible: true,
          score: consultInfo.score || 0,
          comment: consultInfo.score || '默认评价',
          duration: duration(
            (consultInfo.endTime - consultInfo.startTime) / 1000 || 0
          ),
          // duration: duration(1234),
          customer: {
            id: consultInfo.counselId,
            name: messageInfo.customerName || '咨询师',
            avatarUrl: 'https://placekitten.com/100/100',
          },
          counselor: {
            id: consultInfo.counseledId,
            name: messageInfo.counselorName || '咨询师',
            avatarUrl: 'https://placekitten.com/110/110',
          },
          supervisor: {
            id: supervisorId,
            name: messageInfo.supervisor || '督导',
            avatarUrl: 'https://placekitten.com/120/120',
          },
          messageList: {
            consultMessageList: messageInfo.consultMessageList,
            sessionMessageList: messageInfo.sessionMessageList,
          },
        });
      });
  }, [visible]);

  return (
    <div
      className="absolute top-0 left-0 right-0 bottom-0 bg-white"
      style={{
        display: visible ? 'flex' : 'none',
        minHeight: 'calc(100vh - 96px)',
      }}
    >
      <aside className="flex flex-col w-48 py-2 h-full bg-indigo-theme text-gray-50">
        <div className="flex gap-3 px-4 py-2 mb-3 items-center">
          <Avatar src={recordDetail.counselor.avatarUrl} size={60} />
          <div>{recordDetail.counselor.name}</div>
        </div>

        <div className="flex-1 px-5 space-y-4">
          <p className="mb-4 text-base">咨询记录</p>
          <div>
            <p>总共用时</p>
            <p className="text-3xl">{recordDetail.duration}</p>
          </div>

          <div>
            <p>咨询者评价</p>
            <Rate disabled defaultValue={recordDetail.score} />
            <p className="text-xs mt-3 line-clamp-5">{recordDetail.comment}</p>
          </div>
        </div>

        <SideButton
          Icon={IconExport}
          text="导出记录"
          onClick={() => handleExportRecord(recordDetail.messageList)}
        />
        <SideButton Icon={IconReturn} text="返回列表" onClick={handleReturn} />
      </aside>

      <section className="flex-1 py-4 px-4 overflow-auto">
        {recordDetail.messageList.consultMessageList.map(item => (
          <Message
            isLeft={item.senderId === recordDetail.customer.id}
            text={item.message}
            leftAvatarUrl={recordDetail.customer.avatarUrl}
            rightAvatarUrl={recordDetail.counselor.avatarUrl}
            sendTime={item.sendTime}
          />
        ))}
      </section>

      {recordDetail.messageList.sessionMessageList.length > 0 && (
        <section className="flex-1 py-4 px-4 border-l overflow-auto">
          {recordDetail.messageList.sessionMessageList.map(item => (
            <Message
              isLeft={item.senderId === recordDetail.supervisor.id}
              text={item.message}
              leftAvatarUrl={recordDetail.supervisor.avatarUrl}
              rightAvatarUrl={recordDetail.counselor.avatarUrl}
              sendTime={item.sendTime}
            />
          ))}
        </section>
      )}
    </div>
  );
}
