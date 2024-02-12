import Image from 'next/image';
import indicator from '../../../public/loader.gif'

const Loader = () => {
  return ( 
    <section style={{margin : 'auto'}}>
      <Image alt='' src={indicator} width={100} height={100} />
    </section>
   );
}
 
export default Loader;