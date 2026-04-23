import { Core_BROWN_TECHNIQUES_TAKEDOWNS_STANDING } from "./core/brown/takedowns-standing";
import { Core_BROWN_TECHNIQUES_GUARD_WORK } from "./core/brown/guard-work";
import { Core_BROWN_TECHNIQUES_GUARD_PASSING } from "./core/brown/guard-passing";
import { Core_BROWN_TECHNIQUES_SIDE_CONTROL } from "./core/brown/side-control";
import { Core_BROWN_TECHNIQUES_MOUNT } from "./core/brown/mount";
import { Core_BROWN_TECHNIQUES_BACK_REAR_MOUNT } from "./core/brown/back-rear-mount";
import { Core_BROWN_TECHNIQUES_TURTLE_LEG_ENTANGLEMENTS } from "./core/brown/turtle-leg-entanglements";
import { Core_BROWN_TECHNIQUES_SUBMISSIONS } from "./core/brown/submissions";
import { Core_BROWN_TECHNIQUES_SELF_DEFENSE } from "./core/brown/self-defense";
import { Core_BROWN_TECHNIQUES_ESCAPES } from "./core/brown/escapes";

/**
 * Brown Belt core curriculum.
 * Split by position for easier maintenance and gym-specific extension.
 */
export const Core_BROWN_TECHNIQUES = [
  ...Core_BROWN_TECHNIQUES_TAKEDOWNS_STANDING,
  ...Core_BROWN_TECHNIQUES_GUARD_WORK,
  ...Core_BROWN_TECHNIQUES_GUARD_PASSING,
  ...Core_BROWN_TECHNIQUES_SIDE_CONTROL,
  ...Core_BROWN_TECHNIQUES_MOUNT,
  ...Core_BROWN_TECHNIQUES_BACK_REAR_MOUNT,
  ...Core_BROWN_TECHNIQUES_TURTLE_LEG_ENTANGLEMENTS,
  ...Core_BROWN_TECHNIQUES_SUBMISSIONS,
  ...Core_BROWN_TECHNIQUES_SELF_DEFENSE,
  ...Core_BROWN_TECHNIQUES_ESCAPES,
];
