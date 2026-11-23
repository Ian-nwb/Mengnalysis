import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { View } from 'react-native';
import { MascotSays } from '../components/Mascot';
import { BigButton, Card, Kicker, ListenButton, Screen, TopBar, Txt } from '../components/ui';
import { SHEETS } from '../content/cheatsheets';
import { bossOf, stageBeaten } from '../engine';
import { Go } from '../nav';
import { useApp } from '../state';
import { BRAND } from '../theme';

export function VaultScreen({ go }: { go: Go }) {
  const { state } = useApp();
  const unlocked = SHEETS.filter((s) => stageBeaten(state, s.stage)).length;
  return (
    <Screen>
      <TopBar onBack={() => go({ name: 'home' })} />
      <MascotSays mood="happy">
        <Txt v="h1">Cheat sheets</Txt>
        <Txt>Beat a stage's boss level to unlock its one-page cheat sheet. {unlocked} of {SHEETS.length} unlocked so far.</Txt>
      </MascotSays>
      {SHEETS.map((sh) => {
        const open = stageBeaten(state, sh.stage);
        return (
          <BigButton
            key={sh.stage}
            label={sh.title}
            sub={open ? `Stage ${sh.stage} · tap to open` : `Locked · beat "${bossOf(sh.stage)?.title ?? 'the boss level'}"`}
            icon={open ? 'sheet' : 'lock'}
            state={open ? 'normal' : 'dim'}
            disabled={!open}
            onPress={() => go({ name: 'sheet', stage: sh.stage })}
          />
        );
      })}
    </Screen>
  );
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function SheetScreen({ stage, go }: { stage: number; go: Go }) {
  const { colors } = useApp();
  const sh = SHEETS.find((s) => s.stage === stage)!;
  const speech = `${sh.title} cheat sheet. ` + sh.sections.map((s) => `${s.heading}. ${s.lines.join('. ')}`).join('. ');

  const save = async () => {
    const html = `<html><body style="font-family:sans-serif;padding:28px;color:#1B1420">
      <h1 style="color:#7A2E8C;font-size:34px;border-bottom:6px solid ${BRAND};padding-bottom:8px">${esc(sh.title)}</h1>
      ${sh.sections
        .map(
          (s) => `<h2 style="font-size:24px;margin-top:22px">${esc(s.heading)}</h2><ul>${s.lines
            .map((l) => `<li style="font-size:20px;line-height:1.5;margin:6px 0">${esc(l)}</li>`)
            .join('')}</ul>`,
        )
        .join('')}
      <p style="margin-top:28px;color:#7A2E8C;font-size:16px">Tori · Stage ${sh.stage}</p></body></html>`;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: sh.title });
    } catch {}
  };

  return (
    <Screen>
      <TopBar onBack={() => go({ name: 'vault' })} backLabel="Cheat sheets" />
      <Card tone="hero">
        <Kicker icon="sheet">Stage {sh.stage} cheat sheet</Kicker>
        <Txt v="h1">{sh.title}</Txt>
      </Card>
      <ListenButton text={speech} />
      {sh.sections.map((s) => (
        <Card key={s.heading}>
          <Txt v="h2" color={colors.accent}>{s.heading}</Txt>
          {s.lines.map((l) => (
            <View key={l} style={{ flexDirection: 'row', gap: 10 }}>
              <Txt bold color={colors.accent}>•</Txt>
              <Txt style={{ flexShrink: 1 }}>{l}</Txt>
            </View>
          ))}
        </Card>
      ))}
      <BigButton label="Save as PDF" sub="Share to Drive, email or print" icon="save" variant="primary" onPress={save} />
    </Screen>
  );
}
