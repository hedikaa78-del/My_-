import Card from './Card'
export default function MoodCard({ emotionState = 'calm' }){
  const EMOTION_MAP = {
    focused: { name:'متمرکز', color:'bg-green-600', icon:'fa-bullseye' },
    motivated: { name:'با انگیزه', color:'bg-indigo-600', icon:'fa-rocket' },
    stressed: { name:'مضطرب', color:'bg-red-600', icon:'fa-triangle-exclamation' },
    calm: { name:'آرام', color:'bg-cyan-600', icon:'fa-leaf' }
  }
  const e = EMOTION_MAP[emotionState] || EMOTION_MAP.calm
  const advice = {
    focused: 'در اوج تمرکز هستی. از این زمان برای مفاهیم مهم استفاده کن.',
    motivated: 'عالیه! انرژی رو تبدیل به عمل کن؛ یه چالش کوتاه بردار.',
    stressed: 'کمی نفس عمیق بکش؛ تمرکز کوتاه و پیوسته بهتر از زور زدن طولانیه.',
    calm: 'آغاز خوبه؛ برنامه‌ریزی کوتاه‌مدت امروز رو بچین.'
  }

  return (
    <div className={`p-5 rounded-xl text-white shadow-2xl ${e.color}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-light opacity-80">وضعیت روحی فعلی</p>
          <h4 className="text-3xl font-extrabold flex items-center mt-1">
            {e.name}
            <i className={`fas ${e.icon} mr-2 text-xl`}></i>
          </h4>
        </div>
      </div>
      <p className="mt-3 text-sm opacity-90 border-t border-white/30 pt-3">{advice[emotionState]}</p>
    </div>
  )
}