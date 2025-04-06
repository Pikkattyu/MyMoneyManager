import React, { useEffect, useState } from 'react';
import '../../styles.css'; // CSSファイルのインポート

interface OpenButtonProps {
  onClose: (isButton: boolean, number: number, move:any) => void;
  memoID: number;
}

const CreateTransaction: React.FC<OpenButtonProps> = ({ onClose, memoID }) => {
  const [errorMessages, setErrorMessages] = useState<string>('');

  const [date, setDate] = useState<string>(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`);
  const [time, setTime] = useState<string>(`${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`);
  const [disDate, setDisDate] = useState<Date>(new Date());
  const [disTitle, setTitle] = useState<string>("");
  const [disMemo, setMemo] = useState<string>("");

  useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch('/api/getmemo?memoID=' + memoID, {
            method: 'GET',
          });
  
          if (!response.ok) {
            throw new Error('メモ情報の取得時にエラーが発生しました。');
          }
  
          const data = await response.json();
          const memo = data.data;

          const date = memo.Date.split("T")[0]; // "2025-01-15"
          const time = memo.Date.split("T")[1].replace("Z", ""); // "00:00:00"
          setDate(date)
          setTime(time)
          setDisDate(new Date(memo.Date));
          setTitle(memo.Title);
          setMemo(memo.Txt);

  
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
    }, []);

  const SaveTransactionData = async () => {
    if (disTitle === ""){
      setErrorMessages("タイトルが空です。")
      return;
    }

    try {
      const response = await fetch('/api/changememo', {
        method: 'POST',
        body: JSON.stringify({ 
          MemoID: memoID,
          Date: disDate,
          Title: disTitle,
          Txt: disMemo
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response) {
        setErrorMessages('エラーが');
      } else if (!response.ok) {
        console.log(response);
        setErrorMessages('予期しないエラーが発生しました。');
      }
    } catch (error) {
      console.log(error)
      if (error instanceof Error) {
        setErrorMessages(error.message);
      } else {
        setErrorMessages('予期しないエラーが発生しました。');
      }
      return;
    }

    onClose(false, 0, null)
  }

  const DeleteMemoData = async () => {
    try {
      let response;
      response = await fetch('/api/deletememo', {
        method: 'POST',
        body: JSON.stringify({ MemoID: memoID}),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response) {
        setErrorMessages('エラーが');
      } else if (!response.ok) {
        console.log(response);
        setErrorMessages('予期しないエラーが発生しました。');
      }
      else {
        onClose(true, 0, null)
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

  const ChangeDate = (date: string) => {
    setDate(date);
    setDisDate(new Date(date + "T" + time + "Z"));
  }

  const ChangeTime = (time: string) => {
    setTime(time);
    setDisDate(new Date(date + "T" + time + "Z"));
  }

  return (
    <div className='TransactionPopUp'>
      <h1>メモ編集</h1>

      <div className='Category'>
        <div className='TransactionGroup'>
          <span className='TransactionLabel'>日付</span>
          <input
            className='TransactionValue'
            type="date"
            value={date}
            onChange={(e) => ChangeDate(e.target.value.toString())}
          />
          <input
            className='TransactionValue'
            type="time"
            value={time}
            onChange={(e) => ChangeTime(e.target.value.toString())}
          />
        </div>

        <div className='TransactionGroup'>
          <span className='TransactionLabel'>タイトル</span>
          <input
            className='TransactionValue'
            type="text"
            value={disTitle}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className='TransactionMemoLabel'>
          <textarea className='TransactionMemo' value={disMemo} onChange={(e) => setMemo(e.target.value)} />
        </div>
      </div>
      <div style={{ color: "red" }}>
        {errorMessages}
      </div>

      <div className='PopUpButtonGroup'>
        <button onClick={() => SaveTransactionData()} className='btn-style'>登録</button>
        <button onClick={() => DeleteMemoData()} className='btn-style'>削除</button>
        <button onClick={() => onClose(false, 0, null)} className='btn-style'>閉じる</button>
      </div>
    </div>
  );
};

export default CreateTransaction;