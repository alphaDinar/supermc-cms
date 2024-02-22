'use client'
import { fireStoreDB, storageDB } from "@/Firebase/Base";
import Loader from "@/components/Loader/Loader";
import Screen from "@/components/Screen/Screen";
import Sidebar from "@/components/Sidebar/Sidebar";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdArrowBack } from "react-icons/md";


interface defType extends Record<string, any> { };
const EditCategory = ({ searchParams }: { searchParams: { cid: string } }) => {
  const router = useRouter();
  const [name, setName] = useState('');

  const [image, setImage] = useState<Blob>(new Blob);
  const [imageInfo, setImageInfo] = useState<defType>({});
  const [imagePreview, setImagePreview] = useState('');

  const [bigImage, setBigImage] = useState<Blob>(new Blob);
  const [bigImageInfo, setBigImageInfo] = useState<defType>({});
  const [bigImagePreview, setBigImagePreview] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getDoc(doc(fireStoreDB, 'Categories/' + searchParams.cid))
      .then((categoryObj) => {
        if (categoryObj.exists()) {
          const category = categoryObj.data();
          setName(category.name);
          setImagePreview(category.img);
          setBigImagePreview(category.bigImg);
          setIsLoading(false);
        }
      });
  }, [searchParams.cid])


  const editCategory = async () => {
    setIsLoading(true);
    const edit = async (url: string, bigUrl: string, stamp: number) => {
      await setDoc(doc(fireStoreDB, 'Categories/' + name), {
        name: name,
        img: url,
        bigImg: bigUrl,
        timestamp: stamp
      })
        .then(() => {
          alert('completed');
          setIsLoading(false);
        })
    }

    let url = imagePreview;
    let bigUrl = bigImagePreview;
    const stamp = new Date().getTime();

    const fixImage = async () => {
      if (imageInfo.size) {
        if (imageInfo.size > 150000) {
          setIsLoading(false);
          alert(`Thumbnail(big) size is ${imageInfo.size / 1000}kb, reduce to max of 150kb`);
        } else {
          await uploadBytes(storageRef(storageDB, 'Categories/' + `${bigImageInfo.name}${stamp}`), image)
            .then((res) => {
              getDownloadURL(res.ref)
                .then((resUrl) => {
                  return resUrl;
                })
            })
        }
      } else {
        return url;
      }
    }

    const fixBigImage = async () => {
      if (bigImageInfo.size) {
        if (bigImageInfo.size > 150000) {
          setIsLoading(false);
          alert(`Thumbnail(big) size is ${imageInfo.size / 1000}kb, reduce to max of 150kb`);
        } else {
          await uploadBytes(storageRef(storageDB, 'Categories/' + `${bigImageInfo.name}${stamp}`), bigImage)
            .then((bigRes) => {
              getDownloadURL(bigRes.ref)
                .then((bigUrlRes) => {
                  return bigUrlRes;
                })
            })
        }
      }else{
        return bigUrl;
      }
    }

    await fixImage;
    await fixBigImage;

    console.log('sorted');
  }

  const deleteCategory = () => {
    const ask = confirm(`Are you sure you want to delete ${searchParams.cid}`);
    if (ask) {
      setIsLoading(true);
      deleteDoc(doc(fireStoreDB, 'Categories/' + searchParams.cid))
        .then(() => {
          router.back();
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
            <strong>Edit Category</strong>
          </p>
          <button type='button' onClick={deleteCategory}>Delete</button>
        </section>

        {isLoading ?
          <Loader />
          :
          <form onSubmit={(e) => { e.preventDefault(), editCategory() }}>
            <div>
              <span>Name *</span>
              <input type="text" value={name} readOnly onChange={(e) => { setName(e.target.value) }} required />
            </div>
            <div>
              <span>Thumbnail (Big) *</span>
              <label htmlFor="addBigImage">
                Add Thumbnail (Big)
                <input id="addBigImage" type="file" onChange={(e) => { setBigImage(e.target.files![0]), setBigImageInfo(e.target.files![0]), setBigImagePreview(URL.createObjectURL(e.target.files![0])) }} />
              </label>
            </div>
            <div className="storePreviewBox" style={{ backgroundImage: `url(${bigImagePreview})` }}></div>

            <div>
              <span>Thumbnail (Small) *</span>
              <label htmlFor="addImage">
                Add Thumbnail (Small)
                <input id="addImage" type="file" onChange={(e) => { setImage(e.target.files![0]), setImageInfo(e.target.files![0]), setImagePreview(URL.createObjectURL(e.target.files![0])) }} />
              </label>
            </div>
            <div className="categoryPreviewBox" style={{ backgroundImage: `url(${imagePreview})` }}></div>
            <button type="submit">Edit Category</button>
          </form>
        }
      </Screen>
    </main>
  );
}

export default EditCategory;