import React, { useState } from 'react';
import '../../../../styles.css'; // CSSファイルのインポート
import DisTemplate from './SelTemplate';
import ChangeTemplate from './ChangeTemplate';
import CreateTemplate from './CreateTemplate';

interface OpenButtonProps {
  onClose: (index:number) => void;
  flg: boolean;
}

const ScheduleTemplate: React.FC<OpenButtonProps> = ({ onClose, flg }) => {
  const [isPageFlg, setPageFlg] = useState<number>(1);
  const [TemplateID, setTemplateID] = useState<number>(1);

  const ChangePopUp = (number: number, index:number) => {
    if(flg){
      onClose(index)
    }else{
      setPageFlg(number);
      setTemplateID(index);
      if(number === 0){
        onClose(0);
      }
    }
  };

  return (
    <div className='PopUp'>
      {isPageFlg == 1 && (
        <>
          <DisTemplate 
            onClose={ChangePopUp}
            flg={flg}
          />
        </>
      )}
      {isPageFlg == 2 && (
        <>
          <ChangeTemplate
            TemplateID={TemplateID}
            onClose={ChangePopUp} />
        </>
      )}
      {isPageFlg == 3 && (
        <>
          <CreateTemplate onClose={ChangePopUp} />
        </>
      )}
    </div>
  );
};

export default ScheduleTemplate;