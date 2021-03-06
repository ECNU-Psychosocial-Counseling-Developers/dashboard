import { logout } from '../im';
import { Role } from '../enum';
import service from '../service';

const defaultState = {
  user: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : {
        name: '咨询师',
        username: 'zixunshi',
        userId: '',
        role: Role.counselor,
        avatarUrl: 'http://localhost:4000/src/assets/photo.webp',
      },
  conversationList: [],
};

function loginReducer(state, action) {
  localStorage.setItem('userInfo', JSON.stringify(action.payload));
  return {
    ...state,
    user: action.payload,
  };
}

function logoutReducer(state, action) {
  localStorage.removeItem('userInfo');
  const consultConversationID = localStorage.getItem('currentConversationID');
  localStorage.removeItem('currentConversationID');
  localStorage.removeItem(consultConversationID);
  localStorage.removeItem(consultConversationID + '_supervisorInfo');

  logout();

  return {
    ...state,
    user: {
      username: '',
      userId: '',
      role: '',
    },
  };
}

function receiveMessageReducer(state, action) {
  return state;
}

function getConversationListReducer(state, action) {
  return {
    ...state,
    conversationList: action.payload,
  };
}

function reducer(state = defaultState, action) {
  switch (action.type) {
    case 'user/login':
      return loginReducer(state, action);
    case 'user/update':
      return loginReducer(state, action);
    case 'user/logout':
      return logoutReducer(state, action);
    case 'conversation/get':
      return getConversationListReducer(state, action);
    case 'conversation/receiveMessage':
      return receiveMessageReducer(state, action);
    default:
      return state;
  }
}

export default reducer;
