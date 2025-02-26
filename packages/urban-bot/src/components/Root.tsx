import React, { useCallback, useEffect } from 'react';
import { getBotContext } from '../context';
import { ErrorBoundary } from './ErrorBoundary';
import { ManagerBot } from '../ManagerBot/ManagerBot';
import { UrbanBotType, UrbanChat, UrbanParseMode } from '../types';
import { UrbanBot } from '../types/UrbanBot';
import { UrbanSyntheticEvent } from '../types/Events';
import { getExpressApp, listen } from '../expressApp';
import { Express } from 'express';

export type ChatProps<Bot extends UrbanBot, BotType extends UrbanBotType> = {
    bot: Bot;
    chat: UrbanChat;
    isNewMessageEveryRender: boolean;
    parseMode?: UrbanParseMode;
    $$managerBot: ManagerBot<BotType>;
    children: React.ReactNode;
    key: string;
};

function Chat<Bot extends UrbanBot, BotType extends UrbanBotType>({
    bot,
    children,
    isNewMessageEveryRender,
    chat,
    parseMode,
    $$managerBot,
}: ChatProps<Bot, BotType>) {
    const BotContext = getBotContext<Bot, BotType>();

    return (
        <BotContext.Provider value={{ bot, isNewMessageEveryRender, chat, parseMode, $$managerBot }}>
            <ErrorBoundary>{children}</ErrorBoundary>
        </BotContext.Provider>
    );
}

export type RootProps<Bot extends UrbanBot, BotType extends UrbanBotType> = {
    bot: Bot;
    expressApp?: Express;
    children: React.ReactNode;
    sessionTimeSeconds?: number;
    isNewMessageEveryRender?: boolean;
    parseMode?: UrbanParseMode;
    port?: number;
    // TODO add to docs
    initialChats?: UrbanChat[];
    onAnyEvent?: (event: UrbanSyntheticEvent<BotType>) => void;
};

export function Root<Bot extends UrbanBot = UrbanBot, BotType extends UrbanBotType = UrbanBotType>({
    children,
    bot,
    sessionTimeSeconds = 60 * 60 * 24 * 7,
    isNewMessageEveryRender = true,
    parseMode,
    port = 8080,
    expressApp,
    initialChats = [],
    onAnyEvent,
}: RootProps<Bot, BotType>) {
    // TODO get chats from $$managerBot?
    const [chats, setChats] = React.useState(new Map<string, React.ReactElement>());
    const chatsRef = React.useRef(chats);
    chatsRef.current = chats;

    const timeoutIdsRef = React.useRef<{ [key: string]: NodeJS.Timer }>({});

    const [firstMessage, setFirstMessage] = React.useState<UrbanSyntheticEvent<BotType>>();

    React.useEffect(() => {
        if (bot.initializeServer !== undefined) {
            const { app } = getExpressApp(port, expressApp);
            bot.initializeServer(app);
            listen(port);
        }
    }, [port, bot, expressApp]);
    const $$managerBot = React.useMemo(() => new ManagerBot(bot), [bot]);

    const registerChat = useCallback(
        (chat: UrbanChat) => {
            chatsRef.current.set(
                chat.id,
                <Chat
                    bot={bot}
                    $$managerBot={$$managerBot}
                    key={chat.id}
                    isNewMessageEveryRender={isNewMessageEveryRender}
                    chat={chat}
                    parseMode={parseMode}
                >
                    {children}
                </Chat>,
            );
            $$managerBot.addChat(chat.id);
            setChats(new Map(chatsRef.current));
        },
        [$$managerBot, bot, children, isNewMessageEveryRender, parseMode],
    );

    useEffect(() => {
        initialChats.forEach((chat) => {
            if (!chatsRef.current.has(chat.id)) {
                registerChat(chat);
            }
        });
    }, [initialChats, registerChat]);

    React.useEffect(() => {
        function handler(message: UrbanSyntheticEvent<BotType>) {
            const { chat } = message;
            const { id: chatId } = chat;

            if (!chatsRef.current.has(chatId)) {
                registerChat(chat);
                setFirstMessage(message);
            }

            if (sessionTimeSeconds && sessionTimeSeconds !== Infinity) {
                clearTimeout(timeoutIdsRef.current[chatId]);
                timeoutIdsRef.current[chatId] = setTimeout(() => {
                    chatsRef.current.delete(chatId);
                    $$managerBot.deleteChat(chatId);
                    setChats(new Map(chatsRef.current));
                }, sessionTimeSeconds * 1000);
            }

            onAnyEvent?.(message);
        }

        $$managerBot.on('any', handler);

        return () => {
            $$managerBot.removeListener('any', handler);
        };
    }, [$$managerBot, registerChat, sessionTimeSeconds]);

    React.useEffect(() => {
        if (firstMessage !== undefined) {
            // First message is needed to register chat and initialize react children for it.
            // After initializing we repeat this message that react children can process it.
            $$managerBot.emit(firstMessage.type, firstMessage);
        }
    }, [firstMessage, $$managerBot]);

    return (
        <>
            {Array.from(chats).map(([id, children]) => {
                return <chat key={id}>{children}</chat>;
            })}
        </>
    );
}
