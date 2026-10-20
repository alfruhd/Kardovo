import { z } from 'zod';

// ============================================================================
// 1. Breakpoints & Units
// ============================================================================
export const BreakpointSchema = z.enum(['mobile', 'tablet', 'desktop']);
export type Breakpoint = z.infer<typeof BreakpointSchema>;

// ============================================================================
// 2. Meta & Assets
// ============================================================================
export const AssetSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  type: z.enum(['image', 'video', 'audio', 'svg', 'font']),
  alt: z.string().optional(),
  mimeType: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
});
export type Asset = z.infer<typeof AssetSchema>;

export const MetaSchema = z.object({
  id: z.string().min(1, 'Invitation ID is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().default(''),
  ogImage: z.string().url().optional(),
  favicon: z.string().url().optional(),
  lang: z.string().default('en'),
});
export type Meta = z.infer<typeof MetaSchema>;

// ============================================================================
// 3. Audio & Background Media
// ============================================================================
export const AudioConfigSchema = z.object({
  enabled: z.boolean().default(true),
  url: z.string().url().or(z.literal('')).default(''),
  title: z.string().default('Background Music'),
  autoplayOnGesture: z.boolean().default(true),
  loop: z.boolean().default(true),
  volume: z.number().min(0).max(1).default(0.7),
  showFloatingPlayer: z.boolean().default(true),
  playerStyle: z.enum(['seal', 'floating-icon', 'minimal-pill']).default('floating-icon'),
});
export type AudioConfig = z.infer<typeof AudioConfigSchema>;

export const BackgroundMediaSchema = z.object({
  type: z.enum(['none', 'color', 'gradient', 'image', 'video']).default('none'),
  url: z.string().url().or(z.literal('')).default(''),
  posterUrl: z.string().url().or(z.literal('')).default(''),
  color: z.string().optional(),
  gradient: z.string().optional(),
  overlayColor: z.string().default('transparent'),
  opacity: z.number().min(0).max(1).default(1),
  blurPx: z.number().nonnegative().default(0),
  parallaxSpeed: z.number().min(-3).max(3).default(0),
});
export type BackgroundMedia = z.infer<typeof BackgroundMediaSchema>;
export type BackgroundMediaInput = z.input<typeof BackgroundMediaSchema>;

// ============================================================================
// 4. Typography & Box Model & Transforms
// ============================================================================
export const TypographyStyleSchema = z.object({
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  letterSpacing: z.string().optional(),
  lineHeight: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional(),
  color: z.string().optional(),
  textShadow: z.string().optional(),
  italic: z.boolean().optional(),
});
export type TypographyStyle = z.infer<typeof TypographyStyleSchema>;

export const BoxStyleSchema = z.object({
  padding: z.string().optional(),
  paddingTop: z.string().optional(),
  paddingRight: z.string().optional(),
  paddingBottom: z.string().optional(),
  paddingLeft: z.string().optional(),
  margin: z.string().optional(),
  marginTop: z.string().optional(),
  marginRight: z.string().optional(),
  marginBottom: z.string().optional(),
  marginLeft: z.string().optional(),
  width: z.string().optional(),
  minWidth: z.string().optional(),
  maxWidth: z.string().optional(),
  height: z.string().optional(),
  minHeight: z.string().optional(),
  maxHeight: z.string().optional(),
  background: z.string().optional(),
  backgroundColor: z.string().optional(),
  borderRadius: z.string().optional(),
  border: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.string().optional(),
  borderStyle: z.enum(['none', 'solid', 'dashed', 'dotted', 'double']).optional(),
  boxShadow: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  display: z.enum(['block', 'inline-block', 'flex', 'grid', 'none']).optional(),
  overflow: z.enum(['visible', 'hidden', 'scroll', 'auto']).optional(),
  zIndex: z.number().int().optional(),
});
export type BoxStyle = z.infer<typeof BoxStyleSchema>;

export const TransformStyleSchema = z.object({
  rotateDeg: z.number().default(0),
  scale: z.number().default(1),
  translateX: z.string().default('0px'),
  translateY: z.string().default('0px'),
});
export type TransformStyle = z.infer<typeof TransformStyleSchema>;

// Style override bundle for breakpoints
export const StyleOverridesSchema = z.object({
  typography: TypographyStyleSchema.optional(),
  box: BoxStyleSchema.optional(),
  transform: TransformStyleSchema.partial().optional(),
  visible: z.boolean().optional(),
});
export type StyleOverrides = z.infer<typeof StyleOverridesSchema>;

export const ResponsiveOverridesSchema = z.object({
  mobile: StyleOverridesSchema.optional(),
  tablet: StyleOverridesSchema.optional(),
  desktop: StyleOverridesSchema.optional(),
});
export type ResponsiveOverrides = z.infer<typeof ResponsiveOverridesSchema>;

// ============================================================================
// 5. Theme Schema (CSS Variables & Token Generation)
// ============================================================================
export const ThemeColorsSchema = z.object({
  background: z.string().min(1, 'Background color is required'),
  surface: z.string().default('#ffffff'),
  primary: z.string().min(1, 'Primary color is required'),
  secondary: z.string().min(1, 'Secondary color is required'),
  accent: z.string().min(1, 'Accent color is required'),
  text: z.string().min(1, 'Text color is required'),
  muted: z.string().min(1, 'Muted color is required'),
  border: z.string().min(1, 'Border color is required'),
  ring: z.string().optional(),
});
export type ThemeColors = z.infer<typeof ThemeColorsSchema>;

export const CustomFontSchema = z.object({
  fontFamily: z.string().min(1, 'Font family name is required'),
  src: z.string().url('Font src must be a valid URL'),
  format: z.enum(['woff2', 'woff', 'truetype', 'opentype']).default('woff2'),
  fontWeight: z.string().default('normal'),
  fontStyle: z.string().default('normal'),
});
export type CustomFont = z.infer<typeof CustomFontSchema>;

export const ThemeFontsSchema = z.object({
  display: z.string().default('Cinzel'),
  script: z.string().default('Cinzel Decorative'),
  body: z.string().default('system-ui'),
  heading: z.string().min(1, 'Heading font is required'),
  accent: z.string().default('Cinzel Decorative'),
  quote: z.string().optional(),
});
export type ThemeFonts = z.infer<typeof ThemeFontsSchema>;

export const ThemeSchema = z.object({
  baseColor: z.string().optional(), // If provided, can auto-derive the entire palette
  colors: ThemeColorsSchema,
  fonts: ThemeFontsSchema,
  customFonts: z.array(CustomFontSchema).default([]),
  spacingUnitPx: z.number().positive().default(4),
  defaultRadius: z.string().default('16px'),
  defaultContainerMaxWidth: z.string().default('460px'),
  style: BoxStyleSchema.optional(),
  typography: TypographyStyleSchema.optional(),
});
export type Theme = z.infer<typeof ThemeSchema>;
export type ThemeInput = z.input<typeof ThemeSchema>;

export const AnimationPresetSchema = z.enum([
  'none',
  'fade',
  'fade-in',
  'fade-up',
  'fade-down',
  'slide',
  'slide-left',
  'slide-right',
  'scale',
  'zoom-in',
  'zoom-out',
  'rotate',
  'blur',
  'draw',
  'stamp',
  'float',
  'pulse',
  'reveal-envelope',
]);
export type AnimationPreset = z.infer<typeof AnimationPresetSchema>;

export const AnimationTriggerSchema = z.enum(['scroll', 'load', 'click']);
export type AnimationTrigger = z.infer<typeof AnimationTriggerSchema>;

export const AnimationSchema = z.object({
  preset: AnimationPresetSchema.default('fade-up'),
  durationSec: z.number().min(0).max(10).default(0.8),
  delaySec: z.number().min(0).max(10).default(0),
  easing: z.string().default('power2.out'),
  trigger: AnimationTriggerSchema.default('scroll'),
  scrollTrigger: z.boolean().default(true),
  triggerOffset: z.string().default('top 85%'),
  once: z.boolean().default(true),
  parallaxSpeed: z.number().min(-3).max(3).default(0), // > 0 moves with scroll, < 0 counters scroll
  staggerSec: z.number().min(0).max(2).default(0),
  loop: z.boolean().default(false),
});
export type AnimationConfig = z.infer<typeof AnimationSchema>;
export type AnimationConfigInput = z.input<typeof AnimationSchema>;

// ============================================================================
// 7. Procedural SVG Wax Seal Schema
// ============================================================================
export const SealShapeSchema = z.enum([
  'round',
  'scalloped',
  'drip',
  'star',
  'organic-rough',
  'oval',
]);
export type SealShape = z.infer<typeof SealShapeSchema>;

export const SealAnimationIdleSchema = z.enum(['none', 'pulse', 'glow', 'float']);
export type SealAnimationIdle = z.infer<typeof SealAnimationIdleSchema>;

export const SealAnimationClickSchema = z.enum(['none', 'crack', 'melt', 'spin', 'fade']);
export type SealAnimationClick = z.infer<typeof SealAnimationClickSchema>;

export const SealActionSchema = z.enum(['open-gate', 'open-rsvp', 'link', 'none', 'unlock-gate']);
export type SealAction = z.infer<typeof SealActionSchema>;

export const SealContentOptionsSchema = z.object({
  type: z.enum(['monogram', 'text', 'icon', 'image']).default('monogram'),
  text: z.string().default('Z&R'),
  fontFamily: z.string().default('Cinzel Decorative'),
  fontSize: z.number().positive().default(24),
  fontWeight: z.string().default('bold'),
  letterSpacing: z.string().default('0.05em'),
  offsetX: z.number().default(0),
  offsetY: z.number().default(0),
  colorMode: z.enum(['auto', 'custom']).default('auto'),
  color: z.string().optional(),
  iconName: z.string().optional(),
  imageUrl: z.string().url().optional(),
});
export type SealContentOptions = z.infer<typeof SealContentOptionsSchema>;
export type SealContentOptionsInput = z.input<typeof SealContentOptionsSchema>;

export const SealRibbonSchema = z.object({
  enabled: z.boolean().default(false),
  color: z.string().default('#3a070f'),
  lengthPx: z.number().positive().default(40),
  widthPx: z.number().positive().default(16),
  angleDeg: z.number().default(45),
  style: z.enum(['classic-tails', 'straight', 'banner']).default('classic-tails'),
});
export type SealRibbon = z.infer<typeof SealRibbonSchema>;

export const SealConfigSchema = z.object({
  initials: z.string().max(8).default('Z&R'),
  fontFamily: z.string().default('Cinzel Decorative'),
  fontSizePx: z.number().positive().default(22),
  baseColor: z.string().default('#5a0f1b'),
  highlightColor: z.string().optional(), // Auto-derived if not specified
  shadowColor: z.string().optional(), // Auto-derived if not specified
  rimColor: z.string().optional(), // Auto-derived if not specified
  shape: SealShapeSchema.default('round'),
  sizePx: z.number().positive().default(90),
  rotation: z.number().default(0),
  edgeRoughness: z.number().min(0).max(100).default(35),
  roughness: z.number().min(0).max(100).default(35), // alias for compatibility
  rings: z.number().int().min(0).max(4).default(1),
  gloss: z.number().min(0).max(100).default(65),
  emboss: z.number().min(0).max(100).default(45),
  embossDepth: z.number().min(0).max(100).default(45), // alias for compatibility
  shadow: z.boolean().default(true),
  shadowBlurPx: z.number().min(0).max(50).default(12),
  content: SealContentOptionsSchema.default({
    type: 'monogram',
    text: 'Z&R',
  }),
  ribbon: SealRibbonSchema.default({ enabled: false }),
  animation: z.object({
    idle: SealAnimationIdleSchema.default('pulse'),
    onClick: SealAnimationClickSchema.default('crack'),
  }).default({
    idle: 'pulse',
    onClick: 'crack',
  }),
  label: z.string().default('Tap to Open'),
  action: SealActionSchema.default('open-gate'),
  innerBorderWidthPx: z.number().nonnegative().default(1.5),
  subText: z.string().default(''),
  iconUrl: z.string().url().optional(),
  interactive: z.boolean().default(true),
});
export type SealConfig = z.infer<typeof SealConfigSchema>;
export type SealConfigInput = z.input<typeof SealConfigSchema>;

// ============================================================================
// 8. Element Content Discriminated Unions
// ============================================================================

export const TextContentSchema = z.object({
  type: z.literal('text'),
  text: z.string().min(1, 'Text content cannot be empty'),
  tag: z.enum(['h1', 'h2', 'h3', 'h4', 'p', 'span', 'div', 'quote']).default('p'),
});

export const ImageContentSchema = z.object({
  type: z.literal('image'),
  url: z.string().url('Image requires a valid URL'),
  alt: z.string().min(1, 'Alt text is required for accessibility'),
  aspectRatio: z.string().default('auto'),
  objectFit: z.enum(['cover', 'contain', 'fill', 'none']).default('cover'),
  caption: z.string().optional(),
});

export const VideoContentSchema = z.object({
  type: z.literal('video'),
  url: z.string().url('Video requires a valid URL'),
  posterUrl: z.string().url().optional(),
  autoplay: z.boolean().default(true),
  loop: z.boolean().default(true),
  muted: z.boolean().default(true),
  controls: z.boolean().default(false),
  playsInline: z.boolean().default(true),
});

export const DecorContentSchema = z.object({
  type: z.literal('decor'),
  decorType: z.enum(['floral-corner', 'floral-header', 'crest', 'leaf-divider', 'custom-svg']),
  svgContent: z.string().optional(),
  imageUrl: z.string().url().optional(),
  alt: z.string().min(1, 'Alt text is required for decor imagery'),
  position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']).default('center'),
});

export const DividerContentSchema = z.object({
  type: z.literal('divider'),
  style: z.enum(['line', 'floral-knot', 'monogram', 'dotted', 'double']).default('floral-knot'),
  color: z.string().optional(),
  thicknessPx: z.number().positive().default(1),
  ornamentText: z.string().default('&'),
});

export const ButtonContentSchema = z.object({
  type: z.literal('button'),
  label: z.string().min(1, 'Button label is required'),
  action: z.enum(['open-rsvp', 'add-to-calendar', 'open-map', 'scroll-to', 'external-url']),
  target: z.string().default(''), // section id or URL
  variant: z.enum(['primary', 'secondary', 'seal-style', 'ghost', 'outline']).default('primary'),
  icon: z.string().optional(),
});

export const SealContentSchema = z.object({
  type: z.literal('seal'),
  seal: SealConfigSchema,
  action: z.enum(['unlock-gate', 'open-rsvp', 'none']).default('unlock-gate'),
  pulseHint: z.boolean().default(true),
});

export const CountdownContentSchema = z.object({
  type: z.literal('countdown'),
  targetDate: z.string().datetime({ message: 'Target date must be a valid ISO-8601 datetime' }),
  timezone: z.string().default('UTC'),
  labels: z
    .object({
      days: z.string().default('Days'),
      hours: z.string().default('Hours'),
      minutes: z.string().default('Minutes'),
      seconds: z.string().default('Seconds'),
    })
    .default({
      days: 'Days',
      hours: 'Hours',
      minutes: 'Minutes',
      seconds: 'Seconds',
    }),
  completedMessage: z.string().default('The celebration is underway!'),
  layout: z.enum(['cards', 'minimal-numbers', 'ornate-boxes']).default('ornate-boxes'),
  digitStyle: z.enum(['classic-serif', 'modern-sans', 'calligraphic']).default('classic-serif'),
  showSeconds: z.boolean().default(true),
});

export const ScheduleItemSchema = z.object({
  id: z.string(),
  time: z.string().min(1, 'Event time is required'),
  title: z.string().min(1, 'Event title is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  icon: z.string().optional(),
});
export type ScheduleItem = z.infer<typeof ScheduleItemSchema>;

export const ScheduleContentSchema = z.object({
  type: z.literal('schedule'),
  items: z.array(ScheduleItemSchema).min(1, 'Schedule requires at least one item'),
  layout: z.enum(['timeline', 'two-column', 'alternating', 'cards', 'list']).default('timeline'),
});

export const MapContentSchema = z.object({
  type: z.literal('map'),
  venueName: z.string().min(1, 'Venue name is required'),
  address: z.string().min(1, 'Venue address is required'),
  lat: z.number().optional(),
  lng: z.number().optional(),
  embedUrl: z.string().url('Google Maps embed URL must be valid').optional(),
  directionsUrl: z.string().url().optional(),
  aspectRatio: z.string().default('16/9'),
  showDirectionsButton: z.boolean().default(true),
});

export const DetailCardItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Card title is required'),
  icon: z.string().optional(),
  description: z.string().min(1, 'Card description is required'),
  colorSwatches: z.array(z.string()).default([]), // For dress code color swatches
  actionUrl: z.string().url().optional(),
  actionLabel: z.string().optional(),
});
export type DetailCardItem = z.infer<typeof DetailCardItemSchema>;

