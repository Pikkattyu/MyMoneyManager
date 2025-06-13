import React, { useEffect, useState } from 'react';
import Category from '../Category/Category';
import Notice from './Notice/Notice';
import Template from './Template/Template';
import Work from './Work/Work';

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
          通知設定
        </div>
        <div className="SettingScrollLine" onClick={() => OpenPopup(3)}>
          テンプレ設定
        </div>
        <div className="SettingScrollLine" onClick={() => OpenPopup(4)}>
          案件設定
        </div>
      </div>

      {isPopupFlg == 1 && (
        <>
          <div className='overlay'></div>
          <Category onClose={ClosePopup} flg={false} pageFlg={0} />
        </>
      )}

      {isPopupFlg == 2 && (
        <>
          <div className='overlay'></div>
          <Notice onClose={ClosePopup} flg={false} pageFlg={0} />
        </>
      )}

      {isPopupFlg == 3 && (
        <>
          <div className='overlay'></div>
          <Template 
          onClose={ClosePopup} 
          flg={false} />
        </>
      )}

      {isPopupFlg == 4 && (
        <>
          <div className='overlay'></div>
          <Work 
          onClose={ClosePopup} 
          flg={false} />
        </>
      )}
    </div>
  );
};

export default Asset;