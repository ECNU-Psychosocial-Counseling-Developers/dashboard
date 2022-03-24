import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useSelector } from 'react-redux';
import ChatBubble from './ChatBubbles';
import MessageTextArea from './MessageTextArea';
import { createMessage, sendMessage, getMessageList } from '../../../im';

export default function ConsultConversation(props) {
  const {
    className,
    conversationID,
    chatPersonInfo,
    conversationRef,
    isOver,
    messages,
    setMessages,
    nextReqMessageID,
    setNextReqMessageID,
  } = props;

  const user = useSelector(state => state.user);

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
    conversationRef.current.lastChild.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <div className={'flex flex-col' + ' ' + className}>
      <div
        ref={conversationRef}
        className="flex-1 p-6 overflow-y-auto space-y-1.5"
        style={{ maxHeight: 'calc(100vh - 248px)', minWidth: 350 }}
      >
        {!!nextReqMessageID && (
          <div className="text-center mb-3">
            <button className="text-xs text-blue-400" onClick={getMoreMessages}>
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
      <MessageTextArea onSendMessage={handleSendMessage} disabled={isOver} />
    </div>
  );
}
