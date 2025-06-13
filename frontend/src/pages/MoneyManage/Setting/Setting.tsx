import React, { useEffect, useState } from 'react';
import Category from '../Category/Category';
import Assets from '../Assets/Assets';
import UserSetting from './UserSetting';

const Asset: React.FC = () => {
  const [errorMessages, setErrorMessages] = useState<string>('');

  const [isPopupFlg, setPopupFlg] = useState<number>(0);

  useEffect(() => { }, []);

  const OpenPopup = (number: number) => {
    setPopupFlg(number);
  };

  const ClosePopup = (button: boolean) => {
    if (button) {
      alert('設定を保存しました。')
    }
    setPopupFlg(0);
  };

  return (
    <div>
      <div className='errorMessage'>{errorMessages}</div>
      <div className="SettingScroll">
        <div className="SettingScrollLine" onClick={() => OpenPopup(1)}>
          カテゴリ設定
        </div>
        <div className="SettingScrollLine" onClick={() => OpenPopup(2)}>
          資産設定
        </div>
        <div className="SettingScrollLine" onClick={() => OpenPopup(3)}>
          ユーザ設定
        </div>
        <div className="SettingScrollLine" onClick={() => OpenPopup(4)}>
          CSVファイル IN/OUT
        </div>
        <div className="SettingScrollLine" onClick={() => OpenPopup(5)}>
          ユーザ管理
        </div>
        {/* 追加の行をここに追加できます */}
      </div>

      {isPopupFlg == 1 && (
        <>
          <div className='overlay'></div>
          <Category onClose={ClosePopup} />
        </>
      )}

      {isPopupFlg == 2 && (
        <>
          <div className='overlay'></div>
          <Assets onClose={ClosePopup} MovePageFlg={1} />
        </>
      )}

      {isPopupFlg == 3 && (
        <>
          <div className='overlay'></div>
          <UserSetting onClose={ClosePopup} />
        </>
      )}
    </div>
  );
};

export default Asset;