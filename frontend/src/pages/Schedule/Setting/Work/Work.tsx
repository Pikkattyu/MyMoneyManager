import React, { useState } from 'react';
import '../../../../styles.css'; // CSSファイルのインポート
import DisWork from './SelWork';
import ChangeWork from './ChangeWork';
import CreateWork from './CreateWork';

interface OpenButtonProps {
  onClose: (number: number, Name: string) => void;
  flg: boolean;
}

const Work: React.FC<OpenButtonProps> = ({ onClose, flg }) => {
  const [isPageFlg, setPageFlg] = useState<number>(1);
  const [WorkID, setWorkID] = useState<number>(1);

  const ChangePopUp = (number: number, index: number, Name?: string) => {
    if(flg){
      setWorkID(index);
      onClose(number, Name ?? "");
    }else{
      if(number == 0){
        onClose(number, Name ?? "");
      }
      setWorkID(index);
      setPageFlg(number);
    }
  };

  return (
    <div className='PopUp'>
      {isPageFlg == 1 && (
        <>
          <DisWork 
            onClose={ChangePopUp} 
          />
        </>
      )}
      {isPageFlg == 2 && (
        <>
          <ChangeWork
            WorkID={WorkID}
            onClose={ChangePopUp} />
        </>
      )}
      {isPageFlg == 3 && (
        <>
          <CreateWork onClose={ChangePopUp} />
        </>
      )}
    </div>
  );
};

export default Work;