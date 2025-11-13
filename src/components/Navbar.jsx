import Link from 'next/link'
export default function Navbar({ userId, current, setCurrent }){
  const items = [
    {id:'dashboard', label:'داشبورد', icon:'fa-brain'},
    {id:'lesson', label:'دروس', icon:'fa-chalkboard-user'},
    {id:'test', label:'آزمون', icon:'fa-graduation-cap'},
    {id:'habit', label:'عادت', icon:'fa-mountain'},
    {id:'replay', label:'بازپخش', icon:'fa-chart-pie'},
    {id:'coach', label:'مربی', icon:'fa-robot'}
  ]
  return (
    <header className="bg-gray-800 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl font-extrabold text-cyan-300">META-RANK <span className="text-sm text-gray-400">Academy</span></h1>
        <nav className="flex flex-wrap mt-3 md:mt-0">
          {items.map(it=> (
            <button key={it.id} onClick={()=> setCurrent(it.id)} className={`mx-1 py-2 px-3 rounded-full text-sm ${current===it.id ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
              <i className={`fas ${it.icon} ml-2`}></i>{it.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="text-center text-xs p-1 bg-gray-700/50">
        <span className="text-gray-400">شناسه کاربر:</span>
        <span className="mr-1 text-gray-200">{userId}</span>
      </div>
    </header>
  )
}