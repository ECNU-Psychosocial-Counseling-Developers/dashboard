import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Avatar, Input } from 'antd';
import IconDone from '../icons/IconDone';

const { TextArea } = Input;

const chatMessage = [
  { userID: '01', text: '你好吗？' },
  { userID: '02', text: '我很好' },
];

function ChatBubble(props) {
  const { text, isLeft, avatarUrl } = props;
  const colorClass = isLeft
    ? 'bg-white border'
    : 'bg-green-theme text-gray-100';
  const avatar = (
    <Avatar className="flex-shrink-0 select-none" size={36} src={avatarUrl} />
  );

  return (
    <div className={`flex gap-4 ${isLeft ? 'justify-start' : 'justify-end'}`}>
      {isLeft && avatar}
      <div className="relative">
        {isLeft ? (
          <div className="absolute left-0 border-l border-b w-2 h-2 origin-top-left rotate-45 bg-white translate-y-3"></div>
        ) : (
          <div className="absolute right-0 w-2 h-2 origin-top-right -rotate-45 bg-green-theme translate-y-3"></div>
        )}
        <div
          className={`inline-block whitespace-pre-wrap p-2 rounded ${colorClass}`}
          style={{ overflowWrap: 'anywhere' }}
        >
          {text}
        </div>
      </div>
      {!isLeft && avatar}
    </div>
  );
}

export default function Conversation() {
  const user = useSelector(state => state.user);
  const conversation = useSelector(state => state.conversation);
  const { userID } = useParams();

  const [messages, setMessages] = useState(chatMessage);
  const [text, setText] = useState('');

  const conversationWindowRef = useRef();

  const currentPerson = conversation.onlinePeople.find(
    person => person.userID === userID
  );

  const handleSendMessage = () => {
    if (!text.trim().length) {
      return;
    }
    setMessages(preMessages => [
      ...preMessages,
      {
        userID: user.userID,
        text,
      },
    ]);
    setText('');
    setTimeout(() => {
      conversationWindowRef.current.scrollTop =
        conversationWindowRef.current.scrollHeight -
        conversationWindowRef.current.clientHeight;
    }, 0);
  };

  const handleMessageKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className="mx-6 my-3 bg-white flex shadow-md"
      style={{ minHeight: 'calc(100vh - 96px)' }}
    >
      {/* 侧边信息 */}
      <div className="w-48 p-6 flex flex-col justify-between text-gray-50 bg-indigo-theme">
        <div className="flex items-center gap-4">
          <Avatar src={currentPerson.avatarUrl} size={60} />
          <div className="space-y-2">
            <p className="text-base">{currentPerson.name}</p>
            <p className="text-xs">{currentPerson.phoneNumber}</p>
          </div>
        </div>

        <div>
          <button className="px-6 py-1 flex justify-center items-center gap-4 hover:bg-gray-600">
            <IconDone style={{ fontSize: 30 }} />
            <span>请求督导</span>
          </button>
          <button className="flex">结束咨询</button>
        </div>
      </div>

      {/* 会话窗口 */}
      <div className="flex-1 flex flex-col">
        <div
          ref={conversationWindowRef}
          className="flex-1 p-6 overflow-y-auto space-y-1.5"
          style={{ maxHeight: 500, minWidth: 350 }}
        >
          {messages.map((message, index) => (
            <ChatBubble
              key={index}
              text={message.text}
              avatarUrl={
                message.userID === user.userID
                  ? user.avatarUrl
                  : currentPerson.avatarUrl
              }
              isLeft={message.userID !== user.userID}
            />
          ))}
        </div>
        <div className="h-6 bg-gray-200"></div>
        <div className="h-32 flex flex-col bg-gray-100 border">
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