export const DetailsContentSchema = z.object({
  type: z.literal('details'),
  headline: z.string().default('Important Details'),
  subheadline: z.string().default(''),
  cards: z.array(DetailCardItemSchema).default([]),
  layout: z.enum(['grid', 'stack', 'carousel']).default('grid'),
});

export const SpacerContentSchema = z.object({
  type: z.literal('spacer'),
  heightPx: z.number().nonnegative().default(32),
});

export const ShapeContentSchema = z.object({
  type: z.literal('shape'),
  shapeType: z.enum(['arch', 'rectangle', 'circle', 'pill', 'wavy']).default('arch'),
  borderColor: z.string().optional(),
  backgroundColor: z.string().optional(),
});

// ============================================================================
// 9. RSVP Field & Form Schemas
// ============================================================================
export const RsvpFieldConditionalSchema = z.object({
  fieldId: z.string(),
  operator: z.enum(['equals', 'not-equals', 'contains']),
  value: z.union([z.string(), z.boolean(), z.number()]),
});
export type RsvpFieldConditional = z.infer<typeof RsvpFieldConditionalSchema>;

export const RsvpFormFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  label: z.string().min(1, 'Field label is required'),
  type: z.enum(['text', 'email', 'phone', 'radio', 'checkbox', 'select', 'textarea', 'number']),
  placeholder: z.string().default(''),
  required: z.boolean().default(false),
  options: z.array(z.string()).default([]), // For radio, select, or checkbox groups
  conditional: RsvpFieldConditionalSchema.optional(),
  defaultValue: z.union([z.string(), z.boolean(), z.number()]).optional(),
});
export type RsvpFormField = z.infer<typeof RsvpFormFieldSchema>;

