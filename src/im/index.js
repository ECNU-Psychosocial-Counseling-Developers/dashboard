import TIM from 'tim-js-sdk';
import { genTestUserSig } from './lib';

const AppID = 1400645946;
const AppKey =
  '9e4b241e186fb6eeedf5f96f196491b052780adfe1143a905c402441c94ffb72';

const options = {
  SDKAppID: AppID,
};

const tim = TIM.create(options);

tim.setLogLevel(0);

function login(userID) {
  return tim.login({
    userID,
    userSig: genTestUserSig(userID).userSig,
  });
}

function logout() {
  return tim.logout();
}

function sendMessage(to, text) {
  const message = tim.createTextMessage({
    to,
    conversationType: TIM.TYPES.CONV_C2C,
    payload: {
      text,
    },
  });
  return tim.sendMessage(message);
}

function handleReceived(e) {
  console.log('message_receive', e);
}

tim.on(TIM.EVENT.MESSAGE_RECEIVED, handleReceived);

export { tim, TIM, AppID, AppKey, sendMessage, login, logout };
