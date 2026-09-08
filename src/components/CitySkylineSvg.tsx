import React from 'react';
import Svg, { Path, Rect, Circle, SvgProps } from 'react-native-svg';

export interface CitySkylineSvgProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
}

export const CitySkylineSvg: React.FC<CitySkylineSvgProps> = ({
  width = 210,
  height = 95,
  color = '#18258F',
  opacity = 0.15,
  style,
  ...props
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 280 110"
      fill="none"
      style={[{ opacity }, style]}
      {...props}
    >
      {/* BACKGROUND SKYLINE (Tall Spire, Antenna, High-rises) */}
      {/* High-Rise Spire Left */}
      <Path d="M42 2 L38 20 H46 Z" fill={color} opacity={0.4} />
      <Rect x="36" y="20" width="12" height="90" rx="1.5" fill={color} opacity={0.35} />
      
      {/* Classic Skyscraper */}
      <Path d="M78 8 L72 26 H84 Z" fill={color} opacity={0.45} />
      <Rect x="68" y="26" width="20" height="84" rx="2" fill={color} opacity={0.4} />
      
      {/* Stepped Corporate Tower */}
      <Rect x="108" y="16" width="16" height="94" rx="1" fill={color} opacity={0.35} />
      <Rect x="104" y="32" width="24" height="78" rx="1.5" fill={color} opacity={0.4} />
      <Rect x="98" y="48" width="36" height="62" rx="2" fill={color} opacity={0.45} />

      {/* Communications Mast / Telecom Tower */}
      <Path d="M152 4 L150 38 H154 Z" fill={color} opacity={0.5} />
      <Circle cx="152" cy="14" r="5" stroke={color} strokeWidth="1.2" opacity={0.5} />
      <Circle cx="152" cy="24" r="8" stroke={color} strokeWidth="1.2" opacity={0.45} />
      <Rect x="144" y="38" width="16" height="72" rx="2" fill={color} opacity={0.35} />

      {/* Modern High-Rise Right */}
      <Path d="M192 12 L186 28 H198 Z" fill={color} opacity={0.45} />
      <Rect x="182" y="28" width="20" height="82" rx="2" fill={color} opacity={0.38} />
      
      {/* Far Right Tower */}
      <Rect x="220" y="22" width="18" height="88" rx="2" fill={color} opacity={0.32} />
      <Rect x="248" y="36" width="22" height="74" rx="2" fill={color} opacity={0.3} />

      {/* FOREGROUND SKYLINE (Mid-rise Urban Buildings) */}
      {/* Building 1 (Far Left) */}
      <Rect x="6" y="52" width="24" height="58" rx="2" fill={color} opacity={0.7} />
      {/* Building 2 */}
      <Rect x="24" y="42" width="20" height="68" rx="2" fill={color} opacity={0.8} />
      {/* Building 3 with Slanted Roof */}
      <Path d="M50 38 L68 46 V110 H50 Z" fill={color} opacity={0.75} />
      {/* Building 4 */}
      <Rect x="76" y="50" width="26" height="60" rx="2" fill={color} opacity={0.85} />
      {/* Building 5 */}
      <Rect x="126" y="44" width="22" height="66" rx="2" fill={color} opacity={0.8} />
      {/* Building 6 */}
      <Rect x="156" y="54" width="28" height="56" rx="2" fill={color} opacity={0.75} />
      {/* Building 7 */}
      <Rect x="194" y="46" width="24" height="64" rx="2" fill={color} opacity={0.8} />
      {/* Building 8 */}
      <Rect x="228" y="56" width="26" height="54" rx="2" fill={color} opacity={0.7} />
      {/* Building 9 */}
      <Rect x="260" y="62" width="16" height="48" rx="2" fill={color} opacity={0.65} />

      {/* WINDOW GRIDS (Light Punch-outs) */}
      {/* Building 2 Windows */}
      <Rect x="28" y="48" width="4" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="36" y="48" width="4" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="28" y="56" width="4" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="36" y="56" width="4" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="28" y="64" width="4" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="36" y="64" width="4" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="28" y="72" width="4" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="36" y="72" width="4" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />

      {/* Building 4 Windows */}
      <Rect x="81" y="56" width="5" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="91" y="56" width="5" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="81" y="64" width="5" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="91" y="64" width="5" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="81" y="72" width="5" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="91" y="72" width="5" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />

      {/* Building 5 Windows */}
      <Rect x="131" y="52" width="4" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="139" y="52" width="4" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="131" y="60" width="4" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="139" y="60" width="4" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />

      {/* Building 7 Windows */}
      <Rect x="199" y="54" width="4" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="208" y="54" width="4" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="199" y="62" width="4" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />
      <Rect x="208" y="62" width="4" height="4" rx="0.8" fill="#FFFFFF" opacity={0.95} />

      {/* Baseline Road */}
      <Path d="M0 109 H280" stroke={color} strokeWidth={2} opacity={0.6} />
    </Svg>
  );
};
export default CitySkylineSvg;
