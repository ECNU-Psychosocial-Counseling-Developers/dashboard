import { Avatar } from 'antd';
import { emojiNameUrlMap } from '../../../utils';

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

export default function ChatBubble(props) {
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
