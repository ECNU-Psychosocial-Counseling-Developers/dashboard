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

export default function Conversation() {
  const dispatch = useDispatch();
  const conversationList = useSelector(state => state.conversationList);
  const user = useSelector(state => state.user);

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
    if (ref.current.lastChild) {
      ref.current.lastChild.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  const refreshDuration = () => {
    setConsultStatus(preStatus => {
      console.log('preStatus', preStatus);
      return {
        ...preStatus,
        duration: Date.now() - preStatus.startTime,
      };
    });
  };

  const autoRefreshDuration = interval => {
    // refreshDuration();
    // console.log('?????????', interval);
    // durationTimerRef.current = setInterval(() => {
    //   console.log('duration');
    //   refreshDuration();
    // }, interval);
    durationTimerRef.current = setInterval(refreshDuration, interval);
    // console.log('interval duration ref', durationTimerRef.current);
  };

  const pollingIsFinished = interval => {
    pollingTimerRef.current = setInterval(() => {
      service
        .getConsultInfo(Number(localStorage.getItem('message_consultId')))
        .then(res => {
          if (res.data.code !== 200) {
            console.error('Failed to polling isFinished');
            return;
          }
          // console.log('polling is over', res.data.data);
          const { startTime, endTime, score, comment } = res.data.data;
          const isFinished = !!endTime;
          console.log('isFinished', isFinished, durationTimerRef.current);
          if (isFinished) {
            console.log(
              'clear',
              durationTimerRef.current,
              pollingTimerRef.current
            );
            clearInterval(durationTimerRef.current);
            clearInterval(pollingTimerRef.current);
            localStorage.removeItem(consultConversationID);
            localStorage.removeItem(consultConversationID + '_supervisorInfo');
            setConsultStatus({
              isOver: isFinished,
              startTime,
              score,
              comment,
              duration: endTime ? endTime - startTime : Date.now() - startTime,
            });
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

    service.getSupervisorInfo(val).then(res => {
      console.log(res.data.data);
      const supervisorInfo = res.data.data;

      // ?????????????????????????????????????????? session
      service
        .createSession({
          bindConsultId: Number(localStorage.getItem('message_consultId')),
          counselId: Number(user.userId),
          counseledId: Number(val),
          startTime: Date.now(),
        })
        .then(res => {
          if (res.data.code !== 200) {
            return;
          }
          localStorage.setItem('message_sessionId', res.data.data);

          setAskStatus({
            asking: true,
            supervisorInfo,
          });

          console.log('localStorage setItem supervisorInfo', {
            supervisorInfo,
          });
          console.log(
            'set item',
            consultConversationID,
            'C2C' + supervisorInfo.id
          );
          localStorage.setItem(
            consultConversationID,
            'C2C' + supervisorInfo.id
          );
          localStorage.setItem(
            consultConversationID + '_supervisorInfo',
            JSON.stringify(supervisorInfo)
          );
        });
    });
  };

  const handleExportRecord = () => {
    service
      .getConsultMessage(Number(localStorage.getItem('message_consultId')))
      .then(res => {
        if (res.data.code !== 200) {
          message.error('????????????????????????');
          return;
        }
        saveFileToFileSystem(JSON.stringify(res.data.data), '????????????');
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

  const getInitMessages = (
    conversationID,
    setNextMessageID,
    setMessages,
    conversationRef,
    type = 'consult'
  ) => {
    console.log('getInitMessages conversationID', conversationID, type);
    getMessageList({ conversationID }).then(res => {
      const messageList = res.data.messageList;
      console.log('messageList', messageList);
      if (type === 'consult') {
        for (let i = messageList.length - 1; i >= 0; i--) {
          if (messageList[i].cloudCustomData) {
            console.log('GET CUSTOM DATA: ', messageList[i].cloudCustomData);
            localStorage.setItem(
              'message_consultId',
              messageList[i].cloudCustomData
            );
            break;
          }
        }

        Promise.all([
          service.getCustomerInfo(userId),
          // TODO: ?????????
          service.getConsultInfo(
            Number(localStorage.getItem('message_consultId'))
          ),
        ]).then(([customerRes, consultRes]) => {
          console.log('get init message', customerRes, consultRes);
          if (customerRes.data.code !== 200 || consultRes.data.code !== 200) {
            message.error('??????????????????');
            console.error('Failed to get init consult info');
            return;
          }
          const customerInfo = {
            ...customerRes.data.data,
            photo:
              customerRes.data.data.photo || 'https://placekitten.com/100/100',
          };

          console.log('??????????????????', consultRes.data.data);

          const { startTime, endTime, score, comment } = consultRes.data.data;

          setChatPersonInfo(customerInfo);
          const isOver = !!endTime;
          setConsultStatus({
            isOver,
            startTime,
            score,
            comment,
            duration: endTime ? endTime - startTime : Date.now() - startTime,
          });
          console.log('over ??? ??????', isOver);
          if (!isOver) {
            autoRefreshDuration(1000);
            pollingIsFinished(3000);
          }
        });
      }
      flushSync(() => {
        setNextMessageID(res.data.isCompleted ? '' : res.data.nextReqMessageID);
        setMessages(messageList);
      });
      conversationRef.current.lastChild?.scrollIntoView();
    });
  };

  const handleFinishAsk = () => {
    setAskStatus({
      asking: false,
    });
    // ????????????????????????
    service.endConsult(Number(localStorage.getItem('message_sessionId')));
    localStorage.removeItem(consultConversationID);
    localStorage.removeItem(consultConversationID + '_supervisorInfo');
  };

  // ?????????????????????????????????????????????????????????
  // 1. ?????????????????????????????????????????????
  // 2. ???????????????????????????????????????????????????????????????
  // 3. ????????????????????????????????????
  useEffect(() => {
    getInitMessages(
      consultConversationID,
      setConsultNextMessageID,
      setConsultMessages,
      consultConversationRef,
      'consult'
    );
    if (supervisorConversationID && askStatus.asking) {
      console.log('supervisor conversation on', supervisorConversationID);
      getInitMessages(
        supervisorConversationID,
        setSupervisorNextMessageID,
        setSupervisorMessages,
        supervisorConversationRef,
        'session'
      );
    }

    return () => {
      clearInterval(durationTimerRef.current);
      clearInterval(pollingIsFinished.current);
    };
  }, [userId]);

  useEffect(() => {
    return () => {
      clearInterval(durationTimerRef.current);
      clearInterval(pollingIsFinished.current);
    };
  }, []);

  // ???????????????????????????????????? conversationList??????????????????????????????????????????????????????????????????????????????
  // ?????????????????????????????? conversationList????????????????????????????????????
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
      style={{ height: 'calc(100vh - 96px)' }}
    >
      {/* ???????????? */}
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
              <p className="font-bold text-base">???????????????</p>
              <div className="space-y-1">
                <p>????????????</p>
                <p className="text-3xl">
                  {duration(Math.floor(consultStatus.duration / 1000))}
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="font-bold text-base">???????????????</p>
              <div className="space-y-1">
                <p>???????????????</p>
                <p className="text-3xl">
                  {duration(Math.floor(consultStatus.duration / 1000))}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="justify-self-end space-y-2">
          {consultStatus.isOver ? (
            <SideButton
              Icon={IconExport}
              text="????????????"
              onClick={handleExportRecord}
            />
          ) : (
            <SideButton
              Icon={IconQuestion}
              text="????????????"
              onClick={selectSupervisor}
              disabled={askStatus.asking}
            />
          )}
        </div>
      </div>

      {/* ??????????????????????????? */}
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

      {/* ??????????????????????????? */}
      {askStatus.asking && (
        <AskSupervisorConversation
          className="flex-1"
          askStatus={askStatus}
          conversationRef={supervisorConversationRef}
          isOver={consultStatus.isOver}
          conversationID={'C2C' + askStatus.supervisorInfo.userId}
          messages={supervisorMessages}
          setMessages={setSupervisorMessages}
          nextReqMessageID={supervisorNextMessageID}
          setNextReqMessageID={setSupervisorNextMessageID}
          onFinish={handleFinishAsk}
        />
      )}

      {/* ????????????????????? */}
      <SelectSupervisorModal
        visible={selectModalVisible}
        onCancel={() => setSelectModalVisible(false)}
        onSubmit={handleAskSuperVisor}
      />
    </div>
  );
}
