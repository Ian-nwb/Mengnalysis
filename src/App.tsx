import { AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold } from '@expo-google-fonts/atkinson-hyperlegible';
import { Nunito_800ExtraBold, useFonts } from '@expo-google-fonts/nunito';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SqlPlayground } from './components/sql';
import { Screen, TopBar, Txt } from './components/ui';
import { lessonById } from './content';
import { addBugs, addLessonCards, addTreats, bossOf, dayStr, doneToday, levelFor, markDayDone, newLessonsToday, refreshFreezes, tickPet, XP } from './engine';
import { MengScreen } from './screens/Meng';
import { Finish, Route } from './nav';
import { scheduleReminders } from './reminders';
import { BugBookScreen } from './screens/BugBook';
import { GuideScreen } from './screens/Guide';
import { HomeScreen } from './screens/Home';
import { OnboardingScreen } from './screens/Onboarding';
import { PathScreen } from './screens/Path';
import { RewardScreen } from './screens/Reward';
import { LessonScreen, ReviewScreen } from './screens/Session';
import { SettingsScreen } from './screens/Settings';
import { SheetScreen, VaultScreen } from './screens/Vault';
import { AppProvider, useApp } from './state';
import { setSfxEnabled } from './sfx';
import { setVoiceSetting, stopSpeaking } from './voice';

function Root() {
  const { state, ready, setState, colors } = useApp();
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const booted = useRef(false);

  // On launch: refill the weekly streak freeze and refresh reminders.
  useEffect(() => {
    if (!ready || booted.current) return;
    booted.current = true;
    setState((s) => tickPet(refreshFreezes(s)));
    if (state.onboarded) scheduleReminders(state.settings.reminderHour, state.settings.reminderMinute, doneToday(state));
  }, [ready, state, setState]);

  useEffect(() => setVoiceSetting(state.settings.voiceId), [state.settings.voiceId]);
  useEffect(() => setSfxEnabled(state.settings.sounds), [state.settings.sounds]);

  const go = (r: Route) => {
    stopSpeaking();
    setRoute(r);
  };

  // Android back button returns home instead of closing the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (route.name === 'home' || !state.onboarded) return false;
      go(route.name === 'sheet' ? { name: 'vault' } : route.name === 'guide' ? { name: 'settings' } : { name: 'home' });
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
    scheduleReminders(s.settings.reminderHour, s.settings.reminderMinute, true);
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={state.settings.theme === 'dark' ? 'light' : 'dark'} />
      {screen}
    </View>
  );
}

export default function App() {
  // If fonts fail to load, the app still works with system fonts.
  const [loaded, error] = useFonts({ Nunito_800ExtraBold, AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold });
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: '#1B1420' }} />;
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}
