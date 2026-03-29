import { PlayerAvatar } from '../types';

const FACE_SHAPES = ['oval', 'round', 'square', 'heart', 'oblong'];
const SKIN_COLORS = ['#FAD7B0', '#E0AC69', '#8D5524', '#C68642', '#FFDBAC'];
const HAIR_STYLES = ['short', 'medium', 'long', 'bald', 'buzz', 'fade', 'pompadour', 'undercut'];
const HAIR_COLORS = ['#000000', '#4B2C20', '#A52A2A', '#D2B48C', '#FFFFFF'];
const FACIAL_HAIR = ['none', 'stubble', 'beard', 'mustache', 'goatee'];
const EYE_COLORS = ['#000000', '#4B2C20', '#0000FF', '#008000'];

export const getRandomAvatar = (): PlayerAvatar => {
  return {
    faceShape: FACE_SHAPES[Math.floor(Math.random() * FACE_SHAPES.length)] as any,
    skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)],
    hairStyle: HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)] as any,
    hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
    facialHair: FACIAL_HAIR[Math.floor(Math.random() * FACIAL_HAIR.length)] as any,
    eyeColor: EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)],
    eyeShape: Math.floor(Math.random() * 3),
    noseShape: Math.floor(Math.random() * 3),
    earShape: Math.floor(Math.random() * 3),
  };
};

export const AVATAR_OPTIONS = {
  FACE_SHAPES,
  SKIN_COLORS,
  HAIR_STYLES,
  HAIR_COLORS,
  FACIAL_HAIR,
};
