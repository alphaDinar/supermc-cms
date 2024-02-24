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
const EditCategory = ({ searchParams }: { searchParams: { category: string } }) => {
  const router = useRouter();
  const category = JSON.parse(searchParams.category);

  const [name, setName] = useState(category.name);

  const [image, setImage] = useState<Blob>(new Blob);
  const [imageInfo, setImageInfo] = useState<defType>({});
  const [imagePreview, setImagePreview] = useState(category.img);

  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   setIsLoading(true);
  // }, [])


  const editCategory = async () => {
    setIsLoading(true);
    const edit = async (url: string, stamp: number) => {
      await setDoc(doc(fireStoreDB, 'Categories/' + name), {
        name: name,
        img: url,
        timestamp: stamp
      })
        .then(() => {
          alert('completed');
          setIsLoading(false);
        })
    }

    const stamp = new Date().getTime();
    if (imageInfo.size) {
      if (imageInfo.size > 150000) {
        setIsLoading(false);
        alert(`Thumbnail size is ${imageInfo.size / 1000}kb, reduce to max of 150kb`);
      } else {
        await uploadBytes(storageRef(storageDB, 'Categories/' + `${imageInfo.name}${stamp}`), image)
          .then((res) => {
            getDownloadURL(res.ref)
              .then((resUrl) => {
                edit(resUrl, stamp);
              })
          })
      }
    } else {
      edit(imagePreview, stamp);
    }
  }

  const deleteCategory = () => {
    const ask = confirm(`Are you sure you want to delete ${category.id}`);
    if (ask) {
      setIsLoading(true);
      deleteDoc(doc(fireStoreDB, 'Categories/' + category.id))
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
              <span>Thumbnail *</span>
              <label htmlFor="addImage">
                Add Thumbnail
                <input id="addImage" type="file" onChange={(e) => { setImage(e.target.files![0]), setImageInfo(e.target.files![0]), setImagePreview(URL.createObjectURL(e.target.files![0])) }} />
              </label>
            </div>
            <div className="storePreviewBox" style={{ backgroundImage: `url(${imagePreview})` }}></div>
            <button type="submit">Edit Category</button>
          </form>
        }
      </Screen>
    </main>
  );
}

export default EditCategory;