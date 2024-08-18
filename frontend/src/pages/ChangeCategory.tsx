import React, { useEffect, useState } from 'react';
import '../styles.css'; // CSSファイルのインポート

interface OpenButtonProps {
  onClose: (isButton: boolean, number: Number, index: Number) => void;
  CategoryID: Number;
}

interface Subcategory {
  UpdateFlg: boolean;
  SubcategoryNo: number | undefined;
  SubcategoryID: number | undefined;
  SubcategoryName: string;
}

const ChangeCategory: React.FC<OpenButtonProps> = ({ onClose, CategoryID }) => {
  const [errorMessages, setErrorMessages] = useState<string>('');
  const [disSubcategory, setDisSubcategory] = useState<Subcategory[]>([]);
  const [disCategory, setDisCategory] = useState<string>("");
  const [isAssetsView, setIsAssetsView] = useState(0);
  const [isSubcategory, setSubcategory] = useState<Subcategory | undefined>();
  const [isTextFlg, setTextFlg] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getcategory?CategoryID=' + CategoryID, {
          method: 'GET',
        });

        if (!response.ok) {
          console.log(response.json)
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        const category = data.data;

        let categoryName = category[0].CategoryName;
        let flg = category[0].Flg;
        let subcategorys: Subcategory[] = [];

        category.forEach((cate: any, index: number) => {
          subcategorys.push({
            UpdateFlg: false,
            SubcategoryNo: index,
            SubcategoryID: cate.SubcategoryID,
            SubcategoryName: cate.SubcategoryName
          });
        });

        if (subcategorys[subcategorys.length - 1].SubcategoryName !== "") {
          subcategorys.push({
            UpdateFlg: false,
            SubcategoryNo: subcategorys.length,
            SubcategoryID: 0,
            SubcategoryName: "+"
          });
        } else {
          subcategorys[subcategorys.length - 1].SubcategoryName = "+";
        }

        setDisSubcategory(subcategorys);
        setDisCategory(categoryName);
        setIsAssetsView(flg);

      } catch (error) {
        console.log(error)
        if (error instanceof Error) {
          setErrorMessages(error.message);
        } else {
          setErrorMessages('予期しないエラーが発生しました。');
        }
      }

    };

    fetchData();
  }, [CategoryID]);

  const EditSubCategory = (subcategory: Subcategory) => {
    if (subcategory.SubcategoryName === "+") {
      subcategory.SubcategoryName = "";
      setSubcategory(subcategory);
    } else {
      setSubcategory(subcategory);
    }
    setTextFlg(true);
  };

  const CloseEditSubCategory = () => {
    if (!isSubcategory || isSubcategory.SubcategoryName.trim() === "" || isSubcategory.SubcategoryName === "+") {
      setErrorMessages("空のサブカテゴリ名、または+のみを入力することはできません。");
      return;
    }

    const updatedSubcategories = disSubcategory.map(subcate =>
      subcate.SubcategoryNo === isSubcategory.SubcategoryNo
        ? { ...subcate, SubcategoryName: isSubcategory.SubcategoryName, SubcategoryID: isSubcategory.SubcategoryID === 0 ? -1 : subcate.SubcategoryID, UpdateFlg: true }
        : subcate
    );

    if (isSubcategory.SubcategoryID === 0) {
      const newSubcategory: Subcategory = {
        UpdateFlg: false,
        SubcategoryNo: updatedSubcategories.length,
        SubcategoryID: 0,
        SubcategoryName: "+" // 新しいサブカテゴリ名を設定
      };
      updatedSubcategories.push(newSubcategory);
    }

    setDisSubcategory(updatedSubcategories);
    setTextFlg(false);
  };

  const SaveCategoryData = async () => {
    try {
      const response = await fetch('/api/changecategory', {
        method: 'POST',
        body: JSON.stringify({ CategoryID, disCategory, isAssetsView, disSubcategory }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log(response.json)
        throw new Error('帳簿情報の取得時にエラーが発生しました。');
      }
    } catch (error) {
      console.log(error)
      if (error instanceof Error) {
        setErrorMessages(error.message);
      } else {
        setErrorMessages('予期しないエラーが発生しました。');
      }
    }
  }

  return (
    <div>
      <h1>カテゴリ編集</h1>

      <div className='Category'>
        <div className="category-container">
          <span className="category-label">名前:</span>
          <input
            type="text"
            className="category-name-input"
            value={disCategory}
            onChange={(e) => setDisCategory(e.target.value)}
            placeholder="カテゴリ名を入力してください"
          />
        </div>
        <div className="category-container">
          <span className="category-label">資産/負債:</span>
          <div className="TagSwitcher">
            <button onClick={() => setIsAssetsView(0)} className={isAssetsView === 0 ? 'active' : ''}>資産</button>
            <button onClick={() => setIsAssetsView(1)} className={isAssetsView === 1 ? 'active' : ''}>負債</button>
          </div>
        </div>
        <div>
          <div><span>サブカテゴリ</span></div>
          <div className='SubGroup'>
            {disSubcategory.map((subcate) => (
              <span key={subcate.SubcategoryID || subcate.SubcategoryNo} className='Categoryspan' onClick={() => EditSubCategory(subcate)}>
                {subcate.SubcategoryName}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className='PopUpButtonGroup'>
        <button onClick={() => SaveCategoryData()} className='btn-style'>登録</button>
        <button onClick={() => onClose(false, 1, 0)} className='btn-style'>閉じる</button>
      </div>

      {isTextFlg && (
        <>
          <div className='overlay'></div>
          <div className='ChangeCategoryPopUp'>
            <span className='category-label'>サブカテゴリ</span>
            <input
              type="text"
              value={isSubcategory?.SubcategoryName || ''}
              onChange={(e) => setSubcategory({ SubcategoryNo: isSubcategory?.SubcategoryNo, SubcategoryName: e.target.value, SubcategoryID: isSubcategory?.SubcategoryID, UpdateFlg: true })}
              placeholder="サブカテゴリを入力してください"
              className='input'
            />
            <button onClick={CloseEditSubCategory} className='btn-style'>保存</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChangeCategory;