import TIM from 'tim-js-sdk';
import { genTestUserSig } from './lib';

const AppID = 1400645946;
const AppKey =
  '9e4b241e186fb6eeedf5f96f196491b052780adfe1143a905c402441c94ffb72';

const options = {
  SDKAppID: AppID,
};

const tim = TIM.create(options);

// debug
window.timInstance = tim;

tim.setLogLevel(1);

const timState = {
  receiveCallback: null,
  isReady: false,
};

function login(userID) {
  return tim.login({
    userID: userID,
    userSig: genTestUserSig(userID).userSig,
  });
}

function logout() {
  timState.isReady = false;
  return tim.logout();
}

function createMessage(userID, text, cloudCustomData) {
  return tim.createTextMessage({
    to: userID,
    conversationType: TIM.TYPES.CONV_C2C,
    payload: {
      text,
    },
    cloudCustomData,
  });
}

function createCustomMessage(userID, payload) {
  return tim.createTextMessage({
    to: userID,
    conversationType: TIM.TYPES.CONV_C2C,
    payload: {
      data: payload,
    },
  });
}

function sendMessage(message) {
  if (!timState.isReady) {
    console.error('tim isReady = false');
    return;
  }
  if (timState.isReady) {
    return tim.sendMessage(message);
  }
}

function handleReceived(e) {
  if (timState.receiveCallback) {
    timState.receiveCallback(e);
  }
}

// https://cloud.tencent.com/document/product/269/37448#.E8.8E.B7.E5.8F.96.E6.9F.90.E4.BC.9A.E8.AF.9D.E7.9A.84.E6.B6.88.E6.81.AF.E5.88.97.E8.A1.A8
function getMessageList(options) {
  return tim.getMessageList(options);
}

function setMessageRead(options) {
  return tim.setMessageRead(options);
}

function getConversationList() {
  return tim.getConversationList();
}

function deleteConversation(conversationID) {
  return tim.deleteConversation(conversationID);
}

tim.on(TIM.EVENT.SDK_READY, () => (timState.isReady = true));
tim.on(TIM.EVENT.MESSAGE_RECEIVED, handleReceived);
// tim.on(TIM.EVENT.CONVERSATION_LIST_UPDATED, function (event) {
//   // 收到会话列表更新通知，可通过遍历 event.data 获取会话列表数据并渲染到页面
//   // event.name - TIM.EVENT.CONVERSATION_LIST_UPDATED
//   // event.data - 存储 Conversation 对象的数组 - [Conversation]
//   console.log('conversation list update', event);
// });

export {
  AppID,
  AppKey,
  createMessage,
  createCustomMessage,
  deleteConversation,
  getConversationList,
  getMessageList,
  login,
  logout,
  sendMessage,
  setMessageRead,
  TIM,
  timState,
};
