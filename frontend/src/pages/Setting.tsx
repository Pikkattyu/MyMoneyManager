import React, { useEffect, useState } from 'react';
import Category from '../pages/Category';
import AssetsSetting from '../pages/AssetsSetting';

const Asset: React.FC = () => {
  const [errorMessages, setErrorMessages] = useState<string>('');

  const [isPopupFlg, setPopupFlg] = useState<Number>(0);

  useEffect(() => { }, []);

  const OpenPopup = (number: Number) => {
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
      <div className="customContainer">
        <div className="row" onClick={() => OpenPopup(1)}>
          カテゴリ設定
        </div>
        <div className="row" onClick={() => OpenPopup(2)}>
          資産設定
        </div>
        <div className="row" onClick={() => OpenPopup(3)}>
          カテゴリ設定3
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
          <AssetsSetting onClose={ClosePopup} />
        </>
      )}
    </div>
  );
};

export default Asset;