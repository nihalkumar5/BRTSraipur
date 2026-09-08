import React from 'react';
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';

export interface CitySkylineSvgProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
}

export const CitySkylineSvg: React.FC<CitySkylineSvgProps> = ({
  width = 180,
  height = 80,
  color = '#18258F',
  opacity = 0.12,
  style,
  ...props
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 240 100"
      fill="none"
      style={[{ opacity }, style]}
      {...props}
    >
      {/* City Skyline Buildings & Monuments */}
      {/* Background Layer Buildings */}
      <Rect x="15" y="45" width="22" height="55" rx="2" fill={color} opacity={0.35} />
      <Rect x="42" y="30" width="26" height="70" rx="2" fill={color} opacity={0.4} />
      <Path d="M55 12 L47 30 H63 Z" fill={color} opacity={0.4} />
      <Rect x="73" y="40" width="30" height="60" rx="2" fill={color} opacity={0.3} />
      <Rect x="108" y="22" width="28" height="78" rx="2" fill={color} opacity={0.45} />
      <Path d="M122 6 L113 22 H131 Z" fill={color} opacity={0.45} />
      <Rect x="141" y="35" width="34" height="65" rx="2" fill={color} opacity={0.35} />
      <Rect x="180" y="48" width="24" height="52" rx="2" fill={color} opacity={0.4} />
      <Rect x="208" y="32" width="22" height="68" rx="2" fill={color} opacity={0.35} />

      {/* Foreground Layer Buildings */}
      <Rect x="5" y="58" width="24" height="42" rx="2" fill={color} opacity={0.7} />
      <Rect x="33" y="50" width="20" height="50" rx="2" fill={color} opacity={0.8} />
      <Rect x="58" y="55" width="24" height="45" rx="2" fill={color} opacity={0.75} />
      <Rect x="87" y="42" width="26" height="58" rx="2" fill={color} opacity={0.85} />
      {/* Tower Spire */}
      <Path d="M100 24 L94 42 H106 Z" fill={color} opacity={0.85} />
      <Rect x="118" y="48" width="30" height="52" rx="2" fill={color} opacity={0.8} />
      <Rect x="153" y="54" width="22" height="46" rx="2" fill={color} opacity={0.75} />
      <Rect x="180" y="60" width="28" height="40" rx="2" fill={color} opacity={0.7} />
      <Rect x="213" y="52" width="22" height="48" rx="2" fill={color} opacity={0.75} />

      {/* Building Windows Details */}
      <Rect x="37" y="56" width="4" height="4" rx="1" fill="#FFFFFF" opacity={0.9} />
      <Rect x="45" y="56" width="4" height="4" rx="1" fill="#FFFFFF" opacity={0.9} />
      <Rect x="37" y="64" width="4" height="4" rx="1" fill="#FFFFFF" opacity={0.9} />
      <Rect x="45" y="64" width="4" height="4" rx="1" fill="#FFFFFF" opacity={0.9} />
      <Rect x="37" y="72" width="4" height="4" rx="1" fill="#FFFFFF" opacity={0.9} />
      <Rect x="45" y="72" width="4" height="4" rx="1" fill="#FFFFFF" opacity={0.9} />

      <Rect x="92" y="48" width="5" height="5" rx="1" fill="#FFFFFF" opacity={0.9} />
      <Rect x="103" y="48" width="5" height="5" rx="1" fill="#FFFFFF" opacity={0.9} />
      <Rect x="92" y="58" width="5" height="5" rx="1" fill="#FFFFFF" opacity={0.9} />
      <Rect x="103" y="58" width="5" height="5" rx="1" fill="#FFFFFF" opacity={0.9} />
      <Rect x="92" y="68" width="5" height="5" rx="1" fill="#FFFFFF" opacity={0.9} />
      <Rect x="103" y="68" width="5" height="5" rx="1" fill="#FFFFFF" opacity={0.9} />

      <Rect x="124" y="54" width="5" height="5" rx="1" fill="#FFFFFF" opacity={0.9} />
      <Rect x="137" y="54" width="5" height="5" rx="1" fill="#FFFFFF" opacity={0.9} />
      <Rect x="124" y="64" width="5" height="5" rx="1" fill="#FFFFFF" opacity={0.9} />
      <Rect x="137" y="64" width="5" height="5" rx="1" fill="#FFFFFF" opacity={0.9} />

      {/* Ground Line */}
      <Path d="M0 98 H240" stroke={color} strokeWidth={2} opacity={0.5} />
    </Svg>
  );
};
export default CitySkylineSvg;
