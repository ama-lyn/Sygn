import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getTodayTimetable, getWeekTimetable, getProgressStats, getProfile,
  TimetableEntry, ProgressStats, ProfileData,
} from './apiService';

type AppData = {
  fullName: string;
  todayClasses: TimetableEntry[];
  weekClasses: TimetableEntry[];
  progress: ProgressStats | null;
  profile: ProfileData | null;
  loading: boolean;
  refresh: () => void;
};

const AppContext = createContext<AppData>({
  fullName: '', todayClasses: [], weekClasses: [],
  progress: null, profile: null, loading: true,
  refresh: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [fullName, setFullName] = useState('');
  const [todayClasses, setTodayClasses] = useState<TimetableEntry[]>([]);
  const [weekClasses, setWeekClasses] = useState<TimetableEntry[]>([]);
  const [progress, setProgress] = useState<ProgressStats | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [name, today, week, prog, prof] = await Promise.all([
        AsyncStorage.getItem('full_name'),
        getTodayTimetable(),
        getWeekTimetable(),
        getProgressStats(),
        getProfile(),
      ]);
      setFullName(name ?? '');
      setTodayClasses(today);
      setWeekClasses(week);
      setProgress(prog);
      setProfile(prof);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <AppContext.Provider value={{ fullName, todayClasses, weekClasses, progress, profile, loading, refresh: load }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppData = () => useContext(AppContext);
