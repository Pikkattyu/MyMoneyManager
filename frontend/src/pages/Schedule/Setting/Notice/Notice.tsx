import React, { useState } from 'react';
import '../../../../styles.css'; // CSSファイルのインポート
import DisNotice from './SelNotice';
import ChangeNotice from './ChangeNotice';
import CreateNotice from './CreateNotice';

interface OpenButtonProps {
  onClose: (flg:boolean) => void;
  flg: boolean;
  pageFlg: number
}

const Notice: React.FC<OpenButtonProps> = ({ onClose }) => {
  const [isPageFlg, setPageFlg] = useState<number>(1);
  const [NoticeID, setNoticeID] = useState<number>(1);
  const [hozFlg, setFlg] = useState<boolean>(false);

  const ChangePopUp = (number: number, index:number, flg?:boolean) => {
    if(isPageFlg === 1){
      setFlg(flg || false);
    }
    setNoticeID(index);
    setPageFlg(number);

    if(number === 0){
      onClose(false);
    }
  };

  return (
    <div className='PopUp'>
      {isPageFlg == 1 && (
        <>
          <DisNotice 
            onClose={ChangePopUp}
            flg={hozFlg}
          />
        </>
      )}
      {isPageFlg == 2 && (
        <>
          <ChangeNotice
            NoticeID={NoticeID}
            onClose={ChangePopUp} />
        </>
      )}
      {isPageFlg == 3 && (
        <>
          <CreateNotice onClose={ChangePopUp} />
        </>
      )}
    </div>
  );
};

export default Notice;