import emojiOptions, { Emoji } from '_src/shared/emojiOptions';

const getNextEmoji = (nextAccountIndex: number): Emoji => {
    return emojiOptions[nextAccountIndex % emojiOptions.length];
};

export default getNextEmoji;
