'use client'
import { fireStoreDB, storageDB } from "@/Firebase/Base";
import Loader from "@/components/Loader/Loader";
import Screen from "@/components/Screen/Screen";
import Sidebar from "@/components/Sidebar/Sidebar";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdArrowBack } from "react-icons/md";

interface defType extends Record<string, any> { };
const AddStore = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [counter, setCounter] = useState(0);
  const [theme, setTheme] = useState('');
  const [secondary, setSecondary] = useState('');
  const [logo, setLogo] = useState<Blob>(new Blob);
  const [logoInfo, setLogoInfo] = useState<defType>({});
  const [logoPreview, setLogoPreview] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  const clearForm = () => {
    setName('');
    setCounter(0);
    setTheme('');
    setSecondary('');
    setLogoPreview('');
  }

  const createStore = () => {
    if (theme[0] != '#', secondary[0] != '#') {
      alert(`Enter valid hex color`);
    }
    else {
      if (logoInfo.size > 150000) {
        alert(`logo size is ${logoInfo.size / 1000}kb, reduce to max of 150kb`);
      } else {
        const stamp = new Date().getTime();
        setIsLoading(true);
        uploadBytes(storageRef(storageDB, 'Stores/' + `${logoInfo.name}${stamp}`), logo)
          .then((res) => {
            getDownloadURL(res.ref)
              .then((url) => {
                setDoc(doc(fireStoreDB, 'Stores/' + name.toLowerCase()), {
                  name: name,
                  logo: url,
                  counter: counter,
                  theme: theme,
                  secondary: secondary,
                  timestamp: stamp
                })
                  .then(() => {
                    clearForm();
                    alert('completed');
                    setIsLoading(false);
                  })
              }
              )
          })
      }
    }
  }

  return (
    <main>
      <Sidebar />

      <Screen>
        <section className={'formHeader'}>
          <p>
            <MdArrowBack onClick={() => router.back()} />
            <strong>Add Store</strong>
          </p>
        </section>

        {isLoading ?
          <Loader />
          :
          <form onSubmit={(e) => { e.preventDefault(), createStore() }}>
            <div>
              <span>Name *</span>
              <input type="text" value={name} onChange={(e) => { setName(e.target.value) }} required />
            </div>
            <div>
              <span>Priority *</span>
              <input min={0} type="number" value={counter} onChange={(e) => { setCounter(parseInt(e.target.value)) }} required />
            </div>
            <div>
              <span>Theme Color *</span>
              <input type="text" value={theme} onChange={(e) => { setTheme(e.target.value) }} placeholder="copy and paste hex color, eg : #32a852" required />
            </div>
            <div>
              <span>Secondary Color *</span>
              <input type="text" value={secondary} onChange={(e) => { setSecondary(e.target.value) }} placeholder="copy and paste hex color, eg : #32a852" required />
            </div>

            <div>
              <span>Logo *</span>
              <label htmlFor="addImage">
                Add Logo
                <input id="addImage" type="file" onChange={(e) => { setLogo(e.target.files![0]), setLogoInfo(e.target.files![0]), setLogoPreview(URL.createObjectURL(e.target.files![0])) }} required />
              </label>
            </div>
            <div className="storePreviewBox" style={{ backgroundImage: `url(${logoPreview})` }}></div>
            <button type="submit">Create Store</button>
          </form>
        }
      </Screen>
    </main>
  );
}

export default AddStore;