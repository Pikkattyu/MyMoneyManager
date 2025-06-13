import React, { useEffect, useState } from 'react';
import '../../../styles.css'; // CSSファイルのインポート
import DisCalendar from './DisCalendar';
import CreateCalendar from './CreateCalendar';
import ChangeCalendar from './ChangeCalendar';

const Calendar: React.FC = () => {
  const [isPopUpFlg, setPopUpFlg] = useState<number>(0);
  const [calendarID, setCalendarID] = useState<number>(0);
  const [DisDate, setDisDate] = useState<string>(() => {
    const year = new Date().getFullYear(); // 現在の年を取得
    const month = String(new Date().getMonth() + 1).padStart(2, '0'); // 現在の月を取得し、2桁にフォーマット
    return `${year}${month}`; // "YYYYMM" 形式で文字列を返す
  });
  
  const [UpdateFlg, setUpdateFlg] = useState<number>(0);

  useEffect(() => {
  }, [DisDate, UpdateFlg]);

  const ChangePopUp = (number: number, index:number) => {
    setUpdateFlg(UpdateFlg => UpdateFlg + 1);
    setPopUpFlg(number);
    setCalendarID(index);
  };

  const MonthChange = (increment: number) => {
    const year = parseInt(DisDate.slice(0, 4), 10);
    const month = parseInt(DisDate.slice(4), 10);

    // 計算後の月と年を調整
    let newYear = year;
    let newMonth = month + increment;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    // 新しいDisDateを設定
    setDisDate(`${newYear}${String(newMonth).padStart(2, '0')}`);
  };


  return (
    <div className='transaction-form'>
      <div>
        <div className='calendar-header-month'>
          <button onClick={() => MonthChange(-1)}>◀</button>
          <div><span>{DisDate.slice(0, 4)}年</span><span>{DisDate.slice(4)}月</span></div>
          <button onClick={() => MonthChange(1)} >▶</button>
        </div>
      </div>
      <div onClick={() => ChangePopUp(1, 0)} className="floating-button">
        +
      </div>
      
      <DisCalendar disDate={DisDate} onClose={ChangePopUp} updateFlg={UpdateFlg}/>

      {isPopUpFlg == 1 && (
        <>
          <div className="overlay"></div>
          <CreateCalendar 
            onClose={ChangePopUp}
          />
        </>
      )}
      {isPopUpFlg == 2 && (
        <>
          <div className="overlay"></div>
          <ChangeCalendar 
            onClose={ChangePopUp}
            CalendarID={calendarID}
          />
        </>
      )}
    </div>
  );
};

export default Calendar;