export const RsvpFormContentSchema = z.object({
  type: z.literal('form'),
  headline: z.string().default('RSVP'),
  subheadline: z.string().default('Kindly respond by the date below'),
  deadline: z.string().datetime().optional(),
  fields: z.array(RsvpFormFieldSchema).default([
    {
      id: 'guest_name',
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Your name',
      required: true,
      options: [],
    },
    {
      id: 'attendance',
      name: 'attendance',
      label: 'Will you be attending?',
      type: 'radio',
      placeholder: '',
      required: true,
      options: ['Joyfully Accept', 'Regretfully Decline'],
    },
    {
      id: 'dietary',
      name: 'dietary',
      label: 'Dietary Restrictions',
      type: 'text',
      placeholder: 'None or please specify',
      required: false,
      options: [],
      conditional: {
        fieldId: 'attendance',
        operator: 'equals',
        value: 'Joyfully Accept',
      },
    },
  ]),
  submitLabel: z.string().default('Confirm Attendance'),
  successMessage: z.string().default('Thank you! Your RSVP has been received.'),
  sendEmailConfirmation: z.boolean().default(false),
});
export type RsvpFormContent = z.infer<typeof RsvpFormContentSchema>;

// Discriminated union of element contents
export const ElementContentSchema = z.discriminatedUnion('type', [
  TextContentSchema,
  ImageContentSchema,
  VideoContentSchema,
  DecorContentSchema,
  DividerContentSchema,
  ButtonContentSchema,
  SealContentSchema,
  CountdownContentSchema,
  ScheduleContentSchema,
  MapContentSchema,
  DetailsContentSchema,
  RsvpFormContentSchema,
  SpacerContentSchema,
  ShapeContentSchema,
]);
export type ElementContent = z.infer<typeof ElementContentSchema>;

