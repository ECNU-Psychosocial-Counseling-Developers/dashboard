import { useEffect, useState } from 'react';

function MultiplyRadioGroup(props) {
  const {
    options,
    className,
    unCheckedClassName,
    checkedClassName,
    onChange,
    initialValue,
  } = props;

  const [activeValue, setActiveValue] = useState([]);

  useEffect(() => {
    setActiveValue(initialValue);
  }, [initialValue]);

  const handleChange = e => {
    const value = Number(e.target.value);
    // FIXME: 有时候点击 label，DOM 的 checked 没有变化，因此此处采用 indexOf 判断
    const newValue =
      activeValue.indexOf(value) === -1
        ? [...activeValue, value]
        : activeValue.filter(v => v !== value);
    setActiveValue(newValue);
    onChange(newValue);
  };

  return (
    <div className={className}>
      {options.map((option, index) => (
        <label
          key={index}
          className={
            activeValue.indexOf(option.value) >= 0
              ? checkedClassName
              : unCheckedClassName
          }
        >
          <input
            type="checkbox"
            value={option.value}
            className="hidden"
            onChange={handleChange}
          />
          {option.content}
        </label>
      ))}
    </div>
  );
}

function SingleRadioGroup(props) {
  const {
    options,
    className,
    unCheckedClassName,
    checkedClassName,
    onChange,
    name,
  } = props;

  const [activeValue, setActiveValue] = useState('');

  const handleChange = checkedValue => {
    setActiveValue(checkedValue);
    onChange(checkedValue);
  };

  return (
    <div className={className}>
      {options.map((option, index) => (
        <label
          key={index}
          className={
            activeValue === option.value ? checkedClassName : unCheckedClassName
          }
          onClick={() => handleChange(option.value)}
        >
          {option.content}
          <input
            className="hidden"
            type="radio"
            name={name ?? 'radio'}
            value={option.value}
          />
        </label>
      ))}
    </div>
  );
}

export default function RadioCardGroup(props) {
  const {
    checkedClassName,
    className,
    multiply = false,
    name = '',
    onChange,
    options,
    unCheckedClassName,
    initialValue,
  } = props;

  if (multiply) {
    return (
      <MultiplyRadioGroup
        options={options}
        className={className}
        unCheckedClassName={unCheckedClassName}
        checkedClassName={checkedClassName}
        onChange={onChange}
        initialValue={initialValue}
      />
    );
  }
  return (
    <SingleRadioGroup
      name={name}
      className={className}
      options={options}
      checkedClassName={checkedClassName}
      unCheckedClassName={unCheckedClassName}
      onChange={onChange}
    />
  );
}
