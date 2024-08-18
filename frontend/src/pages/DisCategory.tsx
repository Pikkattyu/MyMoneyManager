import React, { useEffect, useState } from 'react';
import '../styles.css'; // CSSファイルのインポート

interface OpenButtonProps {
  onClose: (isButton: boolean, number: Number, index: Number) => void;
}

interface Subcategory {
  CategoryID: number;
  CategoryName: string;
}

const DisCategory: React.FC<OpenButtonProps> = ({ onClose }) => {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const [disSubcategory_p, setDisSubcategory_p] = useState<string[][]>([]);
  const [disSubcategory_n, setDisSubcategory_n] = useState<string[][]>([]);
  const [disCategory_p, setDisCategory_p] = useState<Subcategory[]>([]);
  const [disCategory_n, setDisCategory_n] = useState<Subcategory[]>([]);
  const [isAssetsView, setIsAssetsView] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getcategoryall', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        const category = data.data;

        let CategoryID = -1;
        let index = -1;
        let categoryName_p: Subcategory[] = [];
        let categoryName_n: Subcategory[] = [];
        let subcategoryName_p: string[][] = [];
        let subcategoryName_n: string[][] = [];

        category.forEach((cate: any) => {
          if (CategoryID !== cate.CategoryID) {
            CategoryID = cate.CategoryID;
            if (cate.Flg == 0) {
              categoryName_p.push({
                CategoryID: cate.CategoryID,
                CategoryName: cate.CategoryName
              });
              subcategoryName_p.push([cate.SubcategoryName]);
            } else {
              categoryName_n.push({
                CategoryID: cate.CategoryID,
                CategoryName: cate.CategoryName
              });
              subcategoryName_n.push([cate.SubcategoryName]);
            }
            index++;
          } else {
            if (cate.Flg == 0) {
              subcategoryName_p[index].push(cate.SubcategoryName);
            } else {
              subcategoryName_n[index].push(cate.SubcategoryName);
            }
          }
        });

        setDisSubcategory_p(subcategoryName_p);
        setDisSubcategory_n(subcategoryName_n);
        setDisCategory_p(categoryName_p);
        setDisCategory_n(categoryName_n);

      } catch (error) {
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
        <button onClick={() => setIsAssetsView(true)} className={isAssetsView ? 'active' : ''}>資産</button>
        <button onClick={() => setIsAssetsView(false)} className={!isAssetsView ? 'active' : ''}>負債</button>
      </div>
      <div className='Category'>
        {(isAssetsView ? disCategory_p : disCategory_n).map((category, index) => (
          <div key={category.CategoryID} className='CategoryGroup' onDoubleClick={() => onClose(false, 2, category.CategoryID)}>
            <div>
              <span className='Categorylabel'>{category.CategoryName}</span>
            </div>
            {(isAssetsView ? disSubcategory_p[index][0] !== "" : disSubcategory_n[index][0] !== "") &&
              <div className='SubGroup'>
                {(isAssetsView ? disSubcategory_p[index] : disSubcategory_n[index]).map((subcategory, subIndex) => (
                  <span key={subIndex} className='Categoryspan'>{subcategory}</span>
                ))}
              </div>
            }
          </div>
        ))}
      </div>

      <div className='PopUpButtonGroup'>
        <button onClick={() => onClose(false, 3, 0)} className='btn-style'>新規作成</button>
        <button onClick={() => onClose(false, 0, 0)} className='btn-style'>閉じる</button>
      </div>
    </div>
  );
};

export default DisCategory;