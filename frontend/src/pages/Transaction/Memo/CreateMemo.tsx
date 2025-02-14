import React, { useEffect, useState } from 'react';
import '../../../styles.css'; // CSSファイルのインポート
import { color } from 'chart.js/helpers';
import { Colors } from 'chart.js';

interface OpenButtonProps {
  onClose: (isButton: boolean, number: Number, move:any) => void;
}

const CreateTransaction: React.FC<OpenButtonProps> = ({ onClose }) => {
  const [errorMessages, setErrorMessages] = useState<string>('');

  const [date, setDate] = useState<string>(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`);
  const [time, setTime] = useState<string>(`${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`);
  const [disTitle, setTitle] = useState<string>("");
  const [disMemo, setMemo] = useState<string>("");

  const SaveTransactionData = async () => {

    if (disTitle === ""){
      setErrorMessages("タイトルが空です。")
      return;
    }

    const disDate = new Date(date + "T" + time + "Z")
    try {
      const response = await fetch('/api/creatememo', {
        method: 'POST',
        body: JSON.stringify({ 
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
      return
    }
    
    onClose(false, 0, null)
  }

  return (
    <div className='TransactionPopUp'>
      <h1>メモ登録</h1>

      <div className='Category'>
        <div className='TransactionGroup'>
          <span className='TransactionLabel'>日付</span>
          <input
            className='TransactionValue'
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value.toString())}
          />
          <input
            className='TransactionValue'
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value.toString())}
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
        <button onClick={() => onClose(false, 0, null)} className='btn-style'>閉じる</button>
      </div>
    </div>
  );
};

export default CreateTransaction;