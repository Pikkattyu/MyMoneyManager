import React, { useEffect, useState } from 'react';
import '../../../../styles.css'; // CSSファイルのインポート

interface OpenButtonProps {
  onClose: (number: number, index: number) => void;
  NoticeID: number;
}

const ChangeNotice: React.FC<OpenButtonProps> = ({ onClose, NoticeID }) => {
  const [errorMessages, setErrorMessages] = useState<string>('');
  const [disTitle, setDisTitle] = useState<string>("");
  const [disTxt, setDisTxt] = useState<string>("");
  const [disDateStart, setDisDateStart] = useState<string>("");
  const [disDateEnd, setDisDateEnd] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getNotice?NoticeID=' + NoticeID, {
          method: 'GET',
        });

        if (!response.ok) {
          console.log(response.json)
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        const notice = data.data;

        setDisTitle(notice.Title);
        setDisTxt(notice.Txt);
        setDisDateStart(notice.DateStart);
        setDisDateEnd(notice.DateEnd);


      } catch (error) {
        console.log(error)
        if (error instanceof Error) {
          setErrorMessages(error.message);
        } else {
          setErrorMessages('予期しないエラーが発生しました。');
        }
      }
    };

    fetchData();
  }, [NoticeID]);

  const SaveNoticeData = async () => {
    if (disTitle == "") {
      setErrorMessages('タイトルが空のため、登録できません。');
      return;
    }
    if (disTxt == "") {
      setErrorMessages('内容が空のため、登録できません。');
      return;
    }

    try {
      const response = await fetch('/api/changeNotice', {
        method: 'POST',
        body: JSON.stringify({ 
          NoticeID, 
          Title:disTitle, 
          Txt:disTxt, 
          DateStart:disDateStart, 
          DateEnd:disDateEnd
         }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log(response.json)
        throw new Error('帳簿情報の取得時にエラーが発生しました。');
      } else {
        onClose(1, 0)
      }
    } catch (error) {
      console.log(error)
      if (error instanceof Error) {
        setErrorMessages(error.message);
      } else {
        setErrorMessages('予期しないエラーが発生しました。');
      }
    }
  }

  const DelNoticeData = async () => {
    try {
      const response = await fetch('/api/changeNotice', {
        method: 'POST',
        body: JSON.stringify({ 
          NoticeID, 
          Delflg:true
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log(response.json)
        throw new Error('帳簿情報の取得時にエラーが発生しました。');
      } else {
        onClose(1, 0)
      }
    } catch (error) {
      console.log(error)
      if (error instanceof Error) {
        setErrorMessages(error.message);
      } else {
        setErrorMessages('予期しないエラーが発生しました。');
      }
    }
  }

  return (
    <div className='PopUp'>
      <h1>カテゴリ登録</h1>

      <div className='Category'>
        <div className="category-container">
          <span className="category-label">タイトル:</span>
          <input
            type="text"
            className="category-name-input"
            value={disTitle}
            onChange={(e) => setDisTitle(e.target.value)}
            placeholder="カテゴリ名を入力してください"
          />
        </div>
        <div className='TransactionGroup'>
          <span className='TransactionLabel'>日付</span>
          <input
            className='TransactionValue'
            type="date"
            value={disDateStart}
            onChange={(e) => setDisDateStart(e.target.value.toString())}
          />
          ～
          <input
            className='TransactionValue'
            type="date"
            value={disDateEnd}
            onChange={(e) => setDisDateEnd(e.target.value.toString())}
          />
        </div>
        <div className="category-container">
          <span className="category-label">内容:</span>
          <textarea 
            className='TransactionMemo' 
            value={disTxt} 
            onChange={(e) => setDisTxt(e.target.value)} 
            placeholder='内容を入力してください'
          />
        </div>
      </div>

      <div className='PopUpButtonGroup'>
        <button onClick={() => SaveNoticeData()} className='btn-style'>登録</button>
        <button onClick={() => DelNoticeData()} className='btn-style'>削除</button>
        <button onClick={() => onClose(1, 0)} className='btn-style'>閉じる</button>
      </div>
      <div>
        <span>{errorMessages}</span>
      </div>
    </div>
  );
};

export default ChangeNotice;