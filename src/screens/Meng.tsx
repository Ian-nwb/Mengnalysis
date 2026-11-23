import React, { useState } from 'react';
import { View } from 'react-native';
import { Icon } from '../components/Icon';
import { MascotSays, Mood } from '../components/Mascot';
import { BigButton, Card, Kicker, ProgressBar, Screen, TopBar, Txt } from '../components/ui';
import { Go } from '../nav';
import { fullnessWord, happinessWord, PET_ITEMS, PetItem } from '../pet';
import { playSfx } from '../sfx';
import { useApp } from '../state';
import { space } from '../theme';

export function MengScreen({ go }: { go: Go }) {
  const { state, setState, colors } = useApp();
  const pet = state.pet;
  const [said, setSaid] = useState<string | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);

  const give = (it: PetItem) => {
    if (pet.treats < it.cost) return;
    setState((s) => ({
      ...s,
      pet: {
        ...s.pet,
        treats: s.pet.treats - it.cost,
        fullness: Math.min(100, s.pet.fullness + it.full),
        happiness: Math.min(100, s.pet.happiness + it.happy),
        fedTotal: s.pet.fedTotal + 1,
      },
    }));
    playSfx('meow');
    setMood('cheer');
    setSaid(it.line);
  };
  const petMeng = () => {
    setState((s) => ({ ...s, pet: { ...s.pet, happiness: Math.min(100, s.pet.happiness + 3) } }));
    playSfx('meow');
    setMood('happy');
    setSaid(['Purrrr…', 'Right behind the ears, please.', 'You are my favorite human.', 'Mrrp! ♡'][Math.floor(Math.random() * 4)]);
  };

  const baseMood: Mood = pet.fullness < 30 ? 'think' : pet.happiness < 30 ? 'encourage' : 'wave';
  const baseLine =
    pet.fullness < 30
      ? "My tummy says it's snack o'clock. No rush though!"
      : pet.happiness < 30
        ? 'Want to play a little? I missed you!'
        : "Hi Tori! Every lesson earns treats. Let's see what's on the menu.";

  const row = (it: PetItem) => {
    const short = it.cost - pet.treats;
    return (
      <BigButton
        key={it.id}
        label={it.name}
        sub={
          short > 0
            ? `${it.cost} treats · need ${short} more`
            : `${it.cost} ${it.cost === 1 ? 'treat' : 'treats'} · ${it.kind === 'food' ? `+${it.full} fullness` : `+${it.happy} happiness`}`
        }
        icon={it.icon}
        state={short > 0 ? 'dim' : 'normal'}
        disabled={short > 0}
        onPress={() => give(it)}
      />
    );
  };

  return (
    <Screen>
      <MascotSays mood={mood ?? baseMood} size={170}>
        <Txt v="h1">Meng's corner</Txt>
        <Txt>{said ?? baseLine}</Txt>
      </MascotSays>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon name="fish" size={34} color={colors.brand} />
          <Txt v="h2">{pet.treats} {pet.treats === 1 ? 'treat' : 'treats'}</Txt>
        </View>
        <Kicker icon="bowl">Fullness: {fullnessWord(pet.fullness)} ({pet.fullness}/100)</Kicker>
        <ProgressBar value={pet.fullness / 100} height={14} label="Fullness" />
        <Kicker icon="heart">Happiness: {happinessWord(pet.happiness)} ({pet.happiness}/100)</Kicker>
        <ProgressBar value={pet.happiness / 100} height={14} label="Happiness" />
        <Txt v="small" color={colors.textMuted}>Snacks shared so far: {pet.fedTotal}</Txt>
      </Card>

      <BigButton label="Pet Meng" sub="Free, always" icon="heart" variant="primary" onPress={petMeng} />

      <Txt v="h2">Food</Txt>
      <View style={{ gap: space.sm }}>{PET_ITEMS.filter((x) => x.kind === 'food').map(row)}</View>
      <Txt v="h2">Toys</Txt>
      <View style={{ gap: space.sm }}>{PET_ITEMS.filter((x) => x.kind === 'toy').map(row)}</View>

      <Card tone="inset">
        <Kicker icon="sparkle">How to earn treats</Kicker>
        <Txt>• New lesson: +2 · replay or review round: +1</Txt>
        <Txt>• Beat a boss level: +5 · level up: +3</Txt>
        <Txt>• Streak milestones (7, 14, 30… days): +5</Txt>
      </Card>
    </Screen>
  );
}
