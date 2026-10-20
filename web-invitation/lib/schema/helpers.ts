import { z } from 'zod';
import {
  InvitationConfig,
  InvitationConfigSchema,
  Theme,
  Section,
  Element,
  Breakpoint,
  TypographyStyle,
  BoxStyle,
  TransformStyle,
} from './invitation.schema';

export interface ParseResultSuccess {
  success: true;
  data: InvitationConfig;
}

export interface ParseResultFailure {
  success: false;
  error: z.ZodError;
  formattedErrors: string[];
}

export type ParseInvitationResult = ParseResultSuccess | ParseResultFailure;

/**
 * Parses and validates an unknown payload into an InvitationConfig,
 * returning formatted user-readable error messages on failure.
 */
export function parseInvitation(rawInput: unknown): ParseInvitationResult {
  const result = InvitationConfigSchema.safeParse(rawInput);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  const formattedErrors = result.error.errors.map((err) => {
    const path = err.path.length > 0 ? err.path.join('.') : 'root';
    return `[${path}] ${err.message}`;
  });

  return {
    success: false,
    error: result.error,
    formattedErrors,
  };
}

/**
 * Resolved CSS style properties bundle
 */
export interface ResolvedStyle {
  typography: TypographyStyle;
  box: BoxStyle;
  transform: TransformStyle;
  visible: boolean;
}

/**
 * Resolves styles according to the cascade:
 * Theme -> Section Base -> Section Breakpoint Override -> Element Base -> Element Breakpoint Override.
 *
 * Specificity order:
 * 1. Global Theme defaults
 * 2. Section base styles
 * 3. Section breakpoint override
 * 4. Element base styles
 * 5. Element breakpoint override
 */
export function resolveStyle(
  theme: Theme,
  section?: Section | null,
  element?: Element | null,
  breakpoint?: Breakpoint
): ResolvedStyle {
  // 1. Initial defaults from theme
  const typography: TypographyStyle = {
    fontFamily: theme.fonts?.body,
    color: theme.colors?.text,
    ...(theme.typography || {}),
  };

  const box: BoxStyle = {
    ...(theme.style || {}),
  };

  const transform: TransformStyle = {
    rotateDeg: 0,
    scale: 1,
    translateX: '0px',
    translateY: '0px',
  };

  let visible = true;

  // 2. Section base cascade
  if (section) {
    if (section.visible !== undefined) {
      visible = section.visible;
    }
    if (section.typography) {
      Object.assign(typography, removeUndefined(section.typography));
    }
    if (section.box) {
      Object.assign(box, removeUndefined(section.box));
    }

    // 3. Section breakpoint override cascade
    if (breakpoint && section.responsive && section.responsive[breakpoint]) {
      const sectionOverride = section.responsive[breakpoint];
      if (sectionOverride?.visible !== undefined) {
        visible = sectionOverride.visible;
      }
      if (sectionOverride?.typography) {
        Object.assign(typography, removeUndefined(sectionOverride.typography));
      }
      if (sectionOverride?.box) {
        Object.assign(box, removeUndefined(sectionOverride.box));
      }
    }
  }

  // 4. Element base cascade
  if (element) {
    if (element.visible !== undefined) {
      visible = element.visible;
    }
    if (element.typography) {
      Object.assign(typography, removeUndefined(element.typography));
    }
    if (element.box) {
      Object.assign(box, removeUndefined(element.box));
    }
    if (element.transform) {
      Object.assign(transform, removeUndefined(element.transform));
    }

    // 5. Element breakpoint override cascade
    if (breakpoint && element.responsive && element.responsive[breakpoint]) {
      const elementOverride = element.responsive[breakpoint];
      if (elementOverride?.visible !== undefined) {
        visible = elementOverride.visible;
      }
      if (elementOverride?.typography) {
        Object.assign(typography, removeUndefined(elementOverride.typography));
      }
      if (elementOverride?.box) {
        Object.assign(box, removeUndefined(elementOverride.box));
      }
      if (elementOverride?.transform) {
        Object.assign(transform, removeUndefined(elementOverride.transform));
      }
    }
  }

  return {
    typography,
    box,
    transform,
    visible,
  };
}

/**
 * Strips undefined properties so Object.assign does not overwrite with undefined
 */
function removeUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const clean: Partial<T> = {};
  for (const key of Object.keys(obj) as Array<keyof T>) {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  }
  return clean;
}
