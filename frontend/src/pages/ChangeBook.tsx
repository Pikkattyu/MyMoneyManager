import React, { useState, useEffect } from 'react';

interface OpenButtonProps {
  onClose: (isButton: boolean) => void;
}

const ChangeBook: React.FC<OpenButtonProps> = ({ onClose }) => {
  const [books, setBooks] = useState<any[]>([]);
  const [startbookID, setstartbookID] = useState<number>(0);
  const [bookID, setbookID] = useState<number>(0);
  const [errorMessages, setErrorMessages] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getbook', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        setBooks(data.data);
        setbookID(data.user);
        setstartbookID(data.user);
      } catch (error) {
        // エラーメッセージを設定
        setErrorMessages((error as Error).message || '帳簿情報の取得時にエラーしました。');
      }
    };

    fetchData();
  }, []);


  const handleBookClick = (book_id: number) => {
    setbookID(book_id);
    // ここで他の処理も行えます
  };

  const OnSaveChange = async () => {
    if (startbookID === bookID) {
      setErrorMessages('※切替前と同じ帳簿を選択選択されています。');
      return;
    }
    try {
      const response = await fetch('/api/userinfomationchange', {
        method: 'POST',
        body: JSON.stringify({ bookID }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const result = await response.json();
        setErrorMessages(result.errorMessage);
      } else {
        onClose(true);
        localStorage.setItem('bookID', bookID.toString());
      }
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <div className='customPopUp'>
      <div className='customPopUpChange'>
        <ul className='customBookList'>
          <li className='customBookItemLabel'>
            <span className='customBookNameLabel'>帳簿名</span>
            <span className='customUpdateTimeLavel'>最終更新日</span>
          </li>
          {books.map((book, index) => (
            <li
              key={index}
              className={book.BookID === bookID ? 'customBookItemSelect' : 'customBookItem'}
              onClick={() => handleBookClick(book.BookID)}
            >
              <span className='customBookName'>{book.BookName}</span>
              <span className='customUpdateTime'>{new Date(book.UpdateTime).toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }).replace(/-/g, '/').replace(' ', ' ')}</span>
            </li>
          ))}
        </ul>
      </div>
      <span className='errorMessage2'>
        {errorMessages}
      </span>
      <div className='customPopUpButtonGroup'>
        <button className='customBtnStyle' onClick={() => onClose(false)}>閉じる</button>
        <button className='customBtnStyle' onClick={() => OnSaveChange()}>保存</button>
      </div>
    </div>
  );
};

export default ChangeBook;