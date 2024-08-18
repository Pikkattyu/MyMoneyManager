import React, { useState } from 'react';
import '../styles.css'; // CSSファイルのインポート
import DisCategory from '../pages/DisCategory';
import ChangeCategory from '../pages/ChangeCategory';

interface OpenButtonProps {
  onClose: (isButton: boolean) => void;
}

const Category: React.FC<OpenButtonProps> = ({ onClose }) => {
  const [isPageFlg, setPageFlg] = useState<Number>(1);
  const [CategoryID, setCategoryID] = useState<Number>(1);

  const ChangePopUp = (button: boolean, number: Number, index: Number) => {
    if (button) {
    }

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
          <DisCategory onClose={ChangePopUp} />
        </>
      )}
    </div>
  );
};

export default Category;