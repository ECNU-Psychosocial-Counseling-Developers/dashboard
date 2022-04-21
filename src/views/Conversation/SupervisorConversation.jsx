import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Avatar, message, Rate } from 'antd';
import { IconQuestion, IconExport } from '../../icons';
import CommentModal from './components/CommentModal';
import SelectSupervisorModal from './components/SelectSupervisorModal';
import ConsultConversation from './components/ConsultConversation';
import AskSupervisorConversation from './components/AskSupervisorConversation';
import { setMessageRead, getMessageList, getConversationList } from '../../im';
import { saveFileToFileSystem, duration } from '../../utils';
import service from '../../service';
import ChatBubble from './components/ChatBubbles';
import defaultAvatarUrl from '../../assets/default-avatar.jpg';

export default function Conversation() {
  const dispatch = useDispatch();
  const conversationList = useSelector(state => state.conversationList);

  const { userId } = useParams();

  const consultConversationID = localStorage.getItem('currentConversationID');
  const supervisorConversationID = localStorage.getItem(consultConversationID);
  const storageSupervisor = localStorage.getItem(
    consultConversationID + '_supervisorInfo'
  );

  const [chatPersonInfo, setChatPersonInfo] = useState(null);
  const [consultStatus, setConsultStatus] = useState({
    isOver: true,
    score: 0,
    startTime: 0,
    duration: 0,
    comment: '',
  });

  const [consultMessages, setConsultMessages] = useState([]);
  const [consultNextMessageID, setConsultNextMessageID] = useState('');
  const [pollingMessages, setPollingMessages] = useState([]);

  const consultConversationRef = useRef();
  const durationTimerRef = useRef();
  const pollingTimerRef = useRef();
  const pollingGetMessagesTimerRef = useRef();
  const pollingMessageRef = useRef();

  const scrollMessageBottom = ref => {
    ref.current.lastChild.scrollIntoView({
      behavior: 'smooth',
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

  const autoRefreshDuration = interval => {
    refreshDuration();
    durationTimerRef.current = setInterval(() => {
      refreshDuration();
    }, interval);
  };

  const pollingGetConsultMessages = interval => {
    const consultId = localStorage.getItem('message_consultId');
    pollingGetMessagesTimerRef.current = setInterval(() => {
      service.getConsultMessage(consultId).then(res => {
        console.log('获取同步消息', res.data.data);
        if (res.data.code !== 200) {
          return;
        }
        flushSync(() => {
          setPollingMessages(res.data.data.consultMessageList);
        });
        pollingMessageRef.current.lastChild?.scrollIntoView({
          behavior: 'smooth',
        });
      });
    }, interval);
  };

  const pollingIsFinished = interval => {
    pollingTimerRef.current = setInterval(() => {
      service
        .getConsultInfo(Number(localStorage.getItem('message_sessionId')))
        .then(res => {
          if (res.data.code !== 200) {
            console.error('Failed to polling isFinished');
          }
          console.log('督导查看是否结束', res.data.data);
          const { startTime, endTime, score, comment } = res.data.data;
          const isOver = !!endTime;
          if (isOver) {
            clearInterval(durationTimerRef.current);
            clearInterval(pollingTimerRef.current);
            localStorage.removeItem(consultConversationID);
            localStorage.removeItem(consultConversationID + '_supervisorInfo');
            setConsultStatus({
              isOver,
              startTime,
              score,
              comment,
              duration: Date.now() - startTime,
            });
          }
        });
    }, interval);
  };

  const handleExportRecord = () => {
    service
      .getConsultMessage(Number(localStorage.getItem('message_consultId')))
      .then(res => {
        if (res.data.code !== 200) {
          message.error('获取历史信息失败');
          return;
        }
        saveFileToFileSystem(JSON.stringify(res.data.data), '咨询记录');
      });
  };

  const refreshMessage = (conversationID, setMessages, conversationRef) => {
    const conversation = conversationList.find(
      conversation => conversation.conversationID === conversationID
    );
    if (conversation && conversation.unreadCount > 0) {
      getMessageList({
        conversationID,
        count: conversation.unreadCount,
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
        scrollMessageBottom(conversationRef);
      });
    }
  };

  const getInitMessages = (conversationID, setNextMessageID, setMessages) => {
    getMessageList({ conversationID }).then(res => {
      const messageList = res.data.messageList;
      for (let i = messageList.length - 1; i >= 0; i--) {
        if (messageList[i].cloudCustomData) {
          // 接收到的 cloudCustomData 为 JSON 形式
          const cloudData = JSON.parse(messageList[i].cloudCustomData);
          console.log('GET CUSTOM DATA:', cloudData);
          // if (localStorage.getItem('message_consultId')) {

          // }
          localStorage.setItem('message_sessionId', cloudData.sessionId);
          localStorage.setItem('message_consultId', cloudData.consultId);
          break;
        }
      }
      Promise.all([
        service.getCounselorInfo(userId),
        service.getConsultInfo(
          Number(localStorage.getItem('message_sessionId'))
        ),
      ])
        .then(([counselorRes, consultRes]) => {
          if (counselorRes.data.code !== 200 || consultRes.data.code !== 200) {
            message.error('获取信息失败');
            return;
          }
          const counselorInfo = {
            ...counselorRes.data.data,
            photo:
              counselorRes.data.data.photo || 'https://placekitten.com/100/100',
          };
          const { startTime, endTime, score, comment } = consultRes.data.data;
          setChatPersonInfo(counselorInfo);
          const isOver = !!endTime;
          setConsultStatus({
            isOver,
            startTime,
            score,
            comment,
            duration: Date.now() - startTime,
          });
          if (!isOver) {
            autoRefreshDuration(1000);
            pollingIsFinished(3000);
            pollingGetConsultMessages(1000);
          }
        })
        .catch(err => console.error(err));
      setNextMessageID(res.data.isCompleted ? '' : res.data.nextReqMessageID);
      setMessages(messageList);
    });
  };

  // 点击会话侧边键时，切换或进入会话窗口：
  // 1. 获取当前聊天信息（聊天框部分）
  // 2. 获取用户信息和当前咨询状态（会话框侧边栏）
  // 3. 轮询判断当前咨询是否结束
  useEffect(() => {
    getInitMessages(
      consultConversationID,
      setConsultNextMessageID,
      setConsultMessages
    );
    return () => {
      clearInterval(durationTimerRef.current);
      clearInterval(pollingTimerRef.current);
      clearInterval(pollingGetMessagesTimerRef.current);
    };
  }, [userId]);

  // 收到新的消息时会更新全局 conversationList，若当前会话有未读消息则重新获取聊天信息，并标记已读
  // 标记已读之后重新更新 conversationList，消除侧边栏上的未读计数
  useEffect(() => {
    refreshMessage(
      consultConversationID,
      setConsultMessages,
      consultConversationRef
    );
  }, [conversationList]);

  const SideButton = ({ Icon, onClick, text, disabled = false }) => (
    <button
      style={disabled ? { pointerEvents: 'none' } : undefined}
      className="w-full py-1 flex justify-center items-center gap-4 hover:text-gray-300 active:text-gray-500"
      onClick={onClick}
    >
      <Icon style={{ fontSize: 26 }} />
      <span>{text}</span>
    </button>
  );

  return (
    <div
      className="relative mx-6 my-3 bg-white flex shadow-md"
      // style={{ minHeight: 'calc(100vh - 96px)' }}
      style={{ height: 'calc(100vh - 96px)' }}
    >
      {/* 侧边信息 */}
      <div className="w-48 p-6 flex flex-col justify-start gap-12 text-gray-50 bg-indigo-theme">
        <div className="flex items-center gap-4">
          {!!chatPersonInfo && (
            <>
              <Avatar src={chatPersonInfo.photo} size={60} />
              <div className="space-y-2">
                <p className="text-base">{chatPersonInfo.name}</p>
                <p className="text-xs">{chatPersonInfo.phone}</p>
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
                  {duration(Math.floor(consultStatus.duration / 1000))}
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="font-bold text-base">正在咨询中</p>
              <div className="space-y-1">
                <p>已咨询时间</p>
                <p className="text-3xl">
                  {duration(Math.floor(consultStatus.duration / 1000))}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="justify-self-end space-y-2">
          {consultStatus.isOver && (
            <SideButton
              Icon={IconExport}
              text="导出记录"
              onClick={handleExportRecord}
            />
          )}
        </div>
      </div>

      {/* 与咨询师的会话窗口 */}
      <ConsultConversation
        className="flex-1"
        conversationRef={consultConversationRef}
        isOver={consultStatus.isOver}
        chatPersonInfo={chatPersonInfo}
        conversationID={consultConversationID}
        messages={consultMessages}
        setMessages={setConsultMessages}
        nextReqMessageID={consultNextMessageID}
        setNextReqMessageID={setConsultNextMessageID}
        type="session"
      />

      {/* 消息同步窗口 */}
      <div className="flex-1 flex flex-col border-l">
        <div className="px-5 py-3 bg-indigo-theme">
          <h2 className="m-0 text-gray-50 text-base">用户咨询同步</h2>
        </div>
        <div
          className="flex-1 px-4 py-2 overflow-auto space-y-2"
          ref={pollingMessageRef}
        >
          {pollingMessages.map(item => {
            const { message, senderId, sendTime } = item;
            const isLeft = senderId !== Number(userId);
            const avatarUrl = isLeft ? defaultAvatarUrl : chatPersonInfo.photo;
            return (
              <ChatBubble
                key={sendTime}
                text={message}
                isLeft={isLeft}
                avatarUrl={avatarUrl}
              />
            );
          })}
        </div>
      </div>

      {/* 结束评价弹窗*/}
      {/* <CommentModal
        visible={commentModalVisible}
        onCancel={() => setCommentModalVisible(false)}
        onSubmit={submitComment}
      /> */}
    </div>
  );
}
