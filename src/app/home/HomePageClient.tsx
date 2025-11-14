'use client';

import { useLayoutEffect } from 'react';
import { FaShoppingBag, FaBehance, FaLinkedin, FaCodepen } from 'react-icons/fa';

import { AudioUIPanel, useAudioDirector } from '@/features/audio';
import { Wildyriftian } from '@/features/effects';
import { siteConfig } from '@/shared/config/site';
import { SocialIcons } from '@/shared/ui';

export function HomePageClient() {
  const {
    actions: { setHome, resume },
  } = useAudioDirector();

  // Return to home audio scene when mounting
  useLayoutEffect(() => {
    void resume().then(() => setHome());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const socialItems = [
    {
      name: 'Gumroad',
      url: siteConfig.social.gumroad,
      icon: <FaShoppingBag />,
    },
    {
      name: 'Behance',
      url: siteConfig.social.behance,
      icon: <FaBehance />,
    },
    {
      name: 'LinkedIn',
      url: siteConfig.social.linkedin,
      icon: <FaLinkedin />,
    },
    {
      name: 'CodePen',
      url: siteConfig.social.codepen,
      icon: <FaCodepen />,
    },
  ];

  return (
    <>
      <SocialIcons items={socialItems} />
      <Wildyriftian />
      <AudioUIPanel className="audio-panel-fixed" />
    </>
  );
}
