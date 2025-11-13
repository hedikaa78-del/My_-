export const Storage = {
  getUserId() {
    if (typeof window === 'undefined') return 'ssr';
    let id = localStorage.getItem('mr_user_id');
    if (!id) {
      id = 'local-' + Math.random().toString(36).slice(2,9);
      localStorage.setItem('mr_user_id', id);
    }
    return id;
  },
  getState() {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('mr_app_state');
    if (!raw) {
      const initial = { xp:1000, mindPoints:50, focusStreak:3, dailyLogs:{}, currentDay:1, lessonSubject:'', lessonTopic:'', emotionState:'calm' };
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
  }
}