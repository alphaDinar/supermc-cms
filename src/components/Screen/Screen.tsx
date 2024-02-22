import { useSidebarContext } from "@/Providers/SidebarContext";
import { ReactNode } from "react";

type ScreenProps = {
  children : ReactNode
}
const Screen = ({children} : ScreenProps) => {
  const {sidebarToggled} = useSidebarContext();

  return ( 
    <section className={sidebarToggled ? "screen change" : "screen" }>
      {children}
    </section>
   );
}
 
export default Screen;