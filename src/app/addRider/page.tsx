'use client'
import Screen from "@/components/Screen/Screen";
import Sidebar from "@/components/Sidebar/Sidebar";
import { MdArrowBack } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader/Loader";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { fireAuth, fireStoreDB, storageDB } from "@/Firebase/Base";
import axios from "axios";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { genChar } from "@/External/workers";

interface defType extends Record<string, any> { };
const AddRider = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');

  const [ID, setID] = useState('');
  const [IDNumber, setIDNumber] = useState('');

  const [image, setImage] = useState<Blob>(new Blob);
  const [imageInfo, setImageInfo] = useState<defType>({});
  const [imagePreview, setImagePreview] = useState('');

  const [IDImage, setIDImage] = useState<Blob>(new Blob);
  const [IDImageInfo, setIDImageInfo] = useState<defType>({});
  const [IDImagePreview, setIDImagePreview] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const clearForm = () => {
    setUsername('');
    setContact('');
    setID('');
    setIDNumber('');
    setImagePreview('');
    setIDImagePreview('');
  }


  // console.log(genChar(6));


  const createRider = () => {
    const add = async (url: string, idUrl: string, stamp: number) => {
      const response = await axios.get('https://phonebook-jade.vercel.app/supermc_contact_list/');
      const contactList: string[] = response.data.contactList;
      if (contactList.includes(contact)) {
        alert('Contact already exists');
      } else {
        const key = genChar(6);
        axios.post('https://phonebook-jade.vercel.app/supermc_register/',
          {
            username: username,
            phone: contact,
            key: key,
          }
        ).then((res) => {
          if (res.status === 200) {
            const email = `${contact}@gmail.com`;
            createUserWithEmailAndPassword(fireAuth, email, key)
              .then((res) => {
                setDoc(doc(fireStoreDB, 'Riders/' + res.user.uid), {
                  username: username,
                  contact: contact,
                  img: url,
                  ID: ID,
                  IDNumber: IDNumber,
                  IDImg: idUrl,
                  declinedTrips: [],
                  active: false,
                  key: key,
                  timestamp: stamp,
                })
                  .then(() => {
                    clearForm();
                    alert('completed');
                    setIsLoading(false);
                  })
              })
              .catch((error) => {
                setIsLoading(false);
                console.log(error);
              })
          } else {
            setIsLoading(false);
          }
        })
          .catch((error) => {
            setIsLoading(false);
            console.log(error);
          })
      }
    }

    if (imageInfo.size > 150000 || IDImageInfo.size > 150000) {
      alert(`image size is ${imageInfo.size / 1000}kb, ${IDImageInfo.size / 1000}kb, reduce to max of 150kb`);
    } else {
      const stamp = new Date().getTime();
      setIsLoading(true);
      uploadBytes(storageRef(storageDB, 'Stores/' + `${imageInfo.name}${stamp}`), image)
        .then((res) => {
          getDownloadURL(res.ref)
            .then((url) => {
              uploadBytes(storageRef(storageDB, 'Stores/' + `${IDImageInfo.name}${stamp}`), IDImage)
                .then((idRes) => {
                  getDownloadURL(idRes.ref)
                    .then((idUrl) => {
                      add(url, idUrl, stamp)
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
            <strong>Add Rider</strong>
          </p>
        </section>

        {isLoading ?
          <Loader />
          :
          <form onSubmit={(e) => { e.preventDefault(), createRider() }}>
            <div>
              <span>Username *</span>
              <input type="text" value={username} onChange={(e) => { setUsername(e.target.value) }} required />
            </div>

            <div>
              <span>Contact *</span>
              <input type="text" value={contact} onChange={(e) => { setContact(e.target.value) }} required />
            </div>

            <select onChange={(e) => { setID(e.target.value) }} required>
              <option hidden>Choose ID</option>
              <option value={'Ghana Card'}>Ghana Card</option>
              <option value={'Passport'}>Passport</option>
            </select>

            <div>
              <span>ID Number *</span>
              <input type="text" value={IDNumber} minLength={6} onChange={(e) => { setIDNumber(e.target.value) }} required />
            </div>

            <div>
              <span>Profile Image *</span>
              <label htmlFor="addImage">
                Add Profile Image
                <input id="addImage" type="file" onChange={(e) => { setImage(e.target.files![0]), setImageInfo(e.target.files![0]), setImagePreview(URL.createObjectURL(e.target.files![0])) }} required />
              </label>
            </div>
            <div className="categoryPreviewBox" style={{ backgroundImage: `url(${imagePreview})`, objectFit: 'cover' }}></div>

            <div>
              <span>ID Image *</span>
              <label htmlFor="addIDImage">
                Add ID Image
                <input id="addIDImage" type="file" onChange={(e) => { setIDImage(e.target.files![0]), setIDImageInfo(e.target.files![0]), setIDImagePreview(URL.createObjectURL(e.target.files![0])) }} required />
              </label>
            </div>
            <div className="storePreviewBox" style={{ backgroundImage: `url(${IDImagePreview})` }}></div>
            <button type="submit">Create Rider</button>
          </form>
        }
      </Screen>
    </main>
  );
}

export default AddRider;