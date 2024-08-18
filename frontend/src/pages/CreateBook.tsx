import React, { useState } from 'react';
import '../styles.css'; // CSSファイルのインポート

interface OpenButtonProps {
  onClose: (isButton: boolean) => void;
}

const CreateBook: React.FC<OpenButtonProps> = ({ onClose }) => {
  const [bookName, setTitle] = useState<string>('');
  const [startDay, setStartMonth] = useState<string>('1');
  const [startWeekDay, setStartWeek] = useState<string>('0');
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const handleCreate = async () => {
    setErrorMessages([]);
    if (bookName == '') {
      setErrorMessages(['※題名を入力してください']);
      return;
    }

    try {
      const response = await fetch('/api/bookregister', {
        method: 'POST',
        body: JSON.stringify({ bookName, startDay, startWeekDay }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (!response.ok) {
        setErrorMessages((prevMessages) => [
          ...prevMessages,
          result.errorMessage,
        ]);
      } else {
        localStorage.setItem('bookID', result.bookID);
        onClose(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className='PopUp'>
      <h1>新規作成</h1>

      <div className='inputGroup'>
        <span className='label'>題名</span>
        <input
          type="text"
          value={bookName}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="帳簿の名前を入力してください"
          className='input'
        />
      </div>
      <div className='inputGroup'>
        <span className='label'>月の開始日</span>
        <select value={startDay} onChange={(e) => setStartMonth(e.target.value)} className='select'>
          {Array.from({ length: 31 }, (_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}日</option>
          ))}
        </select>
      </div>
      <div className='inputGroup'>
        <span className='label'>週の開始日</span>
        <select value={startWeekDay} onChange={(e) => setStartWeek(e.target.value)} className='select'>
          <option value="0">日</option>
          <option value="1">月</option>
          <option value="2">火</option>
          <option value="3">水</option>
          <option value="4">木</option>
          <option value="5">金</option>
          <option value="6">土</option>
        </select>
      </div>
      <div className='PopUpButtonGroup'>
        <button className='btn-style' onClick={() => onClose(false)}>閉じる</button>
        <button className='btn-style' onClick={handleCreate}>作成</button>
      </div>

      <div className='PopUpErrorBorder'>
        <span className='errorMessageHeader'>エラーメッセージ</span>
        {errorMessages.length > 0 && (
          <span className='errorMessage'>
            {errorMessages.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </span>
        )}
      </div>
    </div>
  );
};

export default CreateBook;