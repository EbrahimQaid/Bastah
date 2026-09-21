import React from "react";
import DukkaniLogo, { DukkaniLogoProps } from "./DukkaniLogo";

export type BastahLogoProps = DukkaniLogoProps;

/**
 * Backward compatibility alias for DukkaniLogo
 */
export default function BastahLogo(props: BastahLogoProps) {
  return <DukkaniLogo {...props} />;
}

export { DukkaniLogo };
