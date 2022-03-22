import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Avatar, Rate } from 'antd';
import { IconDone, IconQuestion } from '../../icons';
import ChatBubble from './ChatBubbles';
import MessageTextArea from './MessageTextArea';
import dayjs from 'dayjs';

import {
  createMessage,
  sendMessage,
  setMessageRead,
  getMessageList,
  getConversationList,
} from '../../im';

export default function Conversation() {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const conversationList = useSelector(state => state.conversationList);

  const { userID } = useParams();

  const conversationID = sessionStorage.getItem('currentConversationID');

  const [messages, setMessages] = useState([]);
  const [chatPersonInfo, setChatPersonInfo] = useState(null);
  const [nextReqMessageID, setNextReqMessageID] = useState('');
  const [consultStatus, setConsultStatus] = useState({
    isOver: false,
    score: 0,
    startTime: 0,
    duration: 0,
    comment: '',
  });

  const conversationWindowRef = useRef();
  const durationTimerRef = useRef();

  const scrollMessageBottom = () => {
    conversationWindowRef.current.lastChild.scrollIntoView({
      behavior: 'smooth',
    });
  };

  const handleSendMessage = (text, setText) => {
    if (!text.trim().length) {
      return;
    }
    const targetUserID = user.userID === '01' ? '02' : '01';
    const newMessage = createMessage(targetUserID, text);
    sendMessage(newMessage);
    flushSync(() => {
      setMessages(preMessages => [...preMessages, newMessage]);
      setText('');
    });
    scrollMessageBottom();
  };

  const getMoreMessages = () => {
    getMessageList({
      conversationID,
      nextReqMessageID,
    }).then(res => {
      const messageList = res.data.messageList;

      setNextReqMessageID(
        res.data.isCompleted ? '' : res.data.nextReqMessageID
      );
      setMessages(prevMessages => [...messageList, ...prevMessages]);
    });
  };

  const refreshDuration = () => {
    setConsultStatus(preStatus => {
      return {
        ...preStatus,
        duration: Date.now() - preStatus.startTime,
      };
    });
  };

  useEffect(() => {
    getMessageList({ conversationID }).then(res => {
      const messageList = res.data.messageList;
      setNextReqMessageID(
        res.data.isCompleted ? '' : res.data.nextReqMessageID
      );
      setMessages(messageList);
    });

    // TODO: 通过 userID 获取当前聊天对象的信息
    const infoRes = {
      data: {
        name: '牡丹' + userID,
        phoneNumber: '133****4322',
        avatarUrl: 'https://placekitten.com/g/100/100',
      },
    };
    // 切换会话窗口的时候也需要咨询的开始时间、是否已结束、评价等信息
    const consultRes = {
      data: {
        isOver: false,
        startTime: 1647925763666,
        score: 0,
        comment: `挺好的，聊得很开心。我觉得搞得挺不错的。俗话说“子曰：「學而時習之，不亦說乎？有朋自遠方來，不亦樂乎？人不知而不慍，不亦君子乎？”`,
      },
    };
    Promise.all([Promise.resolve(infoRes), Promise.resolve(consultRes)])
      .then(([{ data: infoData }, { data: consultData }]) => {
        const { isOver, startTime, score, comment } = consultData;
        setChatPersonInfo(infoData);
        setConsultStatus({
          isOver: isOver,
          startTime: startTime,
          score: score,
          comment: comment,
          duration: 0,
        });
        if (!isOver) {
          refreshDuration();
          durationTimerRef.current = setInterval(() => {
            refreshDuration();
          }, 1000);
        }
      })
      .catch(err => console.error(err));
    return () => {
      clearInterval(durationTimerRef.current);
    };
  }, [userID]);

  useEffect(() => {
    const currentConversation = conversationList.find(
      conversation => conversation.conversationID === conversationID
    );
    if (currentConversation.unreadCount > 0) {
      getMessageList({
        conversationID,
        count: currentConversation.unreadCount,
      }).then(res => {
        const messageList = res.data.messageList;
        setMessageRead({ conversationID })
          .then(() => {
            return getConversationList();
          })
          .then(res => {
            dispatch({
              type: 'conversation/get',
              payload: res.data.conversationList,
            });
          });
        flushSync(() => {
          setMessages(prevMessages => [...prevMessages, ...messageList]);
        });
        scrollMessageBottom();
      });
    }
  }, [conversationList]);

  return (
    <div
      className="mx-6 my-3 bg-white flex shadow-md"
      style={{ minHeight: 'calc(100vh - 96px)' }}
    >
      {/* 侧边信息 */}
      <div className="w-48 p-6 flex flex-col justify-start gap-12 text-gray-50 bg-indigo-theme">
        <div className="flex items-center gap-4">
          {!!chatPersonInfo && (
            <>
              <Avatar src={chatPersonInfo.avatarUrl} size={60} />
              <div className="space-y-2">
                <p className="text-base">{chatPersonInfo.name}</p>
                <p className="text-xs">{chatPersonInfo.phoneNumber}</p>
              </div>
            </>
          )}
        </div>

        <div className="flex-1 space-y-4">
          {consultStatus.isOver ? (
            <>
              <p className="font-bold text-base">咨询已结束</p>
              <div className="space-y-1">
                <p>总共用时</p>
                <p className="text-3xl">
                  {dayjs.duration(consultStatus.duration).format('HH:mm:ss')}
                </p>
              </div>
              <div>
                <p>咨询者评价</p>
                <Rate disabled defaultValue={3} />
                <p className="text-xs mt-3 line-clamp-5">
                  {consultStatus.comment}
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="font-bold text-base">正在咨询中</p>
              <div className="space-y-1">
                <p>已咨询时间</p>
                <p className="text-3xl">
                  {dayjs.duration(consultStatus.duration).format('HH:mm:ss')}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="justify-self-end space-y-2">
          <button className="w-full py-1 flex justify-center items-center gap-4 hover:text-gray-300 active:text-gray-500">
            <IconQuestion style={{ fontSize: 26 }} />
            <span>请求督导</span>
          </button>
          <button className="w-full py-1 flex justify-center items-center gap-4 hover:text-gray-300 active:text-gray-500">
            <IconDone style={{ fontSize: 26 }} />
            <span>结束咨询</span>
          </button>
        </div>
      </div>

      {/* 会话窗口 */}
      <div className="flex-1 flex flex-col">
        <div
          ref={conversationWindowRef}
          className="flex-1 p-6 overflow-y-auto space-y-1.5"
          style={{ maxHeight: 500, minWidth: 350 }}
        >
          {!!nextReqMessageID && (
            <div className="text-center mb-3">
              <button
                className="text-xs text-blue-400"
                onClick={getMoreMessages}
              >
                加载更多消息
              </button>
            </div>
          )}
          {messages.map((message, index) => {
            const isLeft = message.flow === 'in';
            return (
              <ChatBubble
                key={index}
                text={message.payload.text}
                avatarUrl={isLeft ? chatPersonInfo?.avatarUrl : user.avatarUrl}
                isLeft={isLeft}
              />
            );
          })}
        </div>

        {/* 信息输入框 */}
        <MessageTextArea onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
