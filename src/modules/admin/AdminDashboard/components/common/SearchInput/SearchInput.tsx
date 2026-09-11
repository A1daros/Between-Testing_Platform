import type React from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const SearchInput: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor=''>Search</label>
      <input
        type='search'
        placeholder='Search ...'
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};
