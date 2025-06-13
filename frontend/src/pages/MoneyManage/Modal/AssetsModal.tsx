
import React, { useEffect, useState } from 'react';
import CreateAssets from '../Assets/CreateAssets';

interface SelectModalProps {
  flg: boolean;
  assetsID: number;
  disAssets_p: any[];
  disAssets_n: any[];
  disNotAssets_p: any[];
  disNotAssets_n: any[];
  onSelect: (value: any) => void;
}

const AssetsModal: React.FC<SelectModalProps> = ({ flg, assetsID, disAssets_p, disAssets_n, disNotAssets_p, disNotAssets_n, onSelect }) => {
  const [isPageFlg, setPageFlg] = useState<number>(0);
  const [isAssetsPopUpFlg, setAssetsPopUpFlg] = useState<boolean>(false);
  
  // 値を選択したときの処理
  const handleSelect = (asset: any) => {
    if (asset !== undefined && asset !== null && asset !== flg) {
      if (flg) {
        asset.Flg = 1;
      } else {
        asset.Flg = 0;
      }
    }
    onSelect(asset); // 親コンポーネントに選択された値を渡す
  };

  const ClosePopup = (button: boolean) => {
    if (button) {
      //新しく設定したため開きなおし
      alert('設定を保存しました。')
      handleSelect(null)
    }
    setAssetsPopUpFlg(false);
  };

  return (
    <div className='PopUp'>
      <h1>資産選択</h1>
      <div className='TagSwitcher'>
        <button onClick={() => setPageFlg(0)} className={isPageFlg == 0 ? 'active' : ''}>資産</button>
        <button onClick={() => setPageFlg(1)} className={isPageFlg == 1 ? 'active' : ''}>負債</button>
      </div>
      
      <div className='Assets'>
        {(isPageFlg == 0 ? disAssets_p : disAssets_n).map((assets: any) => (
          <div className='Assets-container' key={'DivAssets' + assets.length}>
            <div className='Assets-header'>
              <span>資産計上</span>
            </div>
            <div className='Assets-box'>
              {assets.map((asset: any) => (
                <div className='Assets-Items' key={'AssetsID' + asset.AssetsID} onClick={() => handleSelect(asset)}>
                  <span className='Assets-Data'>{asset.Tag}</span>
                  <span className='Assets-Data'>{asset.AssetsName}</span>
                  <span className='Assets-Data'>{asset.Amount}</span>
                </div>
              ))}
              <div className='Assets-Items' onClick={() => setAssetsPopUpFlg(true)}>
                <span className='Assets-Data'></span>
                <span className='Assets-Data'></span>
                <span className='Assets-Data'>新規追加</span>
              </div>
            </div>
          </div>
        ))}

        {(isPageFlg == 0 ? disNotAssets_p : disNotAssets_n).map((assets: any) => (
          <div className='Assets-container' key={'DivAssets' + assets.length}>
          <div className='Assets-header'>
            <span>資産非計上</span>
          </div>
          <div className='Assets-box'>
            {assets.map((asset: any) => (
              <div className='Assets-Items' key={'AssetsID' + asset.AssetsID} onClick={() => handleSelect(asset)}>
                <span className='Assets-Data'>{asset.Tag}</span>
                <span className='Assets-Data'>{asset.AssetsName}</span>
                <span className='Assets-Data'>{asset.Amount}</span>
              </div>
            ))}
            <div className='Assets-Items' onClick={() => setAssetsPopUpFlg(true)}>
              <span className='Assets-Data'></span>
              <span className='Assets-Data'></span>
              <span className='Assets-Data'>新規追加</span>
            </div>
          </div>
        </div>
        ))}
      </div>

      <div className='alignC'>
        <button onClick={() => handleSelect(flg)} className='btn-style'>未選択</button>
        <button onClick={() => handleSelect(undefined)} className='btn-style'>閉じる</button>
      </div>

      {isAssetsPopUpFlg && (
        <>
          <div className='overlay'></div>
          <CreateAssets onClose={ClosePopup} />
        </>
      )}
    </div>
  );
};

export default AssetsModal;