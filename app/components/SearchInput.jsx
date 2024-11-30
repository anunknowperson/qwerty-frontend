// components/SearchInput.jsx

'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './SearchInput.module.css';
import { TextInput, Button } from '@mantine/core';

const exampleQueries = [
  'Что посетить в Петербурге',
  'Сколько стоит билет в Эрмитаж',
  'Лучшие рестораны Санкт-Петербурга',
  'Расписание метро СПб',
  'История Казанского собора',
];

export default function SearchInput({ onSearch }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentQueryIndex, setCurrentQueryIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [inputValue, setInputValue] = useState(''); // State for input value
  
  const typingSpeed = 150; // Milliseconds per character
  const deletingSpeed = 100; // Milliseconds per character deletion
  const pauseDuration = 1500; // Milliseconds to pause after typing a query
  const timeoutRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isPaused) return;

    const currentQuery = exampleQueries[currentQueryIndex];

    if (isDeleting) {
      if (displayedText.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedText(currentQuery.substring(0, displayedText.length - 1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setCurrentQueryIndex((prev) => (prev + 1) % exampleQueries.length);
      }
    } else {
      if (displayedText.length < currentQuery.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedText(currentQuery.substring(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        timeoutRef.current = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    }

    return () => clearTimeout(timeoutRef.current);
  }, [displayedText, isDeleting, isPaused, currentQueryIndex]);

  const handleFocus = () => {
    setIsPaused(true);
  };

  const handleBlur = () => {
    setIsPaused(false);
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(inputValue); // Call the callback with the inputted text
    }
  };

  // New handler for key down events
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={styles.searchContainer}>
      <TextInput
        ref={inputRef}
        placeholder={isPaused ? 'Введите запрос...' : displayedText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        classNames={{ input: styles.input }}
        size="lg"
        w="100%"
        value={inputValue} // Bind input value to state
        onChange={(e) => setInputValue(e.target.value)} // Update state on input change
        onKeyDown={handleKeyDown} // Attach the key down handler
      />
      <Button className={styles.searchButton} size="lg" onClick={handleSearch}>
        Узнать
      </Button>
    </div>
  );
}
