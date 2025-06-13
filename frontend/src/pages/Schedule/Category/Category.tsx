import React, { useState } from 'react';
import '../../../styles.css'; // CSSファイルのインポート
import DisCategory from './SelCategory';
import ChangeCategory from './ChangeCategory';
import CreateCategory from './CreateCategory';

interface OpenButtonProps {
  onClose?: (cate, sub) => void;
  flg: boolean;
  pageFlg: number
}

const ScheduleCategory: React.FC<OpenButtonProps> = ({ onClose, flg, pageFlg }) => {
  const [isPageFlg, setPageFlg] = useState<number>(1);
  const [CategoryID, setCategoryID] = useState<number>(1);

  const ChangePopUp = (number: number, cate, sub) => {
    if(number === 0){
      onClose?.(cate, sub)
    }
    if(cate === null && sub === null){
      setPageFlg(number);
    }else if(flg && sub.SubcategoryName !== "+"){
      onClose?.(cate, sub)
    }else{
      setCategoryID(cate.CategoryID);
      setPageFlg(number);
    }
  };

  return (
    <div className='PopUp'>
      {isPageFlg == 1 && (
        <>
          <DisCategory 
            onClose={ChangePopUp}
            flg={flg}
            isPageFlg={pageFlg}
          />
        </>
      )}
      {isPageFlg == 2 && (
        <>
          <ChangeCategory
            CategoryID={CategoryID}
            onClose={ChangePopUp} />
        </>
      )}
      {isPageFlg == 3 && (
        <>
          <CreateCategory onClose={ChangePopUp} />
        </>
      )}
    </div>
  );
};

export default ScheduleCategory;