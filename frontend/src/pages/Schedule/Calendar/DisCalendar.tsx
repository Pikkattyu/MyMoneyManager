import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Template from '../Setting/Template/Template';
import CustomDateCellWrapper from './CustomDateCellWrapper'; // 先ほどのファイル

// ローカライズ設定
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }), // 週の始まりを日曜日に設定
  getDay,
  locales: { ja }, // 日本語ロケールを指定
});

// ラベル表示の日本語化
const messages = {
  today: '今日',
  previous: '前',
  next: '次',
  month: '月',
  week: '週',
  day: '日',
  agenda: '予定',
  date: '日付',
  time: '時間',
  event: 'イベント',
  noEventsInRange: '予定はありません',
  allDay: '終日', // 終日表示の日本語
};

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  color: string;
  view: boolean; // ViewFlgに対応
}

interface OpenButtonProps {
  onClose: (number: number, index: number) => void;
  disDate: string; // "yyyymm" 形式の文字列
  updateFlg: number;
}

const DisCalendar: React.FC<OpenButtonProps> = ({ onClose, disDate, updateFlg }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isTemplateFlg, setTemplateFlg] = useState<boolean>(false);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [UpdateFlg, setUpdateFlg] = useState<number>(updateFlg);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (disDate.length === 6) {
      const year = parseInt(disDate.slice(0, 4), 10);
      const month = parseInt(disDate.slice(4), 10) - 1;
      return new Date(year, month, 1);
    }
    return new Date();
  });

  const [view, setView] = useState<View>('month');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getcalendarall?date=' + disDate, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        const calendars = data.calendar;
        const works = data.work;

        let hozDate = "";
        let index = -1;
        let tanka = 0;
        const salaries:any[] = [];
        const parsedEvents: CalendarEvent[] = calendars.map((event: any) => {
          const isVisible = (view === 'day' || view === 'week') || event.ViewFlg;
          works.forEach(work => {
            if(work.pay_type_code === 1 || work.pay_type_code === 2){
              if(work.work_id === event.WorkID){
                tanka = Number(work.salary) / Number(work.duration_minutes);
                const start = new Date(event.StartDateTime);
                const end = new Date(event.EndDateTime);
                const diffMs = end.getTime() - start.getTime(); // ミリ秒差
                const diffMinutes = Math.floor(diffMs / (1000 * 60)); // 分数に変換
                const money = Math.round(diffMinutes * tanka);
                if(hozDate === event.StartDateTime.slice(0, 10)){
                  salaries[index].Sum += money;
                }else{
                  salaries.push({
                    Date:event.StartDateTime.slice(0, 10),
                    Sum:money,
                    Txt:""
                  });
                  index++;
                }
                hozDate = event.StartDateTime.slice(0, 10);
              }
            }
          });

          return {
            id: event.CalendarID,
            title: event.Title,
            start: new Date(new Date(event.StartDateTime).getTime() - 9 * 60 * 60 * 1000),
            end: new Date(new Date(event.EndDateTime).getTime() - 9 * 60 * 60 * 1000),
            color: event.Backgroundcolor,
            view: isVisible,
          };
        });

        salaries.forEach(salary => {
          salary.Txt = "+" + salary.Sum.toLocaleString();
        });
        setSalaries(salaries);
        const filteredEvents = parsedEvents.filter(event => event.view);

        setEvents(filteredEvents);

      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          console.log(error.message);
        } else {
          console.log(error);
        }
      }
    };

    fetchData();
  }, [disDate, updateFlg, UpdateFlg, selectedDate, view]);

  const handleEventClick = (event) => {
    onClose(2, event.id);
  };

  const CloseTemplate = (index:number) =>{
    setTemplateFlg(false);
    if(index > 0){
      setUpdateFlg(UpdateFlg => UpdateFlg + 1);
    }
  }

  return (
    <div style={styles.container}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={styles.calendar}
        messages={messages}
        date={selectedDate}
        onNavigate={(date) => setSelectedDate(date)}
        view={view}
        onView={(v) => setView(v)}
        views={['month', 'week', 'day', 'agenda']}
        onSelectEvent={handleEventClick}
        components={{
          dateCellWrapper: (wrapperProps) => (
            <CustomDateCellWrapper {...wrapperProps} salaries={salaries} />
          ),
        }}
      />

      <div className='PopUpButtonGroup'>
        <button onClick={() => setTemplateFlg(true)} className='btn-style'>テンプレート</button>
      </div>

      {isTemplateFlg &&(
        <div className='PopUp'>
          <Template
            onClose={CloseTemplate}
            flg={true}
          />
        </div>
      )}
    </div>
  );
};

// スタイル定義
const styles = {
  container: { padding: 20 },
  calendar: { height: 700, marginTop: 20 },
  controls: { marginBottom: 20 },
};

export default DisCalendar;
