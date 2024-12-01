'use client';

import styles from './Homepage.module.css';
import SearchInput from '../components/SearchInput';
import { ActionIcon, Box, TextInput } from '@mantine/core';
import { IconMapPin, IconSend, IconTicket } from '@tabler/icons-react';
import { Fade } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import { useRef, useState } from 'react';
import { Chat } from './Chat';
import { useRouter } from 'next/navigation';
import { LanguageProvider, useLanguage } from './LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
}

const Hello = ({ startChat }: any) => {
  const { language } = useLanguage();

  const buttonData = {
    'en': [
      { icon: <IconMapPin size={16} />, label: 'What to do in SPB' },
      { icon: <IconTicket size={16} />, label: 'Hermitage ticket price' },
      { icon: <IconTicket size={16} />, label: 'Best restaurants in SPB' },
      { icon: <IconTicket size={16} />, label: 'SPB metro schedule' },
      { icon: <IconTicket size={16} />, label: 'Kazan Cathedral history' },
    ],
    'ru': [
      { icon: <IconMapPin size={16} />, label: 'Что посетить в Петербурге' },
      { icon: <IconTicket size={16} />, label: 'Сколько стоит билет в Эрмитаж' },
      { icon: <IconTicket size={16} />, label: 'Лучшие рестораны СПб' },
      { icon: <IconTicket size={16} />, label: 'Расписание метро СПб' },
      { icon: <IconTicket size={16} />, label: 'История Казанского собора' },
    ],
    'cn': [
      { icon: <IconMapPin size={16} />, label: '圣彼得堡景点' },
      { icon: <IconTicket size={16} />, label: '冬宫博物馆门票价格' },
      { icon: <IconTicket size={16} />, label: '圣彼得堡最佳餐厅' },
      { icon: <IconTicket size={16} />, label: '地铁时刻表' },
      { icon: <IconTicket size={16} />, label: '喀山大教堂历史' },
    ]
  };

  const buttons = buttonData[language];
  const titles = {
    'en': 'My Saint Petersburg',
    'ru': 'Мой Санкт-Петербург',
    'cn': '我的圣彼得堡'
  };

  return (
    <div className={styles.content}>
      <h1 className={styles.title}>{titles[language]}</h1>
      <div className={styles.searchSection}>
        <Box w="60%">
          <SearchInput onSearch={startChat} />
        </Box>
      </div>
      <div className={styles.buttonsContainer}>
        {buttons.map((btn, index) => (
          <button
            key={index}
            className={styles.buttonWithIcon}
            onClick={() => { startChat(btn.label) }}
          >
            <span className="icon">{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function Homepage() {
  const [screen, setScreen] = useState('hello');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const slidesRef = useRef(null);

  const slideImages = [
    '/bg1.jpg',
    '/bg2.jpg',
    '/bg3.jpg',
    '/bg4.jpg',
    '/bg5.jpg',
  ];

  const startChat = (firstMessage: string) => {
    setScreen('chat');
    (slidesRef!.current! as any).goTo(0);

    addUserMessage(firstMessage);
    setInputValue('');
    fetchStreamingResponse(firstMessage);
  }

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      text,
      sender: 'user',
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const addBotMessage = (text: string, isStreaming: boolean = false) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      text,
      sender: 'assistant',
    };

    if (isStreaming) {
      // Update the last bot message incrementally
      setMessages((prev) => {
        const lastMessageIndex = prev.length - 1;
        const updatedMessages = [...prev];

        if (lastMessageIndex >= 0 && prev[lastMessageIndex].sender === 'assistant') {
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            text: updatedMessages[lastMessageIndex].text + text
          };
        } else {
          updatedMessages.push(newMessage);
        }

        return updatedMessages;
      });
    } else {
      // Regular message addition
      setMessages((prev) => [...prev, newMessage]);
    }
  };

  const fetchStreamingResponse = async (userMessage: string) => {
    // Create initial bot message placeholder
    var t :any =[...messages, {'sender': 'user', 'text': userMessage}];
 
    const transformedMessages = t.map((message :any) => ({
      role: message.sender,
      content: message.text
    }));

    addBotMessage('', true);

    console.log(messages);

    try {
      const response = await fetch('http://37.194.195.213:35420/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: transformedMessages,
          "max_tokens": 300,
        })
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        try {
          for (const line of lines) {
            if (line.startsWith('data: ')) {

              const jsonStr = line.slice(6);
              if (jsonStr === '[DONE]') break;

              const delta = jsonStr;

              if (delta) {
                addBotMessage(delta, true);
              }

            }
          }
        } catch (parseError) {
          console.error('Error parsing chunk:', parseError);
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      addBotMessage('Извините, произошла ошибка при получении ответа.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addUserMessage(inputValue);
      setInputValue('');
      fetchStreamingResponse(inputValue);
    }
  };

  return (
    <LanguageProvider>
      <div className={styles.pageContainer}>
        <LanguageSwitcher />
        <div className={styles.slideshow}>
          <Fade
            ref={slidesRef}
            autoplay={screen == 'hello' ? true : false}
            duration={10000}
            transitionDuration={2000}
            arrows={false}
            infinite={true}
          >
            {slideImages.map((image, index) => (
              <div key={index} className={styles.eachSlide}>
                <img src={image} alt={`Background ${index + 1}`} />
              </div>
            ))}
          </Fade>
        </div>
        {screen == 'hello' &&
          <Hello startChat={startChat} />}

        {screen == 'chat' &&
          <Box className={styles.chatContainer}>
            <Box className={styles.chatBox}>
              <div className={styles.chatContainer2}>
                <Chat messages={messages} />

                <form onSubmit={handleSubmit} className={styles.inputContainer}>
                  <TextInput
                    placeholder="Введите ваше сообщение..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    rightSection={
                      <ActionIcon size={32} radius="xl" color="blue" variant="filled" type="submit">
                        <IconSend size="1.1rem" stroke={1.5} />
                      </ActionIcon>
                    }
                    radius="xl"
                    size="md"
                    className={styles.input}
                  />
                </form>
              </div>
            </Box>
          </Box>}
      </div>
    </LanguageProvider>
  );
}