import React from 'react';
import { useBotContext } from '../hooks';

export const Image = React.memo(function Image({ src, caption, buttons }) {
    const { userId, bot } = useBotContext();

    const params = {};

    if (caption) {
        params.caption = caption;
    }

    if (buttons) {
        const { props } = buttons.type(buttons.props);

        const { reply_markup } = props.params || {};

        params.reply_markup = reply_markup;
    }

    return <img src={src} bot={bot} userId={userId} params={params} />;
});
