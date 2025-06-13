import React, { useState, useEffect } from 'react';
import CreateBook from '../pages/MoneyManage/Book/CreateBook';
import ChangeBook from '../pages/MoneyManage/Book/ChangeBook';
import '../styles.css'; // CSSファイルのインポート
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScheduleFlg, setIsScheduleFlg] = useState(false);
  const [isCreateBook, setCreateBook] = useState(false);
  const [isChangeBook, setChangeBook] = useState(false);
  const [UserName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const ChangeSite = () => {
    if(isScheduleFlg){
      setIsScheduleFlg(false);
      navigate('/transaction');
    }else{
      setIsScheduleFlg(true);
      navigate('/schedule/notice');
    }
  };

  const MovePage = (url: string) => {
    navigate(url);
  }

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

    if(location.pathname.slice(0, 9) === "/schedule"){
      setIsScheduleFlg(true);
    }

  }, [isScheduleFlg]);

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
        {!isScheduleFlg ? (
          <span className='headerh1'>お小遣い帳</span>
        ):(
          <span className='headerh1'>スケジュール帳</span>
        )}
        {isLoggedIn ? (
          <>
            {!isScheduleFlg ? (
              <span className='headertxt'>
                <button onClick={ChangeSite}>スケジュールへ</button>
              </span>
            ):(
              <span className='headertxt'>
                <button onClick={ChangeSite}>お小遣い帳へ</button>
              </span>
            )}
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
            {!isScheduleFlg && (
              <>
                <button className='headerNav' onClick={() => MovePage("/transaction")}>記録</button>
                <button className='headerNav' onClick={() => MovePage("/assets")}>資産</button>
                <button className='headerNav' onClick={() => MovePage("/statistics")}>統計</button>
                <button className='headerNav' onClick={() => MovePage("/setting")}>設定</button>
              </>
            )}
            {isScheduleFlg && (
              <>
                <button className='headerNav' onClick={() => MovePage("/schedule/notice")}>お知らせ</button>
                <button className='headerNav' onClick={() => MovePage("/schedule/calendar")}>スケジュール</button>
                <button className='headerNav' onClick={() => MovePage("/schedule/statistics")}>統計</button>
                <button className='headerNav' onClick={() => MovePage("/schedule/setting")}>設定</button>
              </>
            )}
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