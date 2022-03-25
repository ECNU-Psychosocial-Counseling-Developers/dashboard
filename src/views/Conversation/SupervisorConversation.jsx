import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Avatar, Rate } from 'antd';
import { IconQuestion, IconExport } from '../../icons';
import CommentModal from './components/CommentModal';
import SelectSupervisorModal from './components/SelectSupervisorModal';
import ConsultConversation from './components/ConsultConversation';
import AskSupervisorConversation from './components/AskSupervisorConversation';
import dayjs from 'dayjs';
import { setMessageRead, getMessageList, getConversationList } from '../../im';
import { saveFileToFileSystem } from '../../utils';

// TODO: 需要满足实时显示咨询双方的消息（轮询/别的方式）
export default function Conversation() {
  const dispatch = useDispatch();
  const conversationList = useSelector(state => state.conversationList);

  const { userID } = useParams();

  const consultConversationID = sessionStorage.getItem('currentConversationID');
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
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [askStatus, setAskStatus] = useState({
    asking: !!supervisorConversationID,
    supervisorInfo: storageSupervisor
      ? JSON.parse(storageSupervisor)
      : {
          name: '',
          avatarUrl: '',
        },
  });
  const [selectModalVisible, setSelectModalVisible] = useState(false);

  const [consultMessages, setConsultMessages] = useState([]);
  const [consultNextMessageID, setConsultNextMessageID] = useState('');
  const [supervisorMessages, setSupervisorMessages] = useState([]);
  const [supervisorNextMessageID, setSupervisorNextMessageID] = useState('');

  const consultConversationRef = useRef();
  const supervisorConversationRef = useRef();
  const durationTimerRef = useRef();
  const pollingTimerRef = useRef();

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

  const pollingIsOver = interval => {
    pollingTimerRef.current = setInterval(() => {
      const consultRes = {
        data: {
          isOver: false,
          startTime: 1647883247964,
          score: 0,
          comment: `挺好的，聊得很开心。我觉得搞得挺不错的。俗话说“子曰：「學而時習之，不亦說乎？有朋自遠方來，不亦樂乎？人不知而不慍，不亦君子乎？”`,
        },
      };
      Promise.resolve(consultRes).then(res => {
        const { isOver, startTime, score, comment } = res.data;
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
          setCommentModalVisible(true);
        }
      });
    }, interval);
  };

  const selectSupervisor = () => {
    setSelectModalVisible(true);
  };

  const handleAskSuperVisor = val => {
    console.log('handleAskSuperVisor', val);
    setSelectModalVisible(false);
    // TODO: 获取咨询人信息
    const res = {
      data: {
        name: '弗洛伊德',
        avatarUrl: 'https://placekitten.com/g/50/50',
        userID: '10',
      },
    };
    Promise.resolve(res).then(res => {
      const supervisorInfo = res.data;
      setAskStatus({
        asking: true,
        supervisorInfo,
      });
      localStorage.setItem(
        consultConversationID,
        'C2C' + supervisorInfo.userID
      );
      localStorage.setItem(
        consultConversationID + '_supervisorInfo',
        JSON.stringify(res.data)
      );
    });
  };

  const handleExportRecord = () => {
    // TODO: 网络获取聊天信息、用户评价等信息
    saveFileToFileSystem('这是一个记录', '咨询记录');
  };

  const submitComment = values => {
    console.log('submit comment', values);
    setCommentModalVisible(false);
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
      setNextMessageID(res.data.isCompleted ? '' : res.data.nextReqMessageID);
      setMessages(messageList);
    });
  };

  const handleFinishAsk = () => {
    setAskStatus({
      asking: false,
    });
    localStorage.removeItem(consultConversationID);
    localStorage.removeItem(consultConversationID + '_supervisorInfo');
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
    if (supervisorConversationID && askStatus.asking) {
      getInitMessages(
        supervisorConversationID,
        setSupervisorNextMessageID,
        setSupervisorNextMessageID
      );
    }
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
        startTime: 1647883247964,
        score: 0,
        comment: `挺好的，聊得很开心。我觉得搞得挺不错的。俗话说“子曰：「學而時習之，不亦說乎？有朋自遠方來，不亦樂乎？人不知而不慍，不亦君子乎？”`,
      },
    };
    Promise.all([Promise.resolve(infoRes), Promise.resolve(consultRes)])
      .then(([{ data: infoData }, { data: consultData }]) => {
        const { isOver, startTime, score, comment } = consultData;
        setChatPersonInfo(infoData);
        setConsultStatus({
          isOver,
          startTime,
          score,
          comment,
          duration: Date.now() - startTime,
        });
        if (!isOver) {
          autoRefreshDuration(1000);
          pollingIsOver(3000);
        }
      })
      .catch(err => console.error(err));
    return () => {
      clearInterval(durationTimerRef.current);
      clearInterval(pollingIsOver.current);
    };
  }, [userID]);

  // 收到新的消息时会更新全局 conversationList，若当前会话有未读消息则重新获取聊天信息，并标记已读
  // 标记已读之后重新更新 conversationList，消除侧边栏上的未读计数
  useEffect(() => {
    refreshMessage(
      consultConversationID,
      setConsultMessages,
      consultConversationRef
    );
    if (supervisorConversationID && askStatus.asking) {
      refreshMessage(
        supervisorConversationID,
        setSupervisorMessages,
        supervisorConversationRef
      );
    }
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
          {consultStatus.isOver ? (
            <SideButton
              Icon={IconExport}
              text="导出记录"
              onClick={handleExportRecord}
            />
          ) : (
            <SideButton
              Icon={IconQuestion}
              text="请求督导"
              onClick={selectSupervisor}
              disabled={askStatus.asking}
            />
          )}
        </div>
      </div>

      {/* 与咨询者的会话窗口 */}
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
      />

      {/* 咨询督导的会话窗口 */}
      {askStatus.asking && (
        <AskSupervisorConversation
          className="flex-1"
          askStatus={askStatus}
          conversationRef={supervisorConversationRef}
          isOver={consultStatus.isOver}
          conversationID={'C2C' + askStatus.supervisorInfo.userID}
          messages={supervisorMessages}
          setMessages={setSupervisorMessages}
          nextReqMessageID={supervisorNextMessageID}
          setNextReqMessageID={setSupervisorNextMessageID}
          onFinish={handleFinishAsk}
        />
      )}

      {/* 结束评价弹窗*/}
      <CommentModal
        visible={commentModalVisible}
        onCancel={() => setCommentModalVisible(false)}
        onSubmit={submitComment}
      />

      {/* 选择咨询师弹窗 */}
      <SelectSupervisorModal
        visible={selectModalVisible}
        onCancel={() => setSelectModalVisible(false)}
        onSubmit={handleAskSuperVisor}
      />
    </div>
  );
}
