import { Form, Input, Select, Modal } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

export default function CommentModal(props) {
  const { visible, onCancel, onSubmit } = props;

  const formItemRule = [{ required: true, message: '必填信息' }];

  return (
    <Modal
      visible={visible}
      title={false}
      footer={false}
      onCancel={onCancel}
      className="p-8"
      closable={false}
    >
      <div className="px-6 pt-4">
        <h2 className="text-xl mb-1">本次咨询已结束，请评价</h2>
        <p className="mb-4 text-xs text-green-600 opacity-90">
          为这次心理咨询做出评价
        </p>
        <Form className="mt-8" colon={false} onFinish={onSubmit}>
          <div>
            <p className="mb-1.5">咨询类型</p>
            <Form.Item name="type" rules={formItemRule}>
              <Select>
                <Option value="type1">类型1</Option>
                <Option value="type2">类型2</Option>
                <Option value="type3">类型3</Option>
              </Select>
            </Form.Item>
          </div>
          <div>
            <p className="mb-1.5">评价</p>
            <Form.Item name="comment" className="flex-1" rules={formItemRule}>
              <TextArea autoSize={{ minRows: 4, maxRows: 4 }} />
            </Form.Item>
          </div>
          <Form.Item>
            <div className="flex justify-end gap-4">
              <button
                type="submit"
                className="px-6 py-1.5 bg-green-theme text-gray-50"
              >
                确认
              </button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
