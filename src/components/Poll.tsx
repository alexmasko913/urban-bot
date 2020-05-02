import React from 'react';
import { useAction, useBotContext } from '../hooks/hooks';
import { useFormattedText } from '../hooks/useFormattedText';
import { UrbanMessageCommonData } from '../types/Messages';
import { ButtonGroupProps } from './ButtonGroup';
import { useFormattedButtons } from '../hooks/useFormattedButtons';
import { OtherProps } from '../types/common';
import { formatOptionElement } from '../utils/formatOptionElement';

export type PollProps = UrbanMessageCommonData & {
    question: string;
    children: React.ReactElement<OptionProps> | React.ReactElement<OptionProps>[];
    buttons?: React.FunctionComponentElement<ButtonGroupProps>;
    isNewMessageEveryRender?: boolean;
    isAnonymous?: boolean;
    type?: string;
    withMultipleAnswers?: boolean;
    rightOption?: string | number;
    explanation?: React.ReactChild;
    activeSeconds?: number;
    closeTime?: number;
};

export function Poll({
    buttons: buttonGroupElement,
    isNewMessageEveryRender: isNewMessageEveryRenderProp,
    question,
    children,
    isAnonymous,
    type,
    withMultipleAnswers,
    rightOption,
    explanation,
    activeSeconds,
    closeTime,
    disableNotification,
    forceReply,
    parseMode,
    replyToMessageId,
    ...otherProps
}: PollProps) {
    const { $$managerBot, isNewMessageEveryRender: isNewMessageEveryRenderContext, chat } = useBotContext();

    const [formattedQuestion, finalParseMode] = useFormattedText(question, parseMode);
    const [formattedExplanation] = useFormattedText(explanation, parseMode);
    const formattedButtons = useFormattedButtons(buttonGroupElement);
    const options = formatOptionElement(children);

    useAction((ctx) => {
        const { actionId } = ctx;

        const option = options.find(({ id }) => {
            return actionId === id;
        });

        option?.onClick?.(ctx);
    });

    return (
        <urban-poll
            $$managerBot={$$managerBot}
            chat={chat}
            isNewMessageEveryRender={isNewMessageEveryRenderProp ?? isNewMessageEveryRenderContext}
            data={{
                question: formattedQuestion,
                options,
                isAnonymous,
                type,
                withMultipleAnswers,
                rightOption,
                explanation: formattedExplanation,
                activeSeconds,
                closeTime,
                disableNotification,
                replyToMessageId,
                forceReply,
                parseMode: finalParseMode,
                buttons: formattedButtons,
                ...otherProps,
            }}
        />
    );
}

export type OptionProps = OtherProps & {
    children: string;
    // FIXME describe type for onClick?
    onClick?: (...args: unknown[]) => unknown;
    id?: string;
};

export function Option(_props: OptionProps) {
    return null;
}