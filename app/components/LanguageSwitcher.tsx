import React from 'react';
import { useLanguage } from './LanguageContext';
import { Button, Group } from '@mantine/core';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'ru', label: 'RU' },
    { code: 'cn', label: 'CN' }
  ];

  return (
    <Group className="absolute top-4 right-4 z-50">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={language === lang.code ? 'filled' : 'outline'}
          color="blue"
          onClick={() => setLanguage(lang.code as 'en' | 'ru' | 'cn')}
          size="xs"
        >
          {lang.label}
        </Button>
      ))}
    </Group>
  );
};

export default LanguageSwitcher;