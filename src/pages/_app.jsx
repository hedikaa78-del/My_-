import '../styles/globals.css'
import { AppProvider } from '../contexts/AppContext'

export default function App({ Component, pageProps }){
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  )
}