import dayjs from 'dayjs';

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
        description: 'JSON File',
        accept: { 'application/json': ['.json'] },
      },
      {
        description: 'Text File',
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
  0: '日',
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
  7: '日',
};

/**
 * 登陆时返回的用户信息转化为本地 userInfo
 */
function UserResToUserInfo(data) {
  return {
    avatarUrl: data.photo,
    desc: data.desc,
    email: data.email,
    idCardNum: data.idCardNum,
    job: data.job,
    name: data.name,
    phoneNumber: data.phone,
    role: data.role,
    state: data.state,
    userId: data.id,
    username: data.username,
    workplace: data.workplace,
  };
}

/**
 * 咨询记录 response 转表格 tableData 格式
 */
function consultResponseToTableRow(res) {
  return res.data.data.consultVOList.map(item => {
    const { counselId, id, startTime, endTime, score, comment, counselName } =
      item;
    return {
      consumer: counselName,
      duration: Math.floor((endTime - startTime) / 1000),
      date: startTime,
      comment,
      score,
      consultId: id,
    };
  });
}

/**
 * 所有咨询记录
 */
function allConsultResponseToTableRow(res) {
  return res.data.data.consultVOList.map(item => {
    const {
      id,
      startTime,
      supervisorName,
      endTime,
      score,
      comment,
      counselName,
    } = item;
    return {
      consultId: id,
      consumer: counselName,
      supervisor: supervisorName,
      duration: Math.floor((endTime - startTime) / 1000),
      date: startTime,
      comment,
      score,
    };
  });
}

/**
 * 将值班信息 response 转 dutyInfo 格式
 */
function arrangementResponseToDutyList(res) {
  return res.data.data.arrangementList.map(info => {
    return {
      dutyDay: info.dutyDay,
      startTime: info.startTime,
      endTime: info.endTime,
    };
  });
}

/**
 * 根据 dutyList 数据返回本月应该值班天数
 */
function getMonthTotalDutyDay(dutyDayList) {
  const firstDay = dayjs().date(1).day();
  const daysInMonth = dayjs().daysInMonth();
  const dateGrid = new Array(35).fill(-1);
  for (let i = firstDay - 1, date = 1; i <= daysInMonth; i++) {
    dateGrid[i] = date++;
  }
  let cnt = 0;
  dateGrid.forEach((date, index) => {
    const weekDay = (index % 7) + 1;
    if (date > -1 && dutyDayList.includes(weekDay)) {
      cnt++;
    }
  });
  return cnt;
}

export {
  arrangementResponseToDutyList,
  consultResponseToTableRow,
  debounce,
  duration,
  emojiNameUrlMap,
  getMonthTotalDutyDay,
  roundSemi,
  saveFileToFileSystem,
  weekNumberToCharacter,
  UserResToUserInfo,
  allConsultResponseToTableRow,
};
