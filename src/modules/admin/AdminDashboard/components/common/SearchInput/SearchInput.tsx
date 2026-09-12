import type React from 'react';

type Props = {
  title: string;
  value: string;
  onChange: (value: string) => void;
};

export const SearchInput: React.FC<Props> = ({ title, value, onChange }) => {
  return (
    <div>
      <label htmlFor=''>{title}</label>
      <input
        type='search'
        placeholder='Search ...'
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};
