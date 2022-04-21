import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useSelector } from 'react-redux';
import ChatBubble from './ChatBubbles';
import MessageTextArea from './MessageTextArea';
import { createMessage, sendMessage, getMessageList } from '../../../im';
import { useParams } from 'react-router-dom';
import service from '../../../service';

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
    type = 'consult',
  } = props;

  const user = useSelector(state => state.user);

  const targetUserId = useParams().userId;

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
    console.log('in consult conversation', text);

    if (!text.trim().length) {
      return;
    }

    const consultId =
      type === 'consult'
        ? Number(localStorage.getItem('message_consultId'))
        : Number(localStorage.getItem('message_sessionId'));

    console.log(
      'save message ' +
        JSON.stringify({
          consultId,
          consultType: 0,
          senderId: Number(user.userId),
          receiverId: Number(targetUserId),
          sendTime: Date.now(),
          message: text,
        })
    );

    service.appendMessage({
      consultId,
      consultType: 0,
      senderId: Number(user.userId),
      receiverId: Number(targetUserId),
      sendTime: Date.now(),
      message: text,
    });

    // 咨询师与顾客对话，督导与咨询师对话，都仅需接收 custom data，无需发送
    const newMessage = createMessage(targetUserId, text);
    sendMessage(newMessage);
    flushSync(() => {
      setMessages(preMessages => [...preMessages, newMessage]);
      if (setText) {
        setText('');
      }
    });
    conversationRef.current.lastChild.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <div
      className={'flex flex-col h-full' + ' ' + className}
      // style={{ height: 'calc(100vh - 200px)' }}
    >
      <div
        ref={conversationRef}
        className="flex-1 p-6 overflow-y-auto space-y-1.5"
        style={{ minWidth: 350 }}
        // style={{ maxHeight: 'calc(100vh - 248px)', minWidth: 350 }}
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
              avatarUrl={isLeft ? chatPersonInfo?.photo : user.avatarUrl}
              isLeft={isLeft}
            />
          );
        })}
      </div>

      {/* 信息输入框 */}
      <MessageTextArea
        onSendMessage={handleSendMessage}
        disabled={isOver}
        type="consult"
      />
    </div>
  );
}
