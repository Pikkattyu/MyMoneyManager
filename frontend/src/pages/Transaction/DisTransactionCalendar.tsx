import React, { useEffect, useState } from 'react';
import '../../styles.css'; // CSSファイルのインポート


interface OpenButtonProps {
  getdate: string;
  transactionData: any[][];
  memoData: any[];
  onClose: (isButton: boolean, number: Number, index: Number, move:any) => void;
}

const TransactionCalendar: React.FC<OpenButtonProps> = ({ getdate, transactionData, memoData, onClose }) => {
  const [calendarDate, setcalendarDate] = useState<{ day: Date; Amount:number[];isInCurrentMonth: boolean }[]>([]);

  useEffect(() => {
    const year = Number(getdate.slice(0, 4));
    const month = Number(getdate.slice(4, 6)) - 1; // 月は0始まりなので修正

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayWeekday = firstDayOfMonth.getDay();
    const lastDayWeekday = lastDayOfMonth.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const prevMonthDays = firstDayWeekday;
    const nextMonthDays = lastDayWeekday === 6 ? 0 : 6 - lastDayWeekday;

    const days: { day: Date; Amount:number[]; isInCurrentMonth: boolean }[] = [];

    // 前月の日付
    for (let i = prevMonthDays; i > 0; i--) {
      days.push({
        day: new Date(year, month - 1, prevMonthLastDay - i + 1),
        Amount:[0,0],
        isInCurrentMonth: false,
      });
    }

    // ソート後の結果を格納する新しい変数
    let reversedTransactionData: any[][] = [...transactionData].reverse();

    // 今月の日付
    let index = 0
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      let sum_p = 0;
      let sum_n = 0;
      if (reversedTransactionData.length > index){
        for(let j = index; j <= lastDayOfMonth.getDate() && reversedTransactionData.length > index; j ++){
          
          const td = new Date(reversedTransactionData[j][0].Date)
          td.setHours(td.getHours() - 9);
          const td_ymd = td.getFullYear() + padZero(td.getMonth() + 1, 2) + padZero(td.getDate(), 2);
          const nd_ymd = year + padZero(month + 1, 2) + padZero(i, 2);
          if(Number(td_ymd) > Number(nd_ymd)){
            break;
          }
          index++;

          if (td_ymd === nd_ymd){
            reversedTransactionData[j].forEach(transaction => {
              if(transaction.Kind !== 2){
                if(transaction.Kind === 0){
                  sum_p += transaction.Amount
                }else{
                  sum_n += transaction.Amount
                }
              }
            });
            break;
          }
        }
      }
      let sum: number[] = [];
      sum.push(sum_p, sum_n);

      days.push({
        day: new Date(year, month, i),
        Amount: sum, 
        isInCurrentMonth: true,
      });
    }

    // 次月の日付
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push({
        day: new Date(year, month + 1, i),
        Amount:[0, 0],
        isInCurrentMonth: false,
      });
    }
    setcalendarDate(days);
  }, [transactionData, memoData]);

  function padZero(num, length) {
    return num.toString().padStart(length, '0');
  }

  function OpenCreate(date:Date){
    let move: any = {}; 
    move.moveDate = date
    onClose(false, 1, 0, move)
  }

  return (
    <div className="calendar-container">
      <div className="calendar">
        <div className="calendar-weekdays">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div key={index} className="weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-body">
          {calendarDate.map((item, index) => (
            <div
              onClick={e => OpenCreate(item.day)}
              key={index}
              className={`day ${item.isInCurrentMonth ? '' : 'inactive'} ${
                item.day.toDateString() === new Date().toDateString() ? 'today' : ''
              }`}
            >
              <div className='calendar-Number'>
                <span>{item.day.getDate()}</span>
              </div>

              <div className='calendar-Sum'>
                {item.Amount[0] !== 0 &&(
                  <span className='calendar-Sump'>{item.Amount[0].toLocaleString()}</span>
                )}

                {item.Amount[1] !== 0 &&(
                  <span className='calendar-Sumn'>{item.Amount[1].toLocaleString()}</span>
                )}
              </div>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionCalendar;