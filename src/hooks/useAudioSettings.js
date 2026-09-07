import { useEffect, useState } from 'react';
import { getVolumes, setSfxVolume, subscribeAudioSettings } from '../lib/audioSettings';

/** Reactive read/write access to the shared sound-effects volume — see lib/audioSettings.js. */
export function useAudioSettings() {
  const [volumes, setVolumes] = useState(getVolumes());

  useEffect(() => subscribeAudioSettings(setVolumes), []);

  return { sfx: volumes.sfx, setSfxVolume };
}
