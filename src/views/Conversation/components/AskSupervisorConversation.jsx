import { flushSync } from 'react-dom';
import { Avatar } from 'antd';
import ChatBubble from './ChatBubbles';
import MessageTextArea from './MessageTextArea';
import { createMessage, sendMessage, getMessageList } from '../../../im';
import { useSelector } from 'react-redux';
import service from '../../../service';

export default function AskSupervisorConversation(props) {
  const {
    className,
    askStatus,
    conversationRef,
    isOver,
    conversationID,
    messages,
    setMessages,
    nextReqMessageID,
    setNextReqMessageID,
    onFinish,
  } = props;

  const user = useSelector(state => state.user);

  const getMoreMessages = () => {
    if (!conversationID) {
      return;
    }
    console.log('get more message', nextReqMessageID);
    getMessageList({
      conversationID,
      nextReqMessageID,
    }).then(res => {
      const messageList = res.data.messageList;

      console.log(nextReqMessageID, res.data.nextReqMessageID);
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
    const targetUserId = askStatus.supervisorInfo.id.toString();

    const newMessage = createMessage(
      targetUserId,
      text,
      JSON.stringify({
        consultId: localStorage.getItem('message_consultId'),
        sessionId: localStorage.getItem('message_sessionId'),
      })
    );
    sendMessage(newMessage);

    console.log('send message to supervisor', targetUserId, text);
    // 将发出的消息存储在服务端;
    service.appendMessage({
      consultId: Number(localStorage.getItem('message_sessionId')),
      consultType: 1,
      senderId: Number(user.userId),
      receiverId: Number(askStatus.supervisorInfo.id),
      sendTime: Date.now(),
      message: text,
    });

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
    <div className={'flex flex-col border-l' + ' ' + className}>
      <div className="flex  items-center justify-between px-6 py-4 bg-indigo-theme opacity-90">
        <div className="flex items-center gap-5">
          <Avatar src={askStatus.supervisorInfo.photo} size={50} />
          <div>
            <h2 className="text-gray-50 text-xs mb-0.5 opacity-80">求助督导</h2>
            <p className="text-gray-50 text-lg">
              {askStatus.supervisorInfo.name}
            </p>
          </div>
        </div>
        <button className="text-gray-50" onClick={onFinish}>
          结束咨询
        </button>
      </div>
      <div
        ref={conversationRef}
        className="flex-1 p-6 overflow-y-auto space-y-1.5"
        style={{ maxHeight: 'calc(100vh - 330px)', minWidth: 350 }}
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
              avatarUrl={
                isLeft ? askStatus.supervisorInfo.photo : user.avatarUrl
              }
              isLeft={isLeft}
            />
          );
        })}
      </div>

      <MessageTextArea
        onSendMessage={handleSendMessage}
        disabled={isOver}
        type="session"
      />
    </div>
  );
}
