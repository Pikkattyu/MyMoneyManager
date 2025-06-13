import React, { useEffect, useState } from 'react';
import '../../../styles.css'; // CSSファイルのインポート

interface OpenButtonProps {
  onClose: (number: number, cate, sub) => void;
  flg: boolean;
  isPageFlg: number;
}

interface Subcategory {
  CategoryID: number;
  CategoryName: string;
}

const DisCategory: React.FC<OpenButtonProps> = ({ onClose, flg, isPageFlg }) => {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const [disSubcategory_p, setDisSubcategory_p] = useState<any[][]>([]);
  const [disSubcategory_n, setDisSubcategory_n] = useState<any[][]>([]);
  const [disCategory_p, setDisCategory_p] = useState<Subcategory[]>([]);
  const [disCategory_n, setDisCategory_n] = useState<Subcategory[]>([]);
  const [isAssetsView, setIsAssetsView] = useState<number>(0);
  const [isLock, setIsLock] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getschedulecategoryall', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        const category = data.data;

        if (flg){
          setIsAssetsView(isPageFlg);
          setIsLock(true);
        }
        let CategoryID = -1;
        let pindex = -1;
        let nindex = -1;
        const categoryName_p: Subcategory[] = [];
        const categoryName_n: Subcategory[] = [];
        const subcategoryName_p: any[][] = [];
        const subcategoryName_n: any[][] = [];

        category.forEach((cate: any) => {
          if (cate.SubcategoryName === ""){
            cate.SubcategoryName = "+"
          }
          if (CategoryID !== cate.CategoryID) {
            CategoryID = cate.CategoryID;
            if (cate.IncomeFlg == 1) {
              categoryName_p.push({
                CategoryID: cate.CategoryID,
                CategoryName: cate.CategoryName
              });
              subcategoryName_p.push([cate]);
              pindex++;
            } else {
              categoryName_n.push({
                CategoryID: cate.CategoryID,
                CategoryName: cate.CategoryName
              });
              subcategoryName_n.push([cate]);
              nindex++;
            }
          } else {
            if (cate.IncomeFlg == 1) {
              subcategoryName_p[pindex].push(cate);
            } else {
              subcategoryName_n[nindex].push(cate);
            }
          }
        });

        subcategoryName_p.forEach(sp => {
          if(sp[sp.length - 1].SubcategoryName !== "+"){
            sp.push({SubcategoryName:"+"});
          }
        });

        subcategoryName_n.forEach(sn => {
          if(sn[sn.length - 1].SubcategoryName !== "+"){
            sn.push({SubcategoryName:"+"});
          }
        });

        setDisSubcategory_p(subcategoryName_p);
        setDisSubcategory_n(subcategoryName_n);
        setDisCategory_p(categoryName_p);
        setDisCategory_n(categoryName_n);
        
      } catch (error) {
        console.log(error)
        if (error instanceof Error) {
          setErrorMessages((prevMessages) => [
            ...prevMessages,
            error.message,
          ]);
        } else {
          setErrorMessages((prevMessages) => [
            ...prevMessages,
            '予期しないエラーが発生しました。',
          ]);
        }
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>カテゴリ表示</h1>
      <div className='TagSwitcher'>
        {isLock ? (
          <>
            <button className={isAssetsView === 0 ? 'active' : ''}>予定</button>
            <button className={isAssetsView === 1 ? 'active' : ''}>仕事</button>
          </>
        ):(
          <>
            <button onClick={() => setIsAssetsView(0)} className={isAssetsView === 0 ? 'active' : ''}>予定</button>
            <button onClick={() => setIsAssetsView(1)} className={isAssetsView === 1 ? 'active' : ''}>仕事</button>
          </>
        )}
        
      </div>
      <div className='Category'>
        {(isAssetsView ? disCategory_p : disCategory_n).map((category, index) => (
          <div key={category.CategoryID} className='CategoryGroup'>
            <div>
              <span className='Categorylabel'>{category.CategoryName}</span>
            </div>
            <div className='SubGroup'>
              {(isAssetsView ? disSubcategory_p[index] : disSubcategory_n[index]).map((subcategory, subIndex) => (
                <span key={subIndex} className='Categoryspan' onClick={() => onClose(2, category, subcategory)}>{subcategory.SubcategoryName}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className='PopUpButtonGroup'>
        <button onClick={() => onClose(3, null, null)} className='btn-style'>新規作成</button>
        <button onClick={() => onClose(0, null, null)} className='btn-style'>閉じる</button>
      </div>
    </div>
  );
};

export default DisCategory;