import { DEFAULT_TASK_DESCRIPTION } from '../constants';

const BR_TAG_REGEX = /<br\s*\/?>(\s|&nbsp;|\u00a0)*/gi;
const TAG_REGEX = /<[^>]*>/g;
const NBSP_REGEX = /&nbsp;|\u00a0/g;

export const isRichTextEmpty = (value: string): boolean => {
  if (!value) {
    return true;
  }

  const withoutBreaks = value.replace(BR_TAG_REGEX, ' ');
  const text = withoutBreaks.replace(TAG_REGEX, ' ').replace(NBSP_REGEX, ' ').trim();

  return text.length === 0;
};

export const normalizeTaskContent = (value: string): string => {
  return isRichTextEmpty(value) ? DEFAULT_TASK_DESCRIPTION : value;
};
