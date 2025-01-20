
import React, { useEffect, useState } from 'react';
import CreateAssets from '../../Assets/CreateAssets';

interface SelectModalProps {
  flg: boolean;
  assetsID: number;
  disAssets_p: any[];
  disAssets_n: any[];
  onSelect: (value: any) => void;
}

const AssetsModal: React.FC<SelectModalProps> = ({ flg, assetsID, disAssets_p, disAssets_n, onSelect }) => {
  const [isPageFlg, setPageFlg] = useState<number>(0);
  const [isAssetsPopUpFlg, setAssetsPopUpFlg] = useState<boolean>(false);

  // 値を選択したときの処理
  const handleSelect = (asset: any) => {
    if (asset !== undefined && asset !== null) {
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

      {isPageFlg == 0 && (
        <div>
          {(isPageFlg == 0 ? disAssets_p : disAssets_n).map((assets: any) => (
            <div className='TransactionAssetsContainer' key={'DivAssets' + assets.length}>
              {assets.map((asset: any) => (
                <button className='TransactionAssetsButton' key={'AssetsID' + asset.AssetsID} onClick={() => handleSelect(asset)}>
                  {asset.AssetsName}
                </button>
              ))}
              <button className='TransactionAssetsButton' onClick={() => setAssetsPopUpFlg(true)}>
                +
              </button>
            </div>
          ))}
        </div>
      )}
      <div className='alignC'>
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