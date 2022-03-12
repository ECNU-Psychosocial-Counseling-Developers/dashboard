import axios from 'axios';

const SERVER_HOST = 'http://localhost:8080';
axios.defaults.baseURL = SERVER_HOST;

const service = {};

/**
 * 咨询师查询咨询记录
 */
service.getCounselorRecord = params => {
  return axios.get('/counselor-record', { params });
};

export default service;
