import { useEffect, useState } from 'react';
import { getVolumes, setMusicVolume, setSfxVolume, subscribeAudioSettings } from '../lib/audioSettings';

/** Reactive read/write access to the shared music/sfx volume — see lib/audioSettings.js. */
export function useAudioSettings() {
  const [volumes, setVolumes] = useState(getVolumes());

  useEffect(() => subscribeAudioSettings(setVolumes), []);

  return { music: volumes.music, sfx: volumes.sfx, setMusicVolume, setSfxVolume };
}
