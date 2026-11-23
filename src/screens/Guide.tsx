import React from 'react';
import { MascotSays } from '../components/Mascot';
import { BigButton, ListenButton, Screen, TopBar, Txt } from '../components/ui';
import { GUIDES } from '../guides';
import { Go } from '../nav';

export function GuideScreen({ id, go }: { id: string; go: Go }) {
  const g = GUIDES.find((x) => x.id === id)!;
  const speech = `${g.title}. ${g.body.join(' ')}`;
  return (
    <Screen>
      <TopBar onBack={() => go({ name: 'settings' })} backLabel="Settings" />
      <MascotSays mood="happy">
        <Txt v="h1">{g.title}</Txt>
        {g.body.map((p) => (
          <Txt key={p}>{p}</Txt>
        ))}
      </MascotSays>
      <ListenButton text={speech} />
      <BigButton label="Back to Settings" icon="back" variant="primary" onPress={() => go({ name: 'settings' })} />
    </Screen>
  );
}
