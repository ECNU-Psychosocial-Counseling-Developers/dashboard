import { login } from '../im';

const defaultState = {
  user: {
    username: '',
    userID: '01',
    role: 'counselor',
    avatarUrl: 'http://localhost:4000/src/assets/photo.webp',
  },
  conversation: {
    onlinePeople: [
      {
        avatarUrl: 'http://localhost:4000/src/assets/photo.webp',
        name: '刘亦菲',
        userID: '02',
        phoneNumber: '187***3285',
        messageNumber: 0,
      },
      {
        avatarUrl: 'https://placekitten.com/g/200/200',
        name: '小猫🐱',
        userID: '03',
        phoneNumber: '159***9395',
        messageNumber: 2,
      },
    ],
  },
};

function loginReducer(state, action) {
  login(action.payload.userID);
  return {
    ...state,
    user: action.payload,
  };
}

function logoutReducer(state, action) {
  return {
    ...state,
    user: {
      username: '',
      userID: 0,
      role: '',
    },
  };
}

function reducer(state = defaultState, action) {
  switch (action.type) {
    case 'user/login':
      return loginReducer(state, action);
    case 'user/logout':
      return logoutReducer(state, action);
    default:
      return state;
  }
}

export default reducer;
