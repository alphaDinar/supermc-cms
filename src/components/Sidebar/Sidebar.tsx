'use client'
import Image from 'next/image';
import Link from 'next/link';
import { MdMenu, MdPowerSettingsNew, MdStorefront } from 'react-icons/md';
import { TbGitBranch } from 'react-icons/tb';
import logo from '../../../public/logo.png';
import styles from './sidebar.module.css';
import { useSidebarContext } from '@/Providers/SidebarContext';
import { BiDish } from 'react-icons/bi';
import { usePathname } from 'next/navigation';
import { FaMotorcycle } from 'react-icons/fa';

const Sidebar = () => {
  const pathName = usePathname();
  const { sidebarToggled, setSidebarToggled } = useSidebarContext();

  const toggleMenu = () => {
    sidebarToggled ? setSidebarToggled(false) : setSidebarToggled(true);
  }

  const tagList = [
    { name: 'Stores', target: '/stores', icon: <MdStorefront /> },
    { name: 'Branches', target: '/branches', icon: <TbGitBranch /> },
    { name: 'Categories', target: '/categories', icon: <BiDish /> },
    { name: 'Riders', target: '/riders', icon: <FaMotorcycle /> }

  ]

  return (
    <section className={sidebarToggled ? `${styles.sidebar} ${styles.change}` : styles.sidebar}>
      <MdMenu className={styles.menuTag} onClick={toggleMenu} />
      <header>
        <div className={styles.logoBox}>
          <Image alt='' src={logo} fill sizes='1' priority />
        </div>
      </header>

      <nav>
        {tagList.map((tag, i) => (
          <Link key={i} href={tag.target} style={pathName === tag.target ? { color: 'wheat' } : { color: 'white' }}  >{tag.icon} <span>{tag.name}</span></Link>
        ))}
      </nav>

      <footer>
        <Link href={''}><MdPowerSettingsNew /> <span>Logout</span></Link>
      </footer>
    </section>
  );
}

export default Sidebar;