import { AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold } from '@expo-google-fonts/atkinson-hyperlegible';
import { Nunito_800ExtraBold, useFonts } from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SqlPlayground } from './components/sql';
import { Tab, TabBar } from './components/TabBar';
import { Screen, TabsContext, TopBar, Txt } from './components/ui';
import { lessonById } from './content';
import { addBugs, addLessonCards, addTreats, bossOf, dayStr, levelFor, markDayDone, newLessonsToday, refreshFreezes, tickPet, XP } from './engine';
import { MengScreen } from './screens/Meng';
import { LibraryScreen, ReaderScreen, StudyScreen } from './screens/Library';
import { Finish, Route } from './nav';
import * as Notifications from 'expo-notifications';
import { syncReminders } from './reminders';
import { BugBookScreen } from './screens/BugBook';
import { GuideScreen } from './screens/Guide';
import { HomeScreen } from './screens/Home';
import { OnboardingScreen } from './screens/Onboarding';
import { PathScreen } from './screens/Path';
import { RewardScreen } from './screens/Reward';
import { LessonScreen, ReviewScreen } from './screens/Session';
import { SettingsScreen } from './screens/Settings';
import { SheetScreen, VaultScreen } from './screens/Vault';
import { AppProvider, resolveTheme, useApp } from './state';
import { setHapticsEnabled } from './haptics';
import { setAnimationsEnabled } from './motion';
import { setMusic } from './music';
import { preloadSfx, setMeowsEnabled, setSfxEnabled } from './sfx';
import { runQuery } from './sql/db';
import { ErrorBoundary, LoadingScreen } from './screens/Loading';
import { englishVoices, setVoiceSetting, stopSpeaking } from './voice';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Root() {
  const { state, ready, setState, colors } = useApp();
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const booted = useRef(false);

  // On launch: refill the weekly streak freeze and refresh reminders.
  useEffect(() => {
    if (!ready || booted.current) return;
    booted.current = true;
    setState((s) => tickPet(refreshFreezes(s)));
  }, [ready, state, setState]);

  // Re-plan Meng's notes whenever notification settings change (and on launch).
  const st = state.settings;
  const notifKey = JSON.stringify([state.onboarded, st.notifications, st.reminderHour, st.reminderMinute, st.secondReminder, st.secondHour, st.streakSaver, st.daysOff, st.dailyGoal]);
  useEffect(() => {
    if (ready) syncReminders(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, notifKey]);

  // Tapping one of Meng's notes opens the right screen.
  useEffect(() => {
    const open = (r: Notifications.NotificationResponse | null) => {
      const screen = r?.notification.request.content.data?.screen;
      if (screen === 'bugbook') go({ name: 'bugbook' });
      else if (screen === 'meng') go({ name: 'meng' });
      else if (screen) go({ name: 'home' });
    };
    Notifications.getLastNotificationResponseAsync().then(open).catch(() => {});
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => setVoiceSetting(state.settings.voiceId), [state.settings.voiceId]);
  useEffect(() => setSfxEnabled(state.settings.sounds), [state.settings.sounds]);
  useEffect(() => setMeowsEnabled(state.settings.meows), [state.settings.meows]);
  useEffect(() => setHapticsEnabled(state.settings.haptics), [state.settings.haptics]);
  useEffect(() => setAnimationsEnabled(state.settings.animations), [state.settings.animations]);
  useEffect(
    () => setMusic(state.settings.music, state.settings.musicTrack, state.settings.musicVolume),
    [state.settings.music, state.settings.musicTrack, state.settings.musicVolume],
  );

  const go = (r: Route) => {
    stopSpeaking();
    setRoute(r);
  };

  // Android back button returns home instead of closing the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (route.name === 'home' || !state.onboarded) return false;
      go(route.name === 'sheet' ? { name: 'vault' } : route.name === 'guide' ? { name: 'settings' } : route.name === 'reader' || route.name === 'study' ? { name: 'library' } : { name: 'home' });
      return true;
    });
    return () => sub.remove();
  }, [route, state.onboarded]);

  const finish: Finish = (lessonId, xp, missed = [], retried = false) => {
    let s = refreshFreezes(state);
    const before = levelFor(s.xp).title;
    const lesson = lessonId ? lessonById(lessonId) : undefined;
    const firstTime = !!lesson && !s.completed.includes(lesson.id);
    if (lesson && firstTime) {
      s = addLessonCards({ ...s, completed: [...s.completed, lesson.id] }, lesson);
      s = { ...s, newToday: { day: dayStr(), count: newLessonsToday(s) + 1 } };
    }
    if (lesson && missed.length) s = addBugs(s, missed.map((step) => ({ lessonId: lesson.id, step })));
    const total = xp + (lesson ? XP.lesson : 0);
    s = { ...s, xp: s.xp + total };
    const day = markDayDone(s);
    s = day.state;
    const after = levelFor(s.xp).title;
    const sheet = lesson && firstTime && bossOf(lesson.stage)?.id === lesson.id ? lesson.stage : null;
    // Treats for Meng: learning earns snacks.
    const treats =
      (lesson ? (firstTime ? 2 : 1) : 1) +
      (sheet !== null ? 5 : 0) +
      (after !== before ? 3 : 0) +
      (day.newDay && [7, 14, 30, 50, 100, 200, 365].includes(s.streak) ? 5 : 0);
    s = addTreats(s, treats);
    setState(() => s);
    syncReminders(s);
    go({
      name: 'reward',
      xp: total,
      title: lesson ? lesson.title : 'Review round',
      newDay: day.newDay,
      usedFreeze: day.usedFreeze,
      streak: s.streak,
      levelUp: after !== before ? after : null,
      sheet,
      retried,
      treats,
    });
  };

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  let screen: React.ReactNode;
  if (!state.onboarded) screen = <OnboardingScreen first onDone={() => go({ name: 'path' })} />;
  else
    switch (route.name) {
      case 'lesson':
        screen = <LessonScreen key={route.id} id={route.id} xpSoFar={route.xpSoFar} go={go} finish={finish} />;
        break;
      case 'review':
        screen = <ReviewScreen items={route.items} then={route.then} mode={route.mode} go={go} finish={finish} />;
        break;
      case 'reward':
        screen = <RewardScreen {...route} go={go} />;
        break;
      case 'path':
        screen = <PathScreen go={go} />;
        break;
      case 'bugbook':
        screen = <BugBookScreen go={go} />;
        break;
      case 'vault':
        screen = <VaultScreen go={go} />;
        break;
      case 'sheet':
        screen = <SheetScreen stage={route.stage} go={go} />;
        break;
      case 'tour':
        screen = <OnboardingScreen onDone={() => go({ name: 'settings' })} />;
        break;
      case 'guide':
        screen = <GuideScreen id={route.id} go={go} />;
        break;
      case 'library':
        screen = <LibraryScreen go={go} />;
        break;
      case 'study':
        screen = <StudyScreen key={route.stage} stage={route.stage} go={go} />;
        break;
      case 'reader':
        screen = <ReaderScreen key={route.id} id={route.id} go={go} />;
        break;
      case 'meng':
        screen = <MengScreen go={go} />;
        break;
      case 'playground':
        screen = (
          <Screen>
            <TopBar onBack={() => go({ name: 'home' })} />
            <Txt v="h1">SQL playground</Txt>
            <SqlPlayground />
          </Screen>
        );
        break;
      case 'settings':
        screen = <SettingsScreen go={go} />;
        break;
      default:
        screen = <HomeScreen go={go} />;
    }

  const tab: Tab | null =
    state.onboarded && (route.name === 'home' || route.name === 'path' || route.name === 'library' || route.name === 'meng' || route.name === 'settings') ? route.name : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={resolveTheme(state.settings.theme) === 'dark' ? 'light' : 'dark'} />
      <TabsContext.Provider value={!!tab}>
        <View style={{ flex: 1 }}>{screen}</View>
      </TabsContext.Provider>
      {tab ? <TabBar active={tab} onTab={(t) => go({ name: t })} /> : null}
    </View>
  );
}

