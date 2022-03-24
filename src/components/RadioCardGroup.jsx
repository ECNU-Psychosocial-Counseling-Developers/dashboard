import { useState } from 'react';

export default function RadioGroup(props) {
  const { options, activeClassName, name, onChange, className } = props;

  const [activeValue, setActiveValue] = useState('');

  const handleChange = e => {
    const checkedValue = e.target.value;
    onChange(checkedValue);
    setActiveValue(checkedValue);
  };

  return (
    <div className={className}>
      {options.map((option, index) => (
        <label
          key={index}
          className={
            'block rounded cursor-pointer ' +
            (activeValue === option.value
              ? activeClassName || 'bg-blue-500'
              : '')
          }
        >
          {option.content}
          <input
            className="hidden"
            type="radio"
            name={name}
            value={option.value}
            onChange={handleChange}
          />
        </label>
      ))}
    </div>
  );
}
