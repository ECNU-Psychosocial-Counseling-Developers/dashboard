import { useState, useEffect, useRef } from 'react';
import { Table, Form, Input, Rate, message } from 'antd';
import {
  debounce,
  duration,
  roundSemi,
  weekNumberToCharacter,
} from '../../utils';
import CreatePersonModal from './components/CreatePersonModal';
import ModifyPersonModal from './components/ModifyPersonModal';
import { Role } from '../../enum';
import service from '../../service';

export default function CounselorManage() {
  const [createPersonModalVisible, setCreatePersonModalVisible] =
    useState(false);
  const [modifyModalVisible, setModifyModalVisible] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [currentInfo, setCurrentInfo] = useState({
    avgScore: 0,
    dutyDayList: [],
    email: '',
    id: 0,
    idCardNum: '',
    job: '',
    name: '',
    phone: '',
    photo: '',
    role: '',
    state: '',
    totalCounseledCount: 0,
    totalCounseledTime: 0,
    username: '',
    workplace: '',
  });

  const getTableData = (pageNumber = 1, pageSize = 10, name) => {
    service
      .getCounselorList({
        pageNumber,
        pageSize,
        name,
      })
      .then(res => {
        if (res.data.code !== 200) {
          message.error('获取失败');
          return;
        }
        setTableData(res.data.data.counselorList);
        setTotalCount(res.data.data.totalCount);
      });
  };

  const handleSearchFromChange = (_, allValues) => {
    const { name } = allValues;
    getTableData(1, 10, name);
  };

  const handlePageNumberChange = (pageNumber, pageSize) => {
    getTableData(pageNumber, pageSize);
  };

  const handleCreateNewCounselor = values => {
    const payload = {
      username: values.createUsername,
      password: values.createPassword,
      name: values.name,
      phone: values.phoneNumber,
      email: values.email,
      workplace: values.department,
      job: values.title,
      idCardNum: values.IDNumber,
    };

    service.createCounselor(payload).then(res => {
      if (res.data.code !== 200) {
        message.error('创建失败');
      }
      getTableData(1, 10);
      message.success('创建成功');
    });
  };

  const handleModifyCounselor = (id, type, dutyDayList, info) => {
    const {
      id: counselorId,
      name,
      phone,
      email,
      desc,
      photo,
      workplace,
      job,
      idCardNum,
    } = info;
    Promise.all([
      service.modifyCounselor({
        id: counselorId,
        name,
        phone: phone ?? '',
        email: email ?? '',
        desc: desc || '',
        photo: photo || '',
        workplace: workplace || '',
        job: job || '',
        idCardNum: idCardNum || '',
      }),
      service.modifyArrangement({
        id,
        arrangementList: dutyDayList.map(dutyDay => ({
          counselorId: id,
          dutyDay,
          role: type === 'counselor' ? Role.counselor : Role.supervisor,
          startTime: '09:00:00',
          endTime: '17:00:00',
        })),
      }),
    ]).then(([infoRes, arrangementRes]) => {
      if (infoRes.data.code !== 200 || arrangementRes.data.code !== 200) {
        message.error('修改失败');
        return;
      }
      getTableData(1, 10);
    });
  };

  useEffect(() => {
    getTableData(1, 10);
  }, []);

  const tableColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '身份',
      dataIndex: 'role',
      key: 'role',
      render: role => (role === Role.counselor ? '咨询师' : '管理员'),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '总咨询数',
      dataIndex: 'totalCounseledCount',
      key: 'totalCounseledCount',
    },
    {
      title: '咨询总时长',
      dataIndex: 'totalCounseledTime',
      key: 'totalCounseledTime',
      render: seconds => duration(seconds),
    },
    {
      title: '平均咨询评级',
      dataIndex: 'avgScore',
      key: 'avgScore',
      render: rate => (
        <Rate disabled defaultValue={roundSemi(rate)} allowHalf />
      ),
    },
    {
      title: '周值班安排',
      dataIndex: 'dutyDayList',
      key: 'dutyDayList',
      render: dayList =>
        dayList.map(day => `周${weekNumberToCharacter[day]}`).join(', '),
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record) => (
        <button
          className="px-6 py-2 bg-green-theme text-gray-50 text-xs rounded-sm"
          onClick={() => {
            setCurrentInfo(record);
            setModifyModalVisible(true);
          }}
        >
          修改
        </button>
      ),
    },
  ];

  return (
    <div className="mx-4 my-2">
      <div className="flex justify-between items-center">
        <Form
          layout="inline"
          colon={false}
          onValuesChange={debounce(handleSearchFromChange, 500)}
        >
          <div>
            <div className="mb-1 text-xs text-indigo-900">搜索姓名</div>
            <Form.Item name="name">
              <Input placeholder="输入姓名进行搜索" />
            </Form.Item>
          </div>
        </Form>
        <button
          className="px-6 py-2 bg-green-theme text-gray-50 rounded-sm"
          onClick={() => setCreatePersonModalVisible(true)}
        >
          新增咨询师
        </button>
      </div>
      <Table
        className="mt-2"
        rowKey={record => record.name + record.duration + Math.random()}
        size="small"
        columns={tableColumns}
        pagination={{
          size: 'default',
          defaultCurrent: 1,
          total: totalCount,
          defaultPageSize: 10,
          showSizeChanger: false,
          onChange: handlePageNumberChange,
        }}
        dataSource={tableData}
      />

      <CreatePersonModal
        visible={createPersonModalVisible}
        onCancel={() => setCreatePersonModalVisible(false)}
        onSuccess={handleCreateNewCounselor}
        type="counselor"
      />

      <ModifyPersonModal
        visible={modifyModalVisible}
        onCancel={() => setModifyModalVisible(false)}
        currentInfo={currentInfo}
        type="counselor"
        onFinish={handleModifyCounselor}
      />
    </div>
  );
}
