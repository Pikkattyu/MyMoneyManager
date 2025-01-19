import React, { useEffect, useState } from 'react';
import '../../styles.css'; // CSSファイルのインポート

interface OpenButtonProps {
  disAssets_p: any[];
  disAssets_n: any[];
  onClose: (isButton: boolean, number: number, index: number) => void;
}

const DisCategory: React.FC<OpenButtonProps> = ({ disAssets_p, disAssets_n, onClose }) => {
  const [isPageFlg, setPageFlg] = useState<number>(0);
  const [isAssetsPopUpFlg, setAssetsPopUpFlg] = useState<boolean>(false);

  return (
    <div className='PopUp'>
      <h1>資産選択</h1>
      <div className='TagSwitcher'>
        <button onClick={() => setPageFlg(0)} className={isPageFlg == 0 ? 'active' : ''}>資産</button>
        <button onClick={() => setPageFlg(1)} className={isPageFlg == 1 ? 'active' : ''}>負債</button>
      </div>

      <div>
        {(isPageFlg == 0 ? disAssets_p : disAssets_n).map((assets: any) => (
          <div className='TransactionAssetsContainer' key={'DivAssets' + assets.length}>
            {assets.map((asset: any) => (
              <button className='TransactionAssetsButton' key={'AssetsID' + asset.AssetsID} onClick={() => onClose(false, 3, asset.AssetsID)}>
                {asset.AssetsName}
              </button>
            ))}
            <button className='TransactionAssetsButton' onClick={() => onClose(false, 2, 0)}>
              +
            </button>
          </div>
        ))}

        {isPageFlg == 0 && disAssets_p.length == 0 && (
          <div className='TransactionAssetsContainer' key={'DivAssets-1'}>
            <button className='TransactionAssetsButton' onClick={() => onClose(false, 2, 0)}>
              +
            </button>
          </div>
        )}

        {isPageFlg == 1 && disAssets_n.length == 0 && (
          <div className='TransactionAssetsContainer' key={'DivAssets-1'}>
            <button className='TransactionAssetsButton' onClick={() => onClose(false, 2, 0)}>
              +
            </button>
          </div>
        )}
      </div>
      <div className='alignC'>
        <button onClick={() => onClose(false, 0, 0)} className='btn-style'>閉じる</button>
      </div>
    </div>
  );
};

export default DisCategory;