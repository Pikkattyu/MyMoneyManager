import React, { useState, useEffect } from 'react';
import CreateBook from '../pages/CreateBook';
import ChangeBook from '../pages/ChangeBook';
import '../styles.css'; // CSSファイルのインポート

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCreateBook, setCreateBook] = useState(false);
  const [isChangeBook, setChangeBook] = useState(false);
  const [UserName, setUserName] = useState<string | null>(null);

  const OpenCreatePopup = () => {
    setCreateBook(true);
  };

  const CloseCreatePopup = (button: boolean) => {
    if (button) {
      alert('帳簿を作成しました。')
    }
    setCreateBook(false);
  };

  const OpenChangePopup = () => {
    setChangeBook(true);
  };

  const CloseChangePopup = (button: boolean) => {
    if (button) {
      alert('帳簿を切替ました。')
    }
    setChangeBook(false);
  };

  useEffect(() => {
    // ページがロードされたときに localStorage からトークンを確認してログイン状態を設定
    const token = localStorage.getItem('token');
    setUserName(localStorage.getItem('userName'));
    setIsLoggedIn(!!token); // トークンがあれば true、なければ false を設定

  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetch('/api/logout', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      localStorage.removeItem('token');
      localStorage.removeItem('userNo');
      localStorage.removeItem('userName');
      localStorage.removeItem('bookID');
      window.location.href = '/login';
    }
  };

  return (
    <header className="header">
      <div className='contents'>
        <span className='headerh1'>お小遣い帳</span>
        {isLoggedIn ? (
          <>
            <span className='headertxt'>
              <button onClick={OpenChangePopup}>帳簿切替</button>
            </span>
            <span className='headertxt'>
              <button onClick={OpenCreatePopup}>帳簿作成</button>
            </span>
            <span className='headertxt'>
              <button onClick={handleLogout}>ログアウト</button>
            </span>
            <span className='headertxt'>
              <div>{UserName}さん</div>
            </span>
          </>
        ) : null}
      </div>
      {isLoggedIn ? (
        <nav>
          <ul>
            <a href="/transaction"><li>記録</li></a>
            <a href="/assets"><li>資産</li></a>
            <a href="#"><li>統計</li></a>
            <a href="#"><li>メモ</li></a>
            <a href="setting"><li>設定</li></a>
          </ul>
        </nav>
      ) : null}
      {isCreateBook && (
        <>
          <div className='overlay'></div>
          <CreateBook onClose={CloseCreatePopup} />
        </>
      )}
      {isChangeBook && (
        <>
          <div className='overlay'></div>
          <ChangeBook onClose={CloseChangePopup} />
        </>
      )}
    </header>
  );
};

export default Header;