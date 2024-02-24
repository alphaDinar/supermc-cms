'use client'
import { fireStoreDB, storageDB } from "@/Firebase/Base";
import Loader from "@/components/Loader/Loader";
import Screen from "@/components/Screen/Screen";
import Sidebar from "@/components/Sidebar/Sidebar";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdArrowBack } from "react-icons/md";


interface defType extends Record<string, any> { };
const EditCategory = ({ searchParams }: { searchParams: { category: string } }) => {
  const router = useRouter();
  const category = JSON.parse(searchParams.category);

  const [name, setName] = useState(category.name);
  const [store, setStore] = useState(category.store);
  const [stores, setStores] = useState<defType[]>([]);
  const [counter, setCounter] = useState(category.counter);

  const [storeList, setStoreList] = useState<string[]>(category.storeList || []);

  const [image, setImage] = useState<Blob>(new Blob);
  const [imageInfo, setImageInfo] = useState<defType>({});
  const [imagePreview, setImagePreview] = useState(category.img);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getStores = async () => {
      const storesTemp = await getDocs(collection(fireStoreDB, 'Stores/'));
      const stores: defType[] = storesTemp.docs.map((store) => ({ id: store.id, ...store.data() }));
      setStores(stores);
      setIsLoading(false);
    }

    getStores();
  }, [])

  const toggleCat = (id: string) => {
    if (storeList.includes(id)) {
      const storeTemp = storeList.filter((el) => el != id);
      setStoreList(storeTemp);
    } else {
      const storeTemp = [...storeList, id];
      setStoreList(storeTemp);
    }
  }

  const editCategory = async () => {
    if (storeList.length > 0) {
      setIsLoading(true);
      const edit = async (url: string, stamp: number) => {
        await updateDoc(doc(fireStoreDB, 'Categories/' + name), {
          name: name,
          counter: counter,
          img: url,
          storeList: storeList,
          store: store,
          timestamp: stamp
        })
          .then(() => {
            router.back()
          })
      }

      const stamp = new Date().getTime();
      if (imageInfo.size) {
        if (imageInfo.size > 200000) {
          setIsLoading(false);
          alert(`Thumbnail size is ${imageInfo.size / 1000}kb, reduce to max of 200kb`);
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
    } else {
      alert(`select a store`);
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
          <form onSubmit={(e) => { e.preventDefault(); editCategory() }}>
            <div>
              <span>Name *</span>
              <input type="text" value={name} readOnly onChange={(e) => { setName(e.target.value) }} required />
            </div>

            <div>
              <span>Counter *</span>
              <input type="number" min={1} value={counter} onChange={(e) => { setCounter(parseInt(e.target.value)) }} required />
            </div>

            <div className="categorySelectBox">
              {stores.map((store, i) => (
                <legend onClick={() => toggleCat(store.id)} className={storeList.includes(store.id) ? "categoryStore" : 'categoryStore inactive'} key={i}>{store.name}</legend>
              ))}
            </div>

            <div>
              <span>Main Store *</span>
              <select value={store} onChange={(e) => { setStore(e.target.value) }} required>
                <option hidden>Choose Store</option>
                {stores.map((store, i) => (
                  <option value={store.id} key={i}>{store.name}</option>
                ))}
              </select>
            </div>

            <div>
              <span>Thumbnail *</span>
              <label htmlFor="addImage">
                Add Thumbnail
                <input id="addImage" type="file" onChange={(e) => { setImage(e.target.files![0]), setImageInfo(e.target.files![0]), setImagePreview(URL.createObjectURL(e.target.files![0])) }} />
              </label>
            </div>
            <div className="storePreviewBox">
              <Image alt='' fill sizes="auto" src={imagePreview} />
            </div>
            <button type="submit">Edit Category</button>
          </form>
        }
      </Screen>
    </main>
  );
}

export default EditCategory;