/** Loading screen: waits for fonts, saved progress, sounds, voices and the SQL sandbox. */
function Boot({ fontsReady }: { fontsReady: boolean }) {
  const { state, ready } = useApp();
  const [steps, setSteps] = useState({ sounds: false, voices: false, sql: false });
  const [minDone, setMinDone] = useState(false);
  const [forced, setForced] = useState(false);
  const [show, setShow] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const mark = (k: keyof typeof steps) => setSteps((p) => ({ ...p, [k]: true }));
    try {
      preloadSfx();
    } catch {}
    mark('sounds');
    englishVoices().finally(() => mark('voices'));
    runQuery('SELECT 1').finally(() => mark('sql'));
    const a = setTimeout(() => setMinDone(true), 900);
    const b = setTimeout(() => setForced(true), 6000); // never get stuck on loading
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  const parts = [fontsReady, ready, steps.sounds, steps.voices, steps.sql];
  const progress = parts.filter(Boolean).length / parts.length;
  const done = fontsReady && ready && minDone && (progress === 1 || forced);

  if (!show)
    return <LoadingScreen progress={progress} done={done} name={ready ? state.settings.name || 'Tori' : 'Tori'} fontsReady={fontsReady} onFinish={() => setShow(true)} />;
  return (
    <ErrorBoundary onReset={() => setResetKey((k) => k + 1)}>
      <Root key={resetKey} />
    </ErrorBoundary>
  );
}

export default function App() {
  // If fonts fail to load, the app still works with system fonts.
  const [loaded, error] = useFonts({ Nunito_800ExtraBold, AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold });
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Boot fontsReady={loaded || !!error} />
      </AppProvider>
    </SafeAreaProvider>
  );
}
