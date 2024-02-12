'use client'
import Screen from "@/components/Screen/Screen";
import { collection, getDocs } from "firebase/firestore";
import { fireStoreDB } from "@/Firebase/Base";
import Sidebar from "@/components/Sidebar/Sidebar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MdEdit, MdSearch } from "react-icons/md";
import Loader from "@/components/Loader/Loader";
import Image from "next/image";
import { FaEye } from "react-icons/fa";

interface defType extends Record<string, any> { };
const Riders = () => {
  const [riders, setRiders] = useState<defType[]>([]);


  useEffect(() => {
    const getRiders = async () => {
      const ridersTemp = await getDocs(collection(fireStoreDB, 'Riders/'));
      const riders: defType[] = ridersTemp.docs.map((store) => ({ id: store.id, ...store.data() }));
      setRiders(riders);
    }

    getRiders();
  }, [])


  return (
    <main>
      <Sidebar />

      <Screen>
        <header className={'screenHeader'}>
          <Link href={'/addRider'} type="button" style={{ background: 'dodgerblue' }}>Add Rider</Link>
          <strong>Riders List</strong>

          <div className={'searchBox'}>
            <input type="text" />
            <MdSearch />
          </div>
        </header>

        {
          riders.length > 0 ?
            <section className="listBox">
              {riders.map((rider, i) => (
                <li key={i} className="rider">
                  <div className="imgBox">
                    <Image src={rider.img} alt="" fill sizes="1" />
                  </div>
                  <strong>{rider.username}</strong>
                  <span>{rider.contact}</span>
                  <legend style={{background : 'darkgray'}}>{rider.key}</legend>
                  <legend style={rider.active ? { background: 'rgb(35, 177, 106)' } : { background: 'salmon' }} >{rider.active ? 'Active' : 'Inactive'}</legend>
                  <Link href={{ pathname: '/editRider', query: { rid: rider.id } }}>
                    <FaEye />
                  </Link>
                </li>
              ))}
            </section> :
            <Loader />
        }
      </Screen>
    </main>
  );
}

export default Riders;