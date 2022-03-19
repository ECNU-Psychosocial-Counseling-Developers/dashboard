import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Avatar, Input } from 'antd';
import { IconDone, IconEmoji, IconQuestion } from '../icons';
import { emojiNameUrlMap } from '../utils';

const { TextArea } = Input;

// Demo Messages
const chatMessage = [
  { userID: '01', text: '你好吗？' },
  { userID: '02', text: '我很好[啊]\n[滑稽]哈哈' },
];

function replaceEmojiTextToUrl(text) {
  const reg = /\[(.*?)\]/g;
  const replaceTarget = [];
  let execResult;
  while ((execResult = reg.exec(text))) {
    replaceTarget.push({
      startIndex: execResult.index,
      endIndex: execResult.index + execResult[0].length,
      content: execResult[1],
    });
  }

  const renderResult = [];
  let lastEndIndex = 0;
  let nextStartIndex = 0;
  replaceTarget.forEach(({ startIndex, endIndex, content }) => {
    nextStartIndex = startIndex;
    const textFrag = text.slice(lastEndIndex, nextStartIndex);
    if (textFrag) {
      renderResult.push(textFrag);
    }
    const emojiImageUrl = emojiNameUrlMap[content];
    if (emojiImageUrl) {
      renderResult.push(
        <img
          className="inline-block w-6"
          key={startIndex}
          src={emojiImageUrl}
          alt={`[${content}]`}
          draggable={false}
        />
      );
    } else {
      renderResult.push(`[${content}]`);
    }
    lastEndIndex = endIndex;
  });
  renderResult.push(text.slice(lastEndIndex));
  return <>{renderResult}</>;
}

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
          {replaceEmojiTextToUrl(text)}
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
  const [emojiBoxVisible, setEmojiBoxVisible] = useState(false);

  const conversationWindowRef = useRef();
  const emojiBoxRef = useRef();
  const textareaRef = useRef();

  const currentPerson = conversation.onlinePeople.find(
    person => person.userID === userID
  );

  const handleSendMessage = () => {
    if (!text.trim().length) {
      return;
    }
    flushSync(() => {
      setMessages(preMessages => [
        ...preMessages,
        {
          userID: user.userID,
          text,
        },
      ]);
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

  useEffect(() => {
    window.addEventListener('click', clickOutsideEmojiBox);
    return () => {
      window.removeEventListener('click', clickOutsideEmojiBox);
    };
  }, []);

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
            {Object.keys(emojiNameUrlMap).map(key => (
              <button onClick={() => handleClickEmoji(`[${key}]`)}>
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
