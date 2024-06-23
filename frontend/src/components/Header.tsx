import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles.css'; // CSSファイルのインポート

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // ページがロードされたときに localStorage からトークンを確認してログイン状態を設定
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // トークンがあれば true、なければ false を設定
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false); // ログアウト時にログイン状態を更新
  };

  return (
    <header className="header">
      <div className='contents'>
        <span className='headerh1'>お小遣い帳</span>
        {isLoggedIn ? (
          <>
            <span className='headertxt'>
              <Link to='/switch'>帳簿切替</Link>
            </span>
            <span className='headertxt'>
              <Link to='/create'>帳簿作成</Link>
            </span>
          </>
        ) : null}
      </div>
      {isLoggedIn ? (
        <nav>
          <ul>
            <a href="#"><li>記録</li></a>
            <a href="#"><li>資産</li></a>
            <a href="#"><li>統計</li></a>
            <a href="#"><li>メモ</li></a>
            <a href="#"><li>設定</li></a>
          </ul>
        </nav>
      ) : null}
    </header>
  );
};

export default Header;