// ============================================================================
// 10. Element Schema
// ============================================================================
export const ElementActionSchema = z.object({
  type: z.enum(['none', 'open-modal', 'navigate-section', 'open-link', 'trigger-audio']),
  target: z.string().optional(),
});
export type ElementAction = z.infer<typeof ElementActionSchema>;

export const ElementSchema = z.object({
  id: z.string().min(1, 'Element ID is required'),
  name: z.string().default('Element'),
  content: ElementContentSchema,
  typography: TypographyStyleSchema.optional(),
  box: BoxStyleSchema.optional(),
  transform: TransformStyleSchema.default({
    rotateDeg: 0,
    scale: 1,
    translateX: '0px',
    translateY: '0px',
  }),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  animation: AnimationSchema.default({
    preset: 'fade-up',
    durationSec: 0.8,
    delaySec: 0,
    easing: 'power2.out',
    scrollTrigger: true,
    triggerOffset: 'top 85%',
    once: true,
  }),
  responsive: ResponsiveOverridesSchema.default({}),
  action: ElementActionSchema.optional(),
  customCss: z.string().optional(),
  group: z.string().optional(),
});
export type Element = z.infer<typeof ElementSchema>;
export type ElementInput = z.input<typeof ElementSchema>;

// ============================================================================
// 11. Section Schema
// ============================================================================
export const SectionTypeSchema = z.enum([
  'gate',
  'hero',
  'countdown',
  'schedule',
  'venue',
  'details',
  'rsvp',
  'closing',
]);
export type SectionType = z.infer<typeof SectionTypeSchema>;

