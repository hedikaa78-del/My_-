import { useEffect, useState } from 'react'
import { Storage } from '../utils/storage'
import Navbar from '../components/Navbar'
import MoodCard from '../components/MoodCard'

export default function Home(){
  const [isReady, setIsReady] = useState(false)
  const [appState, setAppState] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(()=>{
    const id = Storage.getUserId();
    setAppState(Storage.getState());
    setIsReady(true)
  },[])

  const runChallenge = ()=>{
    const newState = Storage.setState({ xp: (appState.xp||0)+500, mindPoints: (appState.mindPoints||0)+15, focusStreak: (appState.focusStreak||0)+1, emotionState:'motivated' })
    setAppState(newState)
    alert('چالش کامل شد — امتیازات افزایش یافت!')
  }

  if(!isReady) return <div className="h-screen flex items-center justify-center text-gray-300">در حال بارگذاری...</div>

  return (
    <div className="min-h-screen">
      <Navbar userId={Storage.getUserId()} current={currentPage} setCurrent={setCurrentPage} />

      <main className="container mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <MoodCard emotionState={appState.emotionState} />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-gray-700/50">
                <i className="fas fa-lightbulb text-4xl text-yellow-300 mb-2"></i>
                <p className="text-sm text-gray-400">امتیاز ذهنی (MP)</p>
                <p className="text-2xl font-extrabold text-yellow-300">{appState.mindPoints.toLocaleString('fa-IR')}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-700/50">
                <i className="fas fa-star text-4xl text-indigo-300 mb-2"></i>
                <p className="text-sm text-gray-400">تجربه (XP)</p>
                <p className="text-2xl font-extrabold text-indigo-300">{appState.xp.toLocaleString('fa-IR')}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-700/50">
                <i className="fas fa-fire text-4xl text-red-300 mb-2"></i>
                <p className="text-sm text-gray-400">پیوستگی (Streaks)</p>
                <p className="text-2xl font-extrabold text-red-300">{appState.focusStreak} روز</p>
              </div>
            </div>

            <button onClick={runChallenge} className="w-full mt-6 py-3 rounded-xl text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition duration-200 shadow-md">تکمیل مأموریت/چالش AI امروز (+۵۰۰ XP)</button>
          </div>

          <aside className="space-y-6">
            <div className="bg-gray-800 p-4 rounded-xl">شبیه‌ساز مربی و چت</div>
            <div className="bg-gray-800 p-4 rounded-xl">مسیر عادت</div>
          </aside>
        </div>
      </main>

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 p-3 bg-gray-800 rounded-t-xl shadow-2xl flex z-50">
        <p className="text-sm text-gray-300 self-center ml-2">تغییر حالت:</p>
        <div className="flex gap-2">
          {['focused','motivated','stressed','calm'].map(k=> (
            <button key={k} onClick={()=>{ Storage.setState({emotionState:k}); setAppState(Storage.getState()) }} className="px-3 py-1 rounded-full text-xs">{k}</button>
          ))}
        </div>
      </div>
    </div>
  )
}