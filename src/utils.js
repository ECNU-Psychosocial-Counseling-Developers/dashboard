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

/**
 * 计算时长并以 HH:mm:ss 的格式返回
 */
function duration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
}

/**
 * 以 0.5 为精度四舍五入
 */
function roundSemi(number) {
  const left = Math.floor(number);
  const right = Math.ceil(number);
  const mid = left + 0.5;
  if (number >= mid) {
    return number - mid < right - number ? mid : right;
  } else {
    return mid - number > number - mid ? left : mid;
  }
}

/**
 * 数字映射为星期文字
 */
const weekNumberToCharacter = {
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
  7: '日',
};

export {
  debounce,
  emojiNameUrlMap,
  saveFileToFileSystem,
  duration,
  roundSemi,
  weekNumberToCharacter,
};
