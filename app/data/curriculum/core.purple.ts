import { Core_PURPLE_TECHNIQUES_TAKEDOWNS_STANDING } from "./core/purple/takedowns-standing";
import { Core_PURPLE_TECHNIQUES_GUARD_WORK } from "./core/purple/guard-work";
import { Core_PURPLE_TECHNIQUES_GUARD_PASSING } from "./core/purple/guard-passing";
import { Core_PURPLE_TECHNIQUES_SIDE_CONTROL } from "./core/purple/side-control";
import { Core_PURPLE_TECHNIQUES_MOUNT } from "./core/purple/mount";
import { Core_PURPLE_TECHNIQUES_BACK_REAR_MOUNT } from "./core/purple/back-rear-mount";
import { Core_PURPLE_TECHNIQUES_TURTLE_LEG_ENTANGLEMENTS } from "./core/purple/turtle-leg-entanglements";
import { Core_PURPLE_TECHNIQUES_SUBMISSIONS } from "./core/purple/submissions";
import { Core_PURPLE_TECHNIQUES_SELF_DEFENSE } from "./core/purple/self-defense";
import { Core_PURPLE_TECHNIQUES_ESCAPES } from "./core/purple/escapes";

/**
 * Purple Belt core curriculum.
 * Split by position for easier maintenance and gym-specific extension.
 */
export const Core_PURPLE_TECHNIQUES = [
  ...Core_PURPLE_TECHNIQUES_TAKEDOWNS_STANDING,
  ...Core_PURPLE_TECHNIQUES_GUARD_WORK,
  ...Core_PURPLE_TECHNIQUES_GUARD_PASSING,
  ...Core_PURPLE_TECHNIQUES_SIDE_CONTROL,
  ...Core_PURPLE_TECHNIQUES_MOUNT,
  ...Core_PURPLE_TECHNIQUES_BACK_REAR_MOUNT,
  ...Core_PURPLE_TECHNIQUES_TURTLE_LEG_ENTANGLEMENTS,
  ...Core_PURPLE_TECHNIQUES_SUBMISSIONS,
  ...Core_PURPLE_TECHNIQUES_SELF_DEFENSE,
  ...Core_PURPLE_TECHNIQUES_ESCAPES,
];
