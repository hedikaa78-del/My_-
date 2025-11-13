# My_-<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>آکادمی مطالعه خودمختار کنکور — نسخه قابل اجرا</title>

  <!-- Tailwind (CDN) -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Font Awesome -->
  <script src="https://kit.fontawesome.com/a2e0b2b6b2.js" crossorigin="anonymous"></script>

  <!-- React / ReactDOM + Babel for in-browser JSX transpile (development use only) -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script crossorigin src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <style>
    /* چند اصلاح کوچک برای scroll */
    .scrollable-div { scrollbar-width: thin; }
  </style>
</head>
<body class="bg-gray-900 text-gray-100 min-h-screen font-sans">

  <div id="root"></div>

  <!-- اپلیکیشن به صورت JSX (با Babel ترنسپایل می‌شود) -->
  <script type="text/babel">

    const { useState, useEffect, useCallback, useMemo, useRef } = React;

    /***********************
     Mock ساده برای ذخیره‌سازی و چت (به جای Firebase)
     ***********************/
    const Storage = {
      getUserId() {
        let id = localStorage.getItem('mr_user_id');
        if (!id) {
          id = 'local-' + Math.random().toString(36).slice(2,9);
          localStorage.setItem('mr_user_id', id);
        }
        return id;
      },
      getState() {
        const raw = localStorage.getItem('mr_app_state');
        if (!raw) {
          const initial = {
            xp: 1000, mindPoints: 50, focusStreak: 3, dailyLogs: {}, currentDay: 1, lessonSubject: '', lessonTopic: '', emotionState: 'calm'
          };
          localStorage.setItem('mr_app_state', JSON.stringify(initial));
          return initial;
        }
        return JSON.parse(raw);
      },
      setState(updates) {
        const cur = Storage.getState();
        const merged = {...cur, ...updates};
        localStorage.setItem('mr_app_state', JSON.stringify(merged));
        return merged;
      },
      getChats() {
        const raw = localStorage.getItem('mr_chats') || '[]';
        return JSON.parse(raw);
      },
      addChat(msg) {
        const arr = Storage.getChats();
        arr.push(msg);
        localStorage.setItem('mr_chats', JSON.stringify(arr));
        return arr;
      }
    };

    /***********************
      داده‌های تکمیلی که از فایل اصلی برداشته شد
    ***********************/
    const EMOTION_MAP = {
      focused: { name: 'متمرکز', color: 'bg-green-600', icon: 'fa-bullseye', main: 'text-green-400', secondary: 'border-green-600' },
      motivated: { name: 'با انگیزه', color: 'bg-indigo-600', icon: 'fa-rocket', main: 'text-indigo-400', secondary: 'border-indigo-600' },
      stressed: { name: 'مضطرب', color: 'bg-red-600', icon: 'fa-triangle-exclamation', main: 'text-red-400', secondary: 'border-red-600' },
      calm: { name: 'آرام', color: 'bg-cyan-600', icon: 'fa-leaf', main: 'text-cyan-400', secondary: 'border-cyan-600' },
    };

    const PERSONA_MAP = {
      concept: { name: 'استاد مفهومی', icon: 'fa-book-open', color: 'border-blue-500' },
      test: { name: 'مربی تست‌زن', icon: 'fa-clock', color: 'border-yellow-500' },
      motivational: { name: 'مشاور انگیزشی', icon: 'fa-bolt', color: 'border-pink-500' },
    };

    /***********************
       کامپوننت‌های UI ساده
    ***********************/
    const Card = ({ title, icon, color, children }) => (
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        <h3 className={`text-xl font-bold mb-4 flex items-center ${color}`}>
          <i className={`fas ${icon} ml-2 w-5`}></i>
          {title}
        </h3>
        {children}
      </div>
    );

    const MoodCard = ({ emotionState }) => {
      const emotion = EMOTION_MAP[emotionState] || EMOTION_MAP.calm;
      const getAdvice = (state) => {
        switch(state) {
          case 'focused': return "در اوج تمرکز هستی. از این زمان برای مفاهیم مهم استفاده کن.";
          case 'motivated': return "عالیه! انرژی رو تبدیل به عمل کن؛ یه چالش کوتاه بردار.";
          case 'stressed': return "کمی نفس عمیق بکش؛ تمرکز کوتاه و پیوسته بهتر از زور زدن طولانیه.";
          default: return "آغاز خوبه؛ برنامه‌ریزی کوتاه‌مدت امروز رو بچین.";
        }
      };
      return (
        <div className={`p-5 rounded-xl text-white shadow-2xl ${emotion.color}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-light opacity-80">وضعیت روحی فعلی</p>
              <h4 className="text-3xl font-extrabold flex items-center mt-1">
                {emotion.name}
                <i className={`fas ${emotion.icon} mr-2 text-xl`}></i>
              </h4>
            </div>
          </div>
          <p className="mt-3 text-sm opacity-90 border-t border-white/30 pt-3">{getAdvice(emotionState)}</p>
        </div>
      );
    };

    /***********************
       صفحات اپ اصلی (ساده و محلی)
    ***********************/
    function Dashboard({ appState, onChangeEmotion, onRunAIChallenge }) {
      const { xp, mindPoints, focusStreak } = appState;
      return (
        <div className="space-y-6">
          <MoodCard emotionState={appState.emotionState} />
          <Card title="داشبورد هویتی و امتیازات" icon="fa-chart-line" color="text-cyan-400">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-gray-700/50">
                <i className="fas fa-lightbulb text-4xl text-yellow-300 mb-2"></i>
                <p className="text-sm text-gray-400">امتیاز ذهنی (MP)</p>
                <p className="text-2xl font-extrabold text-yellow-300">{mindPoints.toLocaleString('fa-IR')}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-700/50">
                <i className="fas fa-star text-4xl text-indigo-300 mb-2"></i>
                <p className="text-sm text-gray-400">تجربه (XP)</p>
                <p className="text-2xl font-extrabold text-indigo-300">{xp.toLocaleString('fa-IR')}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-700/50">
                <i className="fas fa-fire text-4xl text-red-300 mb-2"></i>
                <p className="text-sm text-gray-400">پیوستگی (Streaks)</p>
                <p className="text-2xl font-extrabold text-red-300">{focusStreak} روز</p>
              </div>
            </div>

            <button onClick={onRunAIChallenge} className="w-full mt-6 py-3 rounded-xl text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition duration-200 shadow-md">
              <i className="fas fa-check-circle ml-2"></i> تکمیل مأموریت/چالش AI امروز (+۵۰۰ XP)
            </button>
          </Card>
        </div>
      );
    }

    function LessonScreen({ appState, onStartLesson }) {
      const [subject, setSubject] = useState('');
      const [topic, setTopic] = useState('');
      const subjects = ['حسابان','شیمی','فیزیک','ادبیات','زیست'];
      return (
        <div className="space-y-6">
          <Card title="آموزش شخصی‌سازی‌شده (Edu Core)" icon="fa-chalkboard-user" color="text-blue-400">
            <p className="text-sm text-gray-400 mb-4">سطح و سرعت یادگیری بر اساس الگوی شما تنظیم می‌شود.</p>
            <div>
              <label className="block text-sm text-gray-300 mb-2">انتخاب درس</label>
              <select value={subject} onChange={e=>setSubject(e.target.value)} className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white">
                <option value="">--- انتخاب کنید ---</option>
                {subjects.map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-gray-300 mb-2">مبحث</label>
              <input value={topic} onChange={e=>setTopic(e.target.value)} className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white" placeholder="مثلاً: حد در بی‌نهایت" />
            </div>
            <button onClick={()=>onStartLesson(subject, topic)} className="w-full mt-6 py-3 rounded-xl text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition">شروع یادگیری</button>
          </Card>
        </div>
      );
    }

    function TestSimulator({ onFinish }) {
      const questions = [
        { id:1, text: "مشتق تابع f(x)=sin(x^2) چیست؟", options:["2x cos(x^2)","cos(x^2)","sin(2x)","2x sin(x^2)"], answer:0 },
        { id:2, text: "انرژی آزاد گیبس برای فرایند خود به خودی چیست؟", options:["ΔG>0","ΔG<0","ΔG=0","قابل پیش‌بینی نیست"], answer:1 }
      ];
      const [idx, setIdx] = useState(0);
      const [conf, setConf] = useState(50);

      const handleAnswer = (i) => {
        const correct = i === questions[idx].answer;
        if (correct && conf>70) { /* nothing */ }
        if (idx < questions.length-1) setIdx(idx+1);
        else onFinish();
      };

      return (
        <div className="space-y-6">
          <Card title="شبیه‌ساز آزمون" icon="fa-graduation-cap" color="text-yellow-400">
            <p className="text-gray-300 mb-4 text-sm">پاسخ‌گویی شبیه‌سازی شده با ثبت اعتماد به نفس</p>
            <div className="bg-gray-700 p-4 rounded-xl mb-4">
              <p className="text-lg font-semibold text-yellow-300 mb-3">سوال {idx+1} از {questions.length}</p>
              <p className="text-white text-md">{questions[idx].text}</p>
            </div>
            <div className="space-y-3">
              {questions[idx].options.map((opt, i)=>(
                <button key={i} onClick={()=>handleAnswer(i)} className="w-full p-3 rounded-lg bg-gray-600 hover:bg-yellow-500 transition text-right">
                  <span className="ml-3 font-mono text-lg text-yellow-400">{String.fromCharCode(65+i)}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-700">
              <label className="block text-gray-300 mb-2">اعتماد به نفس: <span className={conf>70?'text-green-400':conf<40?'text-red-400':'text-yellow-400'}>{conf}%</span></label>
              <input type="range" min="0" max="100" value={conf} onChange={e=>setConf(parseInt(e.target.value))} className="w-full" />
            </div>
          </Card>
        </div>
      );
    }

    function HabitJourney({ appState, onCheckIn }) {
      const { currentDay, dailyLogs } = appState;
      const [score, setScore] = useState(70);
      const total = 30;
      return (
        <div className="space-y-6">
          <Card title="مسیر عادت و پیوستگی (30 روز)" icon="fa-mountain" color="text-purple-400">
            <p className="text-sm text-gray-400 mb-6">سیستم ساده ۳۰ روزه برای ساخت عادت مطالعه</p>
            <div className="flex flex-wrap gap-3 justify-center mb-4">
              {Array.from({length: total},(_,i)=>i+1).map(d=>(
                <div key={d} className="text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${dailyLogs[d] ? (dailyLogs[d].score>=80 ? 'bg-green-400':'bg-yellow-400') : (d===currentDay ? 'bg-indigo-500 text-white':'bg-gray-600 text-gray-400')}`}>
                    {d}
                  </div>
                </div>
              ))}
            </div>

            {currentDay <= total && !dailyLogs[currentDay] && (
              <div className="bg-gray-700 p-4 rounded-xl border-l-4 border-indigo-500">
                <h4 className="font-bold text-white mb-3">ثبت روز {currentDay}</h4>
                <label className="block text-sm text-gray-300 mb-2">امتیاز تمرکز</label>
                <input type="range" min="0" max="100" value={score} onChange={e=>setScore(parseInt(e.target.value))} className="w-full" />
                <p className="text-center text-indigo-300 font-bold mt-2">امتیاز: {score}</p>
                <button onClick={()=>onCheckIn(score)} className="w-full mt-4 py-2 rounded-xl bg-indigo-600">ثبت و تکمیل روز</button>
              </div>
            )}
          </Card>
        </div>
      );
    }

    function BehaviorReplay({ appState }) {
      return (
        <div className="space-y-6">
          <Card title="بازپخش رفتار (تحلیل شناختی)" icon="fa-chart-pie" color="text-pink-400">
            <p className="text-sm text-gray-400 mb-6">تحلیل ساده از ثبت‌ها و آزمون‌ها (نمونه نمایشی)</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-xl">Timeline / Heatmap نمونه</div>
              <div className="bg-gray-700 p-4 rounded-xl">Voiceover: تحلیل کلی و نکات بهبود</div>
            </div>
          </Card>
        </div>
      );
    }

    function Coaching({ appState, onSendMessage }) {
      const [input, setInput] = useState('');
      const [persona, setPersona] = useState('concept');
      const [chats, setChats] = useState(Storage.getChats());

      useEffect(()=> {
        const handler = () => setChats(Storage.getChats());
        window.addEventListener('storage', handler);
        return ()=>window.removeEventListener('storage', handler);
      },[]);

      const send = async () => {
        if (!input.trim()) return;
        const userMsg = { sender:'user', text: input, timestamp: Date.now() };
        Storage.addChat(userMsg);
        setChats(Storage.getChats());
        // شبیه‌سازی پاسخ AI
        const ai = { sender:'ai', text: `(پاسخ شبیه‌سازی‌شده از ${PERSONA_MAP[persona].name})\nبرای: ${input}`, tone: PERSONA_MAP[persona].name, emotion: appState.emotionState, timestamp: Date.now()+1 };
        Storage.addChat(ai);
        setChats(Storage.getChats());
        setInput('');
      };

      return (
        <div className="space-y-6">
          <Card title="مربی هوشمند (شبیه‌سازی)" icon="fa-robot" color="text-fuchsia-400">
            <div className="flex justify-around mb-4 p-2 bg-gray-700 rounded-xl">
              {Object.entries(PERSONA_MAP).map(([k,p])=>(
                <button key={k} onClick={()=>setPersona(k)} className={`flex-1 mx-1 py-2 rounded-lg ${persona===k ? 'bg-fuchsia-500 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>
                  <i className={`fas ${p.icon} ml-2`}></i>{p.name}
                </button>
              ))}
            </div>

            <div className="h-64 overflow-y-auto bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-3">
              {chats.length===0 ? (
                <div className="text-center text-gray-500">چتی ثبت نشده — شروع کن :)</div>
              ) : chats.map((m,idx)=>(
                <div key={idx} className={`text-sm ${m.sender==='ai' ? 'text-gray-200' : 'text-white text-right'}`}>
                  {m.sender==='ai' && <div className="text-xs text-indigo-300 mb-1">Mentor ({m.tone || 'AI'})</div>}
                  <div className={`inline-block p-3 rounded-xl ${m.sender==='ai' ? 'bg-gray-700' : 'bg-indigo-600 text-white'}`}>{m.text}</div>
                </div>
              ))}
            </div>

            <div className="flex mt-4">
              <input value={input} onChange={e=>setInput(e.target.value)} placeholder={`پرسش از ${PERSONA_MAP[persona].name}...`} className="flex-1 p-3 rounded-xl bg-gray-700 text-white" onKeyDown={e=>{ if(e.key==='Enter') send(); }} />
              <button onClick={send} className="p-3 rounded-xl bg-fuchsia-600 ml-2">ارسال</button>
            </div>
          </Card>
        </div>
      );
    }

    /***********************
       کامپوننت اصلی App
    ***********************/
    function App() {
      const [isReady, setIsReady] = useState(false);
      const [userId, setUserId] = useState('');
      const [currentPage, setCurrentPage] = useState('dashboard');
      const [appState, setAppState] = useState(Storage.getState());

      useEffect(()=> {
        const id = Storage.getUserId();
        setUserId(id);
        setAppState(Storage.getState());
        setIsReady(true);
      },[]);

      const updateState = (updates) => {
        const newState = Storage.setState(updates);
        setAppState(newState);
      };

      const handleEmotionChange = (e) => updateState({ emotionState: e });

      const handleAIChallenge = () => {
        const newState = Storage.setState({ xp: (appState.xp || 0) + 500, mindPoints: (appState.mindPoints||0) + 15, focusStreak: (appState.focusStreak||0) + 1, emotionState: 'motivated' });
        setAppState(newState);
        alert('چالش کامل شد — امتیازات افزایش یافت!');
      };

      const startLesson = (subject, topic) => {
        if(!subject || !topic) { alert('لطفاً درس و مبحث را مشخص کن'); return; }
        updateState({ lessonSubject: subject, lessonTopic: topic, emotionState: 'focused' });
        alert('آموزش شروع شد: ' + subject + ' - ' + topic);
      };

      const finishTest = () => { setCurrentPage('replay'); alert('آزمون تمام شد — بازپخش را ببین'); };

      const handleCheckIn = (score) => {
        const state = Storage.getState();
        const day = state.currentDay || 1;
        const newDaily = {...state.dailyLogs, [day]: { score, timestamp: Date.now() }};
        const nextDay = day < 30 ? day + 1 : 30;
        const newState = Storage.setState({ dailyLogs: newDaily, currentDay: nextDay, focusStreak: (state.focusStreak||0)+1 });
        setAppState(newState);
        alert(`روز ${day} ثبت شد: ${score}`);
      };

      if(!isReady) return <div className="h-screen flex items-center justify-center text-gray-300">در حال بارگذاری...</div>;

      const navItems = [
        {id:'dashboard', name:'داشبورد', icon:'fa-brain'},
        {id:'lesson', name:'دروس', icon:'fa-chalkboard-user'},
        {id:'test', name:'آزمون', icon:'fa-graduation-cap'},
        {id:'habit', name:'عادت', icon:'fa-mountain'},
        {id:'replay', name:'بازپخش', icon:'fa-chart-pie'},
        {id:'coach', name:'مربی', icon:'fa-robot'}
      ];

      const renderPage = () => {
        switch(currentPage) {
          case 'dashboard': return <Dashboard appState={appState} onChangeEmotion={handleEmotionChange} onRunAIChallenge={handleAIChallenge} />;
          case 'lesson': return <LessonScreen appState={appState} onStartLesson={startLesson} />;
          case 'test': return <TestSimulator onFinish={finishTest} />;
          case 'habit': return <HabitJourney appState={appState} onCheckIn={handleCheckIn} />;
          case 'replay': return <BehaviorReplay appState={appState} />;
          case 'coach': return <Coaching appState={appState} />;
          default: return <Dashboard appState={appState} onChangeEmotion={handleEmotionChange} onRunAIChallenge={handleAIChallenge} />;
        }
      };

      return (
        <div className="min-h-screen" >
          <header className="bg-gray-800 sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
              <h1 className="text-2xl font-extrabold text-cyan-300">META-RANK <span className="text-sm text-gray-400">Academy</span></h1>
              <nav className="flex flex-wrap mt-3 md:mt-0">
                {navItems.map(it=>(
                  <button key={it.id} onClick={()=>setCurrentPage(it.id)} className={`mx-1 py-2 px-3 rounded-full text-sm ${currentPage===it.id ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                    <i className={`fas ${it.icon} ml-2`}></i>{it.name}
                  </button>
                ))}
              </nav>
            </div>
            <div className="text-center text-xs p-1 bg-gray-700/50">
              <span className="text-gray-400">شناسه کاربر:</span>
              <span className="mr-1 text-gray-200">{userId}</span>
            </div>
          </header>

          <main className="container mx-auto p-6 md:p-10">
            {renderPage()}
          </main>

          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 p-3 bg-gray-800 rounded-t-xl shadow-2xl flex z-50">
            <p className="text-sm text-gray-300 self-center ml-2">تغییر حالت:</p>
            {Object.entries(EMOTION_MAP).map(([k,v])=>(
              <button key={k} onClick={()=>{ updateState({emotionState:k}); setAppState(Storage.getState()); }} className={`mx-1 px-3 py-1 rounded-full text-xs ${k===appState.emotionState ? 'ring-2' : ''}`}>
                {v.name}
              </button>
            ))}
          </div>
        </div>
      );
    }

    /***********************
       رندر روی صفحه
    ***********************/
    ReactDOM.createRoot(document.getElementById('root')).render(<App />);

  </script>
</body>
</html>
