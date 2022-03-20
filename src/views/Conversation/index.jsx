import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Avatar, Input } from 'antd';
import { IconDone, IconEmoji, IconQuestion } from '../../icons';
import ChatBubble from './ChatBubbles';
import { emojiNameUrlMap } from '../../utils';

import {
  createMessage,
  sendMessage,
  setMessageRead,
  getMessageList,
  getConversationList,
} from '../../im';

const { TextArea } = Input;

export default function Conversation() {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const conversationList = useSelector(state => state.conversationList);

  const { userID } = useParams();

  const conversationID = sessionStorage.getItem('currentConversationID');

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [emojiBoxVisible, setEmojiBoxVisible] = useState(false);
  const [chatPersonInfo, setChatPersonInfo] = useState(null);
  const [nextReqMessageID, setNextReqMessageID] = useState('');

  const conversationWindowRef = useRef();
  const emojiBoxRef = useRef();
  const textareaRef = useRef();

  const handleSendMessage = () => {
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
    conversationWindowRef.current.lastChild.scrollIntoView({
      behavior: 'smooth',
    });
  };

  const handleMessageKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClickEmoji = emoji => {
    setText(prevText => prevText + emoji);
    setEmojiBoxVisible(false);
    textareaRef.current.focus();
  };

  const clickOutsideEmojiBox = e => {
    let element = e.target;
    while (element) {
      if (element && element === emojiBoxRef.current) {
        return;
      }
      element = element.parentElement;
    }
    setEmojiBoxVisible(false);
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
    window.addEventListener('click', clickOutsideEmojiBox);
    return () => {
      window.removeEventListener('click', clickOutsideEmojiBox);
    };
  }, []);

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
        // FIXME: how to 触发 chatItem 变化？
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
        conversationWindowRef.current.lastChild.scrollIntoView({
          behavior: 'smooth',
        });
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
        <div
          className="relative flex justify-start px-2 py-1 bg-gray-50 border-t"
          ref={emojiBoxRef}
        >
          <button
            title="表情"
            className="text-gray-700 hover:text-gray-500"
            onClick={() => setEmojiBoxVisible(visible => !visible)}
          >
            <IconEmoji style={{ fontSize: 20 }} />
          </button>
          <div
            className="absolute bottom-7 left-0 p-2 grid-cols-10 gap-1 bg-gray-50 border shadow"
            style={{
              display: emojiBoxVisible ? 'grid' : 'none',
            }}
          >
            {Object.keys(emojiNameUrlMap).map((key, index) => (
              <button key={index} onClick={() => handleClickEmoji(`[${key}]`)}>
                <img
                  className="w-7 hover:bg-gray-200 select-none"
                  src={emojiNameUrlMap[key]}
                  alt={key}
                  title={key}
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="h-32 flex flex-col bg-gray-100 border-b">
          <TextArea
            autoSize
            className="flex-1"
            style={{
              border: 'none',
              boxShadow: 'none',
              background: '#f8f8f8',
            }}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleMessageKeyDown}
            ref={textareaRef}
          />
          <div
            style={{ background: '#f8f8f8' }}
            className="px-4 py-2 flex justify-end"
          >
            <button
              className="px-4 py-1 rounded-sm text-gray-100 bg-green-theme"
              onClick={handleSendMessage}
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
