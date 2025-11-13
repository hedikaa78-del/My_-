import React, { createContext, useContext, useEffect, useState } from 'react'
import { Storage } from '../utils/storage'

const AppCtx = createContext(null)

export function AppProvider({ children }){
  const [state, setState] = useState(() => typeof window === 'undefined' ? null : Storage.getState())

  useEffect(()=>{
    if(state) Storage.setState(state)
  },[state])

  useEffect(()=>{
    if(typeof window === 'undefined') return;
    const onStorage = () => setState(Storage.getState());
    window.addEventListener('storage', onStorage);
    return ()=> window.removeEventListener('storage', onStorage);
  },[])

  const update = (updates) => setState(prev => ({...prev,...updates}))

  return <AppCtx.Provider value={{state, update}}>{children}</AppCtx.Provider>
}

export const useApp = ()=> useContext(AppCtx)