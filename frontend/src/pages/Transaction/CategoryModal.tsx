
import React, { useEffect, useState } from 'react';
import ChangeCategory from '../Category/ChangeCategory';

interface SelectModalProps {
  isPageFlg: number;
  isCategoryID: number;
  isSubcategoryID: number;
  disSubcategory_n: any[][];
  disSubcategory_p: any[][];
  disCategory_n: any[];
  disCategory_p: any[];
  onSelect: (category: any, subcategory: any) => void;
}

const AssetsModal: React.FC<SelectModalProps> = ({ isPageFlg, isCategoryID, isSubcategoryID, disSubcategory_p, disSubcategory_n, disCategory_p, disCategory_n, onSelect }) => {
  //const [isPageFlg, setPageFlg] = useState<number>(0);
  const [isCategoryPopUpFlg, setCategoryPopUpFlg] = useState<boolean>(false);
  const [isSelectCategoryID, setSelectCategoryID] = useState<number>(0);


  // 値を選択したときの処理
  const SubcategorySelect = (category: any, subcategory: any) => {
    onSelect(category, subcategory); // 親コンポーネントに選択された値を渡す
  };
  const ChangePopUp = (button: boolean, number: Number, index: Number) => {
    if (button) {
      //新しく設定したため開きなおし
      alert('設定を保存しました。')
      SubcategorySelect(null, null)
    }
    setCategoryPopUpFlg(false);
  };

  return (
    <div className='PopUp'>
      <h1>カテゴリ選択</h1>
      <div className='TagSwitcher'>
        <button onClick={() => { isPageFlg = 0 }} className={isPageFlg == 0 ? 'active' : ''}>資産</button>
        <button onClick={() => { isPageFlg = 1 }} className={isPageFlg == 1 ? 'active' : ''}>負債</button>
      </div>

      <div className='Category'>
        {(isPageFlg == 0 ? disCategory_p : disCategory_n).map((category, index) => (
          <div
            key={category.CategoryID}
            className='CategoryGroup'
          >
            <div>
              <span className='Categorylabel'>{category.CategoryName}</span>
            </div>
            {(isPageFlg == 0 ? disSubcategory_p[index][0] !== "" : disSubcategory_n[index][0] !== "") &&
              <div className='SubGroup'>
                {(isPageFlg == 0 ? disSubcategory_p[index] : disSubcategory_n[index])
                  .filter((subcategory: any) => subcategory.SubcategoryID !== "") // SubcategoryID が空文字でないものだけを対象にする
                  .map((subcategory: any, subIndex: number) => (
                    <span
                      key={subIndex}
                      className={isSubcategoryID === subcategory.SubcategoryID && isSubcategoryID !== null ? 'CategoryspanRed' : 'Categoryspan'}
                      onClick={() => SubcategorySelect(category, subcategory)}
                    >
                      {subcategory.SubcategoryName}
                    </span>
                  ))}
                <span
                  className={'Categoryspan'}
                  onClick={() => SubcategorySelect(category, null)}
                >
                  {"未選択"}
                </span>
                <span
                  className={'Categoryspan'}
                  onClick={() => {
                    setCategoryPopUpFlg(true)
                    setSelectCategoryID(category.CategoryID)
                  }}
                >
                  {"+"}
                </span>
              </div>
            }
          </div>
        ))}
      </div>
      <div className='alignC'>
        <button onClick={() => SubcategorySelect(undefined, undefined)} className='btn-style'>閉じる</button>
      </div>

      {isCategoryPopUpFlg && (
        <>
          <ChangeCategory CategoryID={isSelectCategoryID} onClose={ChangePopUp} />
        </>
      )}

    </div>
  );
};

export default AssetsModal;