'use client'
import { fireStoreDB, storageDB } from "@/Firebase/Base";
import Loader from "@/components/Loader/Loader";
import Screen from "@/components/Screen/Screen";
import Sidebar from "@/components/Sidebar/Sidebar";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdArrowBack } from "react-icons/md";


interface defType extends Record<string, any> { };
const AddCategory = () => {
  const router = useRouter();
  const [name, setName] = useState('');

  const [image, setImage] = useState<Blob>(new Blob);
  const [imageInfo, setImageInfo] = useState<defType>({});
  const [imagePreview, setImagePreview] = useState('');

  const [bigImage, setBigImage] = useState<Blob>(new Blob);
  const [bigImageInfo, setBigImageInfo] = useState<defType>({});
  const [bigImagePreview, setBigImagePreview] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const clearForm = () => {
    setName('');
    setImagePreview('');
    setBigImagePreview('');
  }

  const createCategory = () => {
    const add = (url: string, bigUrl: string, stamp: number) => {
      setDoc(doc(fireStoreDB, 'Categories/' + name), {
        name: name,
        img: url,
        bigImg: bigUrl,
        timestamp: stamp
      })
        .then(() => {
          clearForm();
          alert('completed');
          setIsLoading(false);
        })
    }

    if (imageInfo.size > 80000 || bigImageInfo.size > 80000) {
      alert(`image size is ${imageInfo.size / 1000}kb, reduce to max of 80kb`);
    } else {
      const stamp = new Date().getTime();
      setIsLoading(true);
      uploadBytes(storageRef(storageDB, 'Stores/' + `${imageInfo.name}${stamp}`), image)
        .then((res) => {
          getDownloadURL(res.ref)
            .then((url) => {
              uploadBytes(storageRef(storageDB, 'Stores/' + `${bigImageInfo.name}${stamp}`), bigImage)
                .then((bigRes) => {
                  getDownloadURL(bigRes.ref)
                    .then((bigUrl) => {
                      add(url, bigUrl, stamp)
                    }
                    )
                })
            }
            )
        })
    }
  }

  return (
    <main>
      <Sidebar />
      <Screen>
        <section className={'formHeader'}>
          <p>
            <MdArrowBack onClick={() => router.back()} />
            <strong>Add Category</strong>
          </p>
        </section>

        {isLoading ?
          <Loader />
          :
          <form onSubmit={(e) => { e.preventDefault(), createCategory() }}>
            <div>
              <span>Name *</span>
              <input type="text" value={name} onChange={(e) => { setName(e.target.value) }} required />
            </div>
            <div>
              <span>Thumbnail (Big) *</span>
              <label htmlFor="addBigImage">
                Add Thumbnail (Big)
                <input id="addBigImage" type="file" onChange={(e) => { setBigImage(e.target.files![0]), setBigImageInfo(e.target.files![0]), setBigImagePreview(URL.createObjectURL(e.target.files![0])) }} required />
              </label>
            </div>
            <div className="storePreviewBox" style={{ backgroundImage: `url(${bigImagePreview})` }}></div>

            <div>
              <span>Thumbnail (Small) *</span>
              <label htmlFor="addImage">
                Add Thumbnail (Small)
                <input id="addImage" type="file" onChange={(e) => { setImage(e.target.files![0]), setImageInfo(e.target.files![0]), setImagePreview(URL.createObjectURL(e.target.files![0])) }} required />
              </label>
            </div>
            <div className="categoryPreviewBox" style={{ backgroundImage: `url(${imagePreview})` }}></div>
            <button type="submit">Create Category</button>
          </form>
        }
      </Screen>
    </main>
  );
}

export default AddCategory;