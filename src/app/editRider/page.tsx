'use client'
import Screen from "@/components/Screen/Screen";
import Sidebar from "@/components/Sidebar/Sidebar";
import { MdArrowBack } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader/Loader";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { fireAuth, fireStoreDB, storageDB } from "@/Firebase/Base";
import axios from "axios";
import { createUserWithEmailAndPassword } from "firebase/auth";

interface defType extends Record<string, any> { };
const AddRider = ({ searchParams }: { searchParams: { rid: string } }) => {
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

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(fireStoreDB, 'Riders/' + searchParams.rid))
      .then((riderObj: defType) => {
        if (riderObj.exists()) {
          const rider = riderObj.data();
          setUsername(rider.username);
          setContact(rider.contact);
          setID(rider.ID);
          setIDNumber(rider.IDNumber);
          setImagePreview(rider.img);
          setIDImagePreview(rider.IDImg);
          setIsLoading(false);
        }
      });
  }, [])



  return (
    <main>
      <Sidebar />

      <Screen>
        <section className={'formHeader'}>
          <p>
            <MdArrowBack onClick={() => router.back()} />
            <strong>Add Rider</strong>
          </p>
          <p>
            <button type="button">Deactivate</button>
            <button type="button">Delete</button>
          </p>
        </section>

        {isLoading ?
          <Loader />
          :
          <form onSubmit={(e) => { e.preventDefault() }}>
            <div>
              <span>Username *</span>
              <input type="text" readOnly value={username} onChange={(e) => { setUsername(e.target.value) }} required />
            </div>

            <div>
              <span>Contact *</span>
              <input type="text" readOnly value={contact} onChange={(e) => { setContact(e.target.value) }} required />
            </div>

            <select onChange={(e) => { setID(e.target.value) }}>
              <option hidden>Choose ID</option>
            </select>

            <div>
              <span>ID Number *</span>
              <input type="text" value={IDNumber} onChange={(e) => { setIDNumber(e.target.value) }} readOnly />
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
            </div>
            <div className="storePreviewBox" style={{ backgroundImage: `url(${IDImagePreview})` }}></div>
            {/* <button type="submit">Create Rider</button> */}
          </form>
        }
      </Screen>
    </main>
  );
}

export default AddRider;