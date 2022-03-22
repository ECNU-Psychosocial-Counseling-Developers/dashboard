const emojiModules = import.meta.globEager('./assets/emoji-images/*.webp');

/**
 * 聊天文本替换为图片 url
 */
const emojiNameUrlMap = {};

for (let path in emojiModules) {
  const url = emojiModules[path].default;
  const reg = /\/([^/]*)\.webp$/;
  let regResult;
  let key;
  if ((regResult = reg.exec(url))) {
    key = regResult[1];
  }
  if (key) {
    emojiNameUrlMap[key] = url;
  }
}

/**
 * 防抖
 */
function debounce(callback, delay) {
  let delayId = null;
  return function (...args) {
    if (delayId !== null) {
      // 已经有一个定时器在跑了
      clearTimeout(delayId);
    }
    delayId = setTimeout(() => {
      callback.apply(this, args);
      delayId = null;
    }, delay);
  };
}

/**
 * 保存文本为文件
 */
async function saveFileToFileSystem(content, suggestedName) {
  const options = {
    suggestedName,
    types: [
      {
        description: 'Text Files',
        accept: { 'text/plain': ['.txt'] },
      },
    ],
  };
  const fileHandle = await window.showSaveFilePicker(options);
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

export { debounce, emojiNameUrlMap, saveFileToFileSystem };
