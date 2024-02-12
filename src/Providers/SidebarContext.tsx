"use client"
import React, { Dispatch, ReactNode, createContext, useContext, useState } from "react"

type SidebarContextProviderProps = {
  children: ReactNode;
};

type SidebarContextType = {
  sidebarToggled : boolean,
  setSidebarToggled : Dispatch<React.SetStateAction<boolean>>
}

export const SidebarContext = createContext<SidebarContextType | null>(null);

const SidebarContextProvider = ({ children }: SidebarContextProviderProps) => {
  const [sidebarToggled, setSidebarToggled] = useState(false);

  return <SidebarContext.Provider
    value={{
      sidebarToggled,
      setSidebarToggled
    }}
  >
    {children}
  </SidebarContext.Provider>
}

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('UseSidebarContext must be used within');
  }
  return context;
}

export default SidebarContextProvider;
