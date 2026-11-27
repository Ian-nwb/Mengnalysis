import React from 'react';
import { View } from 'react-native';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { BigButton, Card, ProgressBar, Screen, Txt } from '../components/ui';
import { CATS, currentCat, isUnlocked } from '../cats';
import { buzz } from '../haptics';
import { Go } from '../nav';
import { playSfx } from '../sfx';
import { useApp } from '../state';
import { space } from '../theme';

/** Cats: pick which cat keeps you company. New cats unlock as you learn. */
export function CatsScreen({ go }: { go: Go }) {
  void go;
  const { state, setState, colors } = useApp();
  const chosen = currentCat(state).id;
  const open = CATS.filter((c) => isUnlocked(state, c)).length;
  const choose = (id: string) => {
    buzz('success');
    playSfx('meow');
    setState((s) => ({ ...s, settings: { ...s.settings, cat: id } }));
  };
  return (
    <Screen>
      <Txt v="h1">Cats</Txt>
      <Txt color={colors.textMuted}>
        Pick who keeps you company. New friends join as you learn. {open} of {CATS.length} unlocked.
      </Txt>
      {CATS.map((c) => {
        const unlocked = isUnlocked(state, c);
        const on = c.id === chosen;
        const [have, need] = c.unlock ? c.unlock.progress(state) : [1, 1];
        return (
          <Card key={c.id} tone={on ? 'hero' : 'plain'} style={{ alignItems: 'center', gap: space.sm }}>
            <View style={{ opacity: unlocked ? 1 : 0.45 }}>
              <Mascot cat={c.id} mood={on ? 'wave' : unlocked ? 'happy' : 'sleep'} size={150} tapToMeow={unlocked} />
            </View>
            <Txt v="h2" center>{c.name}</Txt>
            <Txt center color={colors.textMuted}>{c.blurb}</Txt>
            {on ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="check" size={26} color={colors.accent} />
                <Txt bold color={colors.accent}>Keeping you company</Txt>
              </View>
            ) : unlocked ? (
              <BigButton label={`Choose ${c.name}`} icon="paw" variant="primary" onPress={() => choose(c.id)} />
            ) : (
              <View style={{ alignSelf: 'stretch', gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <Icon name="lock" size={24} color={colors.textMuted} />
                  <Txt bold>{c.unlock!.label}</Txt>
                </View>
                <ProgressBar value={Math.min(1, have / need)} height={12} label={`${c.name} unlock progress`} />
                <Txt v="small" center color={colors.textMuted}>
                  {Math.min(have, need)} of {need}
                </Txt>
              </View>
            )}
          </Card>
        );
      })}
    </Screen>
  );
}
