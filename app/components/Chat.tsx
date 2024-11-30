// Chat.tsx
import { useState, useRef, useEffect } from 'react';
import { Paper, ScrollArea, Stack, Text, TextInput, ActionIcon, Blockquote, stylesToString } from '@mantine/core';
import { IconInfoCircle, IconMoodSmile, IconRobotFace, IconSend } from '@tabler/icons-react';
import classes from './Chat.module.css';
import Markdown from 'react-markdown';


interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export function Chat({ messages }: { messages: Message[] }) {

  const viewport = useRef<HTMLDivElement>(null);

  const iconBot = <IconRobotFace />;
  
  const iconUser = <IconMoodSmile />;

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // className={`${classes.message} ${message.sender === 'user' ? classes.userMessage : classes.botMessage


  return (

    <ScrollArea h="calc(100vh - 80px)" viewportRef={viewport}>
      <Stack gap="md" p="md">
        {messages.map((message: any) => (

          <Blockquote key={message.id} color={ message.sender == "user" ? "rgba(100,100,100,255)" : "rgba(100,100,100,255)"} className={classes.blockquoteRoot} classNames={{
            root: message.sender == "user" ? classes.blockquoteRoot : classes.blockquoteBotRoot,
            icon: message.sender == "user" ? classes.blockquoteIcon : classes.blockquoteBotIcon,
            cite: message.sender == "user" ? classes.blockquoteCite : classes.blockquoteBotCite,
          }}  radius="xl" iconSize={50} cite={(message.sender == "user" ? "Вы" : "Помощник")} icon={message.sender == "user" ? iconUser : iconBot} mt="xl">
            <Markdown className={classes.md}>
              {message.text}
            </Markdown>
          </Blockquote>

        ))}
      </Stack>
    </ScrollArea>



  );
}