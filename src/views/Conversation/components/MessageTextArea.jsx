import { useState, useEffect, useRef } from 'react';
import { emojiNameUrlMap } from '../../../utils';
import { Input, message } from 'antd';
import { IconEmoji, IconImage } from '../../../icons';

const { TextArea } = Input;

export default function MessageTextArea(props) {
  const { onSendMessage, disabled, type } = props;

  const [text, setText] = useState('');
  const [emojiBoxVisible, setEmojiBoxVisible] = useState(false);

  const emojiBoxRef = useRef();
  const textareaRef = useRef();

  const handleMessageKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage(text, setText);
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

  const handleSendImage = e => {
    if (e.target.files && e.target.files.length > 0) {
      const image = e.target.files[0];
      service.uploadImage(image).then(res => {
        if (res.data.code !== 200) {
          message.error('上传失败');
        }
        const url = res.data.data;
        const text = `[${url}]`;
        onSendMessage(text);
      });
    }
  };

  useEffect(() => {
    window.addEventListener('click', clickOutsideEmojiBox);
    return () => {
      window.removeEventListener('click', clickOutsideEmojiBox);
    };
  }, []);

  return (
    <>
      <div
        className="relative flex gap-2 justify-start px-2 py-1 bg-gray-50 border-t"
        ref={emojiBoxRef}
      >
        <button
          title="表情"
          className="text-gray-700 hover:text-gray-500"
          onClick={() => setEmojiBoxVisible(visible => !visible)}
        >
          <IconEmoji style={{ fontSize: 20 }} />
        </button>
        <button title="图片" className="text-gray-700 hover:text-gray-500">
          <label className="cursor-pointer">
            <IconImage style={{ fontSize: 20 }} />
            <input
              className="hidden"
              type="file"
              name={'select-image-' + type}
              id={'select-image-' + type}
              onChange={handleSendImage}
            />
          </label>
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
          value={disabled ? '咨询已结束' : text}
          disabled={disabled}
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
            onClick={() => onSendMessage(text, setText)}
          >
            发送
          </button>
        </div>
      </div>
    </>
  );
}
