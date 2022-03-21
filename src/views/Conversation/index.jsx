import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Avatar } from 'antd';
import { IconDone, IconQuestion } from '../../icons';
import ChatBubble from './ChatBubbles';
import MessageTextArea from './MessageTextArea';

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

  const conversationWindowRef = useRef();

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

  useEffect(() => {
    getMessageList({ conversationID }).then(res => {
      const messageList = res.data.messageList;
      setNextReqMessageID(
        res.data.isCompleted ? '' : res.data.nextReqMessageID
      );
      setMessages(messageList);
    });

    // TODO: 通过 userID 获取当前聊天对象的信息
    const res = {
      data: {
        name: '牡丹' + userID,
        phoneNumber: '133****4322',
        avatarUrl: 'https://placekitten.com/g/100/100',
      },
    };
    Promise.resolve(res).then(res => {
      const personInfo = res.data;
      setChatPersonInfo(personInfo);
    });
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
      <div className="w-48 p-6 flex flex-col justify-between text-gray-50 bg-indigo-theme">
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

        <div className="space-y-2">
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
