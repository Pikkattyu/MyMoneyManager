import React from 'react';

interface SalaryItem {
  Date: string;
  Sum: number;
  Txt: string;
}

interface Props {
  children: React.ReactNode;
  value: Date;
  salaries: SalaryItem[];
}

const CustomDateCellWrapper: React.FC<Props> = ({ children, value, salaries }) => {
  const dateStr = value.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  .replace(/\//g, '-');

  const salary = salaries.find((s) => s.Date === dateStr);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {children}
      {salary && (
        <div
        style={{
          position: 'absolute',
          bottom: 2,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 15,
          color: 'red',
          backgroundColor: 'rgba(255,255,255,0.7)',
          padding: '2px 4px',
          borderRadius: 4,
        }}
        >
          {salary.Txt}
        </div>
      )}
    </div>
  );
};

export default CustomDateCellWrapper;