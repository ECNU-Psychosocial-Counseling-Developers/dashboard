import { Form } from 'antd';

function requireRule(label) {
  return { required: true, message: '请输入' + label };
}

export default function FormGridItem(props) {
  const { label, name, render, rules = [] } = props;
  return (
    <div className="flex-1 mb-4">
      <div className="text-xs text-indigo-theme mb-1">{label}</div>
      <Form.Item
        style={{ marginBottom: 0 }}
        name={name}
        rules={[requireRule(label), ...rules]}
      >
        {render}
      </Form.Item>
    </div>
  );
}
