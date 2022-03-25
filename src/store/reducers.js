import { logout } from '../im';

const defaultState = {
  user: {
    name: '初始姓名',
    username: '',
    userID: '',
    role: 'admin',
    avatarUrl: 'http://localhost:4000/src/assets/photo.webp',
  },
  conversationList: [],
};

function loginReducer(state, action) {
  return {
    ...state,
    user: action.payload,
  };
}

function logoutReducer(state, action) {
  logout();
  return {
    ...state,
    user: {
      username: '',
      userID: '',
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
