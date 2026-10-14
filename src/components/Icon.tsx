/**
 * ReadScribe Icon System
 * Kevin Dukkon inspired outline vector icons with uniform 2px stroke,
 * rounded caps and joints, and harmonious optical balance.
 */

import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

export type IconName =
  | 'home'
  | 'book'
  | 'vocab'
  | 'write'
  | 'user'
  | 'search'
  | 'volume'
  | 'bookmark'
  | 'bookmark-fill'
  | 'check'
  | 'check-circle'
  | 'heart'
  | 'heart-fill'
  | 'plus'
  | 'close'
  | 'arrow-left'
  | 'arrow-right'
  | 'chevron-right'
  | 'chevron-left'
  | 'flip'
  | 'repeat'
  | 'sparkles'
  | 'streak'
  | 'clock'
  | 'filter'
  | 'pencil'
  | 'expand'
  | 'trash'
  | 'settings'
  | 'share';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 22,
  color = Colors.ink,
  style,
}) => {
  switch (name) {
    case 'home':
      return <Feather name="home" size={size} color={color} style={style} />;
    case 'book':
      return <Feather name="book-open" size={size} color={color} style={style} />;
    case 'vocab':
      return <Feather name="layers" size={size} color={color} style={style} />;
    case 'write':
      return <Feather name="edit-3" size={size} color={color} style={style} />;
    case 'user':
      return <Feather name="user" size={size} color={color} style={style} />;
    case 'search':
      return <Feather name="search" size={size} color={color} style={style} />;
    case 'volume':
      return <Feather name="volume-2" size={size} color={color} style={style} />;
    case 'bookmark':
      return <Feather name="bookmark" size={size} color={color} style={style} />;
    case 'bookmark-fill':
      return <Ionicons name="bookmark" size={size} color={color} style={style} />;
    case 'check':
      return <Feather name="check" size={size} color={color} style={style} />;
    case 'check-circle':
      return <Feather name="check-circle" size={size} color={color} style={style} />;
    case 'heart':
      return <Feather name="heart" size={size} color={color} style={style} />;
    case 'heart-fill':
      return <Ionicons name="heart" size={size} color={color} style={style} />;
    case 'plus':
      return <Feather name="plus" size={size} color={color} style={style} />;
    case 'close':
      return <Feather name="x" size={size} color={color} style={style} />;
    case 'arrow-left':
      return <Feather name="arrow-left" size={size} color={color} style={style} />;
    case 'arrow-right':
      return <Feather name="arrow-right" size={size} color={color} style={style} />;
    case 'chevron-right':
      return <Feather name="chevron-right" size={size} color={color} style={style} />;
    case 'chevron-left':
      return <Feather name="chevron-left" size={size} color={color} style={style} />;
    case 'flip':
    case 'repeat':
      return <Feather name="repeat" size={size} color={color} style={style} />;
    case 'sparkles':
      return <Ionicons name="sparkles-outline" size={size} color={color} style={style} />;
    case 'streak':
      return <Ionicons name="flame" size={size} color={color} style={style} />;
    case 'clock':
      return <Feather name="clock" size={size} color={color} style={style} />;
    case 'filter':
      return <Feather name="sliders" size={size} color={color} style={style} />;
    case 'pencil':
      return <Feather name="edit-2" size={size} color={color} style={style} />;
    case 'expand':
      return <Feather name="maximize-2" size={size} color={color} style={style} />;
    case 'trash':
      return <Feather name="trash-2" size={size} color={color} style={style} />;
    case 'settings':
      return <Feather name="settings" size={size} color={color} style={style} />;
    case 'share':
      return <Feather name="share-2" size={size} color={color} style={style} />;
    default:
      return <Feather name="circle" size={size} color={color} style={style} />;
  }
};