export const SectionSchema = z.object({
  id: z.string().min(1, 'Section ID is required'),
  type: SectionTypeSchema,
  name: z.string().default('Section'),
  visible: z.boolean().default(true),
  order: z.number().int().default(0),
  backgroundMedia: BackgroundMediaSchema.default({
    type: 'none',
    url: '',
    posterUrl: '',
    overlayColor: 'transparent',
    opacity: 1,
    blurPx: 0,
  }),
  typography: TypographyStyleSchema.optional(),
  box: BoxStyleSchema.optional(),
  responsive: ResponsiveOverridesSchema.default({}),
  animation: AnimationSchema.optional(),
  gateOpenAnimation: z.enum(['fade', 'envelope-open', 'zoom', 'curtain', 'split']).default('envelope-open'),
  elements: z.array(ElementSchema).default([]),
});
export type Section = z.infer<typeof SectionSchema>;
export type SectionInput = z.input<typeof SectionSchema>;

// ============================================================================
// 12. Full Invitation Schema
// ============================================================================
export const InvitationConfigSchema = z.object({
  version: z.literal('1.0.0').default('1.0.0'),
  meta: MetaSchema,
  theme: ThemeSchema,
  audio: AudioConfigSchema.default({
    enabled: true,
    url: '',
    title: 'Background Music',
    autoplayOnGesture: true,
    loop: true,
    volume: 0.7,
    showFloatingPlayer: true,
    playerStyle: 'floating-icon',
  }),
  assets: z.array(AssetSchema).default([]),
  sections: z.array(SectionSchema).min(1, 'Invitation must have at least one section'),
});
export type InvitationConfig = z.infer<typeof InvitationConfigSchema>;
export type InvitationConfigInput = z.input<typeof InvitationConfigSchema>;

