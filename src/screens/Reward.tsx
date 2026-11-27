import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Icon } from '../components/Icon';
import { Mascot, MascotSays } from '../components/Mascot';
import { catById, CatId, currentCat } from '../cats';
import { BigButton, Card, Screen, Stagger, Txt } from '../components/ui';
import { STAGES } from '../content';
import { useReducedMotion } from '../motion';
import { playSfx } from '../sfx';
import { Go } from '../nav';
import { useApp } from '../state';
import { space } from '../theme';

function CountUp({ to }: { to: number }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? to : 0);
  useEffect(() => {
    if (reduced) return setN(to);
    let cur = 0;
    const stepBy = Math.max(1, Math.round(to / 20));
    const t = setInterval(() => {
      cur = Math.min(to, cur + stepBy);
      setN(cur);
      if (cur >= to) clearInterval(t);
    }, 35);
    return () => clearInterval(t);
  }, [to, reduced]);
  return <>{n}</>;
}

export function RewardScreen({
  xp,
  title,
  newDay,
  usedFreeze,
  streak,
  levelUp,
  sheet,
  retried,
  treats,
  newCat = null,
  go,
}: {
  xp: number;
  title: string;
  newDay: boolean;
  usedFreeze: boolean;
  streak: number;
  levelUp: string | null;
  sheet: number | null;
  retried: boolean;
  treats: number;
  newCat?: string | null;
  go: Go;
}) {
  const { colors, state } = useApp();
  const catName = currentCat(state).name;
  useEffect(() => {
    playSfx('complete');
    if (levelUp) playSfx('levelup', 900);
  }, [levelUp]);
  return (
    <Screen>
      <Stagger step={120}>
        <MascotSays mood="cheer" size={160} alive>
          <Txt v="h1" center>{retried ? 'Mastered!' : 'Lesson complete!'}</Txt>
          <Txt center color={colors.textMuted}>{title}</Txt>
        </MascotSays>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          <Card style={{ flexGrow: 1, flexBasis: 140, alignItems: 'center' }}>
            <Icon name="sparkle" size={34} color={colors.brand} />
            <Txt v="h1" center color={colors.accent}>
              +<CountUp to={xp} />
            </Txt>
            <Txt v="small" center color={colors.textMuted}>XP earned</Txt>
          </Card>
          {newDay ? (
            <Card style={{ flexGrow: 1, flexBasis: 140, alignItems: 'center' }}>
              <Icon name="flame" size={34} color={colors.brand} />
              <Txt v="h1" center>{streak}</Txt>
              <Txt v="small" center color={colors.textMuted}>day streak</Txt>
            </Card>
          ) : null}
        </View>
        {treats > 0 ? (
          <BigButton
            label={`+${treats} ${treats === 1 ? 'treat' : 'treats'} for ${catName}!`}
            sub="Visit the cat corner to share them"
            icon="fish"
            onPress={() => go({ name: 'meng' })}
          />
        ) : null}
        {usedFreeze ? (
          <Card>
            <Txt>
              <Txt bold>Streak freeze used.</Txt> It kept your streak safe.
            </Txt>
          </Card>
        ) : null}
        {levelUp ? (
          <Card tone="hero" style={{ alignItems: 'center' }}>
            <Icon name="trophy" size={40} color={colors.accent} />
            <Txt v="h2" center>Level up!</Txt>
            <Txt center>You're now a <Txt bold>{levelUp}</Txt></Txt>
          </Card>
        ) : null}
        {newCat ? (
          <Card tone="hero" style={{ alignItems: 'center' }}>
            <Mascot cat={newCat as CatId} mood="wave" size={130} />
            <Txt v="h2" center>New cat unlocked: {catById(newCat).name}!</Txt>
            <Txt center>{catById(newCat).blurb}</Txt>
            <BigButton label="Meet the cats" icon="paw" onPress={() => go({ name: 'cats' })} />
          </Card>
        ) : null}
        {sheet !== null ? (
          <BigButton
            label="New cheat sheet unlocked!"
            sub={STAGES.find((s) => s.n === sheet)?.title}
            icon="sheet"
            variant="primary"
            onPress={() => go({ name: 'sheet', stage: sheet })}
          />
        ) : null}
        <BigButton label="Back home" icon="home" variant={sheet !== null ? 'secondary' : 'primary'} onPress={() => go({ name: 'home' })} />
      </Stagger>
    </Screen>
  );
}
