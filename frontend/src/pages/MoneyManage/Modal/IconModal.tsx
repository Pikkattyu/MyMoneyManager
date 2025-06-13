
import React, { useEffect, useState } from 'react';

interface SelectModalProps {
  disColor:string
  onSelect: (value: string) => void;
}

const IconModal: React.FC<SelectModalProps> = ({ onSelect, disColor }) => {
  const [isPageFlg, setPageFlg] = useState<number>(0);
  const [isIconPopUpFlg, setIconPopUpFlg] = useState<boolean>(false);
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try{
        const response = await fetch('/api/getfilepath?dir=' + 'Icons', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        const fileNames = data.files.map(file => file.replaceAll("/app/public", ""));
        setFiles(fileNames)
      }catch(error){
        if (error instanceof Error) {
          console.log(error.message);
        } else {
          console.log(error);
        }
      }
    }

    fetchData();
  }, []);
  
  // 値を選択したときの処理
  const handleSelect = (file: string) => {
    onSelect(file); // 親コンポーネントに選択された値を渡す
  };

  const ClosePopup = (button: boolean) => {
    setIconPopUpFlg(false);
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
        handleSelect("public/Icons/" + selectedFile.name);
      } catch (error) {
        console.error("アップロード失敗", error);
      }
    };
  

  return (
    <div className='PopUp'>
      <h1>アイコン選択</h1>
      
      <div className='Icon'>
        <div className='Icon-container'>
          <div className='Icon-box'>
            {files.map((file: string, index) => (
              <div className='Icon-Items' key={'fileId' + index} onClick={() => handleSelect(file)}>
                <div className="category-Image-box" style={{ backgroundColor: disColor }}>
                  <img className='category-Image' src={file} alt="画像の説明" width="30"/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='alignC'>
        <label className='btn-style'>
          画像登録
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
        </label>
        <button onClick={() => handleSelect("")} className='btn-style'>未選択</button>
        <button onClick={() => handleSelect("null")} className='btn-style'>閉じる</button>
      </div>
    </div>
  );
};

export default IconModal;