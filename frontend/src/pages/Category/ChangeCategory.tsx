import React, { useEffect, useState } from 'react';
import IconModal from "../Modal/IconModal"
import '../../styles.css'; // CSSファイルのインポート

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
  
  const [isIconFlg, setIconFlg] = useState<boolean>(false);
  const [disColorCode, setColorCode] = useState<string>("#eeeeee");
  const [disColor, setColor] = useState<string>("#eeeeee");
  const [disIconPath, setIconPath] = useState<string>("");

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
        let color = category[0].Backgroundcolor;
        let iconpath = category[0].IconPath;
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
        setColor(color)
        setColorCode(color)
        setIconPath(iconpath)

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

  const SaveEditSubCategory = () => {
    if (!isSubcategory || isSubcategory.SubcategoryName.trim() === "" || isSubcategory.SubcategoryName === "+") {
      setErrorMessages("空のサブカテゴリ名、または+のみを入力することはできません。");
      return;
    }

    const updatedSubcategories = disSubcategory.map(subcate =>
      subcate.SubcategoryNo === isSubcategory.SubcategoryNo
        ? { ...subcate, SubcategoryName: isSubcategory.SubcategoryName, SubcategoryID: isSubcategory.SubcategoryID === 0 ? -1 : subcate.SubcategoryID, UpdateFlg: true }
        : subcate
    );

    if (updatedSubcategories[updatedSubcategories.length - 1].SubcategoryName !== "+") {
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

  const CloseEditSubCategory = () => {
    setTextFlg(false);
  };

  const DeleteSubCategory = async () => {
    if (disSubcategory.length === 2){
      setErrorMessages("サブカテゴリはすべて削除することはできません。");
    }else{
      try {
        const response = await fetch('/api/deletesubcategory', {
          method: 'POST',
          body: JSON.stringify({ SubcategoryID:isSubcategory?.SubcategoryID }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.log(response.json)
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        } else {

          const updatedDisSubcategory = disSubcategory.filter(
            (item) => item.SubcategoryID !== isSubcategory?.SubcategoryID
          );
          setDisSubcategory(updatedDisSubcategory);

          CloseEditSubCategory()
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
    setTextFlg(false);
  };

  const SaveCategoryData = async () => {
    if (disCategory == "") {
      setErrorMessages('カテゴリ名が空のため、登録できません。');
      return;
    }
    try {
      const response = await fetch('/api/changecategory', {
        method: 'POST',
        body: JSON.stringify({ 
          CategoryID, 
          disCategory, 
          isAssetsView, 
          disSubcategory,
          Backgroundcolor:disColor,
          IconPath:disIconPath
         }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log(response.json)
        throw new Error('帳簿情報の取得時にエラーが発生しました。');
      } else {
        onClose(true, 1, 0)
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

  const DelCategoryData = async () => {
    try {
      const response = await fetch('/api/deletecategory', {
        method: 'POST',
        body: JSON.stringify({ SubcategoryID:isSubcategory?.SubcategoryID }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log(response.json)
        throw new Error('帳簿情報の取得時にエラーが発生しました。');
      } else {

        onClose(false, 1, 0)
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

  const SelectFilePath = (filePath:string) => {
    if(filePath == "null"){
      //閉じる
    }else{
      setIconPath(filePath)
    }
    setIconFlg(false)
  }

  const ColorCheck = (e: string) => {
    let inputValue = e.trim(); // 空白を削除
  
    // **全角英数字を半角に変換**
    inputValue = inputValue.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
      String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
    );
  
    // **カラーコード以外の文字を削除（# を先頭に許可）**
    inputValue = inputValue.replace(/[^#0-9A-Fa-f]/g, "");
  
    // **# を追加（先頭になければ）**
    if (!inputValue.startsWith("#")) {
      inputValue = "#" + inputValue;
    }
  
    //表示するカラーコード
    setColorCode(inputValue);

    // **6桁 or 3桁のカラーコードに制限**
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(inputValue)) {
      return; // 不正な場合はセットしない
    }
    //表示するカラー
    setColor(inputValue);
  };
  
  const handleFileChange = async(event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return alert("ファイルを選択してください");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("path", "public/Icons")

    try {
      const response = await fetch("/api/uploadfilepath", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setIconPath("public" + data.filePath.replace(/\/\//g, "/"));
    } catch (error) {
      console.error("アップロード失敗", error);
    }
  };

  return (
    <div className='PopUp'>
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
              <span key={'ChangeCategory' + subcate.SubcategoryNo} className='Categoryspan' onClick={() => EditSubCategory(subcate)}>
                {subcate.SubcategoryName}
              </span>
            ))}
          </div>
        </div>
        <div className="category-container">
          <span className="category-label">カラー</span>
          <div className="SubGroup">
            <input
              type="text"
              className="category-name-input"
              value={disColorCode}
              onChange={(e) => ColorCheck(e.target.value)}
              placeholder="カラーコードを入力してください"
            />
          </div>
        </div>
        <div className="category-container">
          <span className="category-label">アイコン設定</span>
          <div className="category-Image-box" style={{ backgroundColor: disColor }}>
            {disIconPath !== "" &&(
              <img className='category-Image' src={disIconPath} alt="画像の説明" width="30"/>
            )}
          </div>
          <div className='category-Image-ButtonBox'>
            <label>
              画像登録
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
            </label>
          </div>
          <div className='category-Image-ButtonBox'>
            <button onClick={() => setIconFlg(true)}>アイコン</button>
          </div>
        </div>
      </div>

      <div className='PopUpButtonGroup'>
        <button onClick={() => SaveCategoryData()} className='btn-style'>登録</button>
        <button onClick={() => DelCategoryData()} className='btn-style'>削除</button>
        <button onClick={() => onClose(false, 1, 0)} className='btn-style'>閉じる</button>
      </div>
      <div>
        <span>{errorMessages}</span>
      </div>

      {isTextFlg && (
        <>
          <div className='overlay' onClick={CloseEditSubCategory}></div>
          <div className='ChangeCategoryPopUp'>
            <span className='category-label'>サブカテゴリ</span>
            <input
              type="text"
              value={isSubcategory?.SubcategoryName || ''}
              onChange={(e) => setSubcategory({ SubcategoryNo: isSubcategory?.SubcategoryNo, SubcategoryName: e.target.value, SubcategoryID: isSubcategory?.SubcategoryID, UpdateFlg: true })}
              placeholder="サブカテゴリを入力してください"
              className='input'
            />
            <button onClick={SaveEditSubCategory} className='btn-style'>保存</button>
            {isSubcategory?.SubcategoryID !== undefined && isSubcategory.SubcategoryID > 0 &&(
              <button onClick={DeleteSubCategory} className='btn-style'>削除</button>
            )}
          </div>
        </>
      )}

      {isIconFlg &&(
        <>
          <div className='overlay'  onClick={() => setIconFlg(false)}>
          </div>
          <IconModal
            onSelect={SelectFilePath}
            disColor={disColor}>
          </IconModal>
        </>
      )}
    </div>
  );
};

export default ChangeCategory;