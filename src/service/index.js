import axios from 'axios';
import { Role } from '../enum';

const SERVER_HOST = 'http://101.43.247.72:8080';
axios.defaults.baseURL = SERVER_HOST;

const service = {};

// debug
window.service = service;

/* ------------------------ 用户模块 ------------------------ */

/**
 * 用户登录
 */
service.login = (username, password) => {
  const userInfo = {
    userId: '',
    role: '',
  };
  return axios.post('/user/login', { username, password }).then(res => {
    const { id: userId, role } = res.data.data;
    userInfo.userId = userId;
    userInfo.role = role;
    if (role === Role.supervisor) {
      return axios.get('/supervisor/info/' + userId).then(res => res.data.data);
    } else if (role === Role.counselor) {
      return axios.get('/counselor/info/' + userId).then(res => res.data.data);
    } else {
      return userInfo;
    }
  });
};

/**
 * 获取咨询师信息
 */
service.getCounselorInfo = counselorId => {
  return axios.get('/counselor/info/' + counselorId);
};

/**
 * 获取督导信息
 */
service.getSupervisorInfo = supervisorId => {
  return axios.get('/supervisor/info/' + supervisorId);
};

/**
 * 咨询师查询咨询记录
 * @param {{ pageSize: number; pageNumber: number; id: string, name?: string; date?: number }} params
 * @returns
 */
service.getCounselorRecord = params => {
  return axios.get('/consult/record/counseled', { params });
};

/**
 * 根据咨询 ID 查询咨询消息记录
 */
service.getConsultMessageList = consultId => {
  return axios.get('/msg/record/query', { params: { consultId } });
};

/**
 * 查询一项咨询的信息
 */
service.getConsultInfo = consultId => {
  return axios.get(`/consult/${consultId}`);
};

/**
 * 获取预约记录
 */
service.getAppointmentList = (counselorId, params) => {
  return axios.get(`/appointment/counselor/${counselorId}`, { params });
};

/**
 * 获取某一咨询师的值班安排
 */
service.getArrangementInfo = counselorId => {
  return axios.get(`/arrangement/user/${counselorId}`);
};

/**
 * 获取咨询师平均评分
 */
service.getCounselorAverageScore = counselorId => {
  return axios.get(`/consult/score/${counselorId}`);
};

/**
 * 获取咨询师当日咨询统计
 */
service.getTodayConsultStat = counselorId => {
  return axios.get(`/consult/stat/today/${counselorId}`);
};

/**
 * 获取当日所有咨询统计
 */
service.getTodayAllConsultStat = () => {
  return axios.get('/consult/stat/today');
};

/**
 * 获取指定时间段的咨询量总数
 * @param {{ startTime: number; endTime: number }} params
 */
service.getConsultCount = params => {
  return axios.get('/consult/count', { params });
};

/**
 * 当月咨询数量排行
 */
service.getCounselorMonthCountRank = () => {
  return axios.get('/consult/count/rank');
};

/**
 * 当月评分排行
 */
service.getCounselorMonthScoreRank = () => {
  return axios.get('/consult/score/rank');
};

/**
 * 当前咨询数
 */
service.getCurrentConsultCount = userId => {
  return axios.get('/consult/now/count', { params: { userId } });
};

/**
 * 获取所有排班信息
 */
service.getAllArrangement = () => {
  return axios.get('/arrangement/all');
};

/**
 * 获取在线督导
 */
service.getOnlineSupervisor = () => {
  return axios.get('/supervisor/online');
};

/**
 * 查询某天值班的咨询师
 */
service.getOnDutyCounselor = dutyDay => {
  return axios.get('/counselor/onduty', { params: { dutyDay } });
};

/**
 * 查询某天值班的督导
 */
service.getOnDutySupervisor = dutyDay => {
  return axios.get('/supervisor/onduty', { params: { dutyDay } });
};

/**
 * 分页查询所有用户咨询历史记录
 * @param {{ pageSize: number; pageNumber: number; name?: string; startTime?: number, endTime?: number }} params
 */
service.getAllConsultRecord = params => {
  return axios.get('/consult/record/counsel/all', { params });
};

/**
 * 管理员获取当前咨询数
 */
service.getAdminConsultCount = userId => {
  return axios.get('/consult/now/count/admin', { params: { userId } });
};

/**
 * 删除某日值班人员
 */
service.deleteArrangement = (dutyDay, id) => {
  return axios.post('/arrangement/user/day/delete', {
    dutyDay,
    id,
  });
};

/**
 * 获取某天不值班的咨询师
 */
service.getOffDutyCounselor = dutyDay => {
  return axios.get('/counselor/offduty', { params: { dutyDay } });
};

/**
 * 获取某天不值班的督导
 */
service.getOffDutySupervisor = dutyDay => {
  return axios.get('/supervisor/offduty', { params: { dutyDay } });
};

/**
 * 添加排班
 */
service.createArrangement = (
  counselorId,
  dutyDay,
  role,
  startTime,
  endTime
) => {
  return axios.post('/arrangement/create', {
    counselorId,
    dutyDay,
    role,
    startTime,
    endTime,
  });
};

/**
 * 修改用户排班
 */
service.modifyArrangement = payload => {
  return axios.post('/arrangement/modify', payload);
};

/**
 * 分页获取咨询师信息
 * @param {{ pageSize: number; pageNumber: number; name?: string; }} params
 */
service.getCounselorList = params => {
  return axios.get('/counselor/query', { params });
};

/**
 * 分页获取督导信息
 * @param {{ pageSize: number; pageNumber: number; name?: string; }} params
 */
service.getSupervisorList = params => {
  return axios.get('/supervisor/query', { params });
};

/**
 * 创建咨询师
 */
service.createCounselor = payload => {
  return axios.post('/counselor/create', payload);
};

/**
 * 修改咨询师或督导信息
 */
service.modifyCounselor = (role, payload) => {
  if (role === Role.counselor) {
    return axios.post('/counselor/modify', payload);
  } else {
    return axios.post('/supervisor/modify', payload);
  }
};

/**
 * 创建督导
 */
service.createSupervisor = payload => {
  return axios.post('/supervisor/create', payload);
};

/**
 * 分页获取用户信息
 */
service.getCustomerList = params => {
  return axios.get('/customer/query', { params });
};

/**
 * 拉黑用户
 */
service.blackCustomer = userId => {
  return axios.post(`/customer/black/on/${userId}`);
};

/**
 * 解除拉黑用户
 */
service.unblackCustomer = userId => {
  return axios.post(`/customer/black/off/${userId}`);
};

/**
 * 上传图片
 */
service.uploadImage = file => {
  const formData = new FormData();
  formData.append('file', file);
  return axios({
    url: '/file/upload',
    method: 'POST',
    headers: { 'content-type': 'multipart/form-data' },
    data: formData,
  });
};

export default service;
