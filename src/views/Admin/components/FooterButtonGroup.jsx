export default function FooterButtonGroup(props) {
  const { onCancel, onOk } = props;
  return (
    <div className="flex justify-end gap-3">
      <button
        className="px-6 py-2 bg-green-theme bg-opacity-50"
        onClick={onCancel}
      >
        取消
      </button>
      <button className="px-6 py-2 bg-green-theme text-gray-50" onClick={onOk}>
        确定
      </button>
    </div>
  );
}
