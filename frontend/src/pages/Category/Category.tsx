import React, { useState } from 'react';
import '../../styles.css'; // CSSファイルのインポート
import DisCategory from './SelCategory';
import ChangeCategory from './ChangeCategory';
import CreateCategory from './CreateCategory';

interface OpenButtonProps {
  onClose: (isButton: boolean) => void;
}

const Category: React.FC<OpenButtonProps> = ({ onClose }) => {
  const [isPageFlg, setPageFlg] = useState<number>(1);
  const [CategoryID, setCategoryID] = useState<number>(1);

  const ChangePopUp = (button: boolean, number: number, index: number) => {
    setCategoryID(index);

    if (number == 0) {
      onClose(false);
    }
    setPageFlg(number);
  };

  return (
    <div className='PopUp'>
      {isPageFlg == 1 && (
        <>
          <DisCategory onClose={ChangePopUp} />
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

export default Category;