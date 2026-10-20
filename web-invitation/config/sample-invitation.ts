import { InvitationConfigInput } from '@/lib/schema';

export const sampleInvitationConfig: InvitationConfigInput = {
  version: '1.0.0',
  meta: {
    id: 'inv-sacred-garden',
    slug: 'thesacredgarden',
    title: 'Zohan & Rose — The Sacred Garden',
    description: 'An evening of love, laughter, duas, and unforgettable memories.',
    ogImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    lang: 'en',
  },
  theme: {
    baseColor: '#5a0f1b',
    colors: {
      background: '#f9f0e0',
      surface: '#ffffff',
      primary: '#a67d2b',
      secondary: '#6c513f',
      accent: '#5a0f1b',
      text: '#4a3525',
      muted: '#8c7666',
      border: 'rgba(166, 125, 43, 0.25)',
      ring: '#a67d2b',
    },
    fonts: {
      display: 'Cinzel',
      script: 'Cinzel Decorative',
      heading: 'Cinzel',
      body: 'system-ui',
      accent: 'Cinzel Decorative',
      quote: 'Cormorant Garamond',
    },
    spacingUnitPx: 4,
    defaultRadius: '16px',
    defaultContainerMaxWidth: '460px',
  },
  audio: {
    enabled: true,
    url: 'https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/Einaudi_%20Divenire%20(1)%20(1).mp3',
    title: 'Ludovico Einaudi - Divenire',
    autoplayOnGesture: true,
    loop: true,
    volume: 0.7,
    showFloatingPlayer: true,
    playerStyle: 'floating-icon',
  },
  assets: [
    {
      id: 'asset-hero-video',
      url: 'https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/sacred-garden-loop.mp4',
      type: 'video',
      mimeType: 'video/mp4',
    },
  ],
  sections: [
    // 1. GATE SECTION (Envelope Gate)
    {
      id: 'sec-gate',
      type: 'gate',
      name: 'Envelope Gate',
      visible: true,
      order: 1,
      elements: [
        {
          id: 'el-gate-seal',
          name: 'Gate Opener Wax Seal',
          content: {
            type: 'seal',
            action: 'unlock-gate',
            seal: {
              initials: 'Z&R',
              baseColor: '#5a0f1b',
              shape: 'round',
              sizePx: 96,
              rotation: 0,
              edgeRoughness: 35,
              rings: 1,
              gloss: 65,
              emboss: 50,
              content: {
                type: 'monogram',
                text: 'Z&R',
                fontFamily: 'Cinzel Decorative',
                fontSize: 24,
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                colorMode: 'auto',
              },
              ribbon: {
                enabled: true,
                color: '#3a070f',
                lengthPx: 40,
                widthPx: 16,
                angleDeg: 45,
                style: 'classic-tails',
              },
              animation: {
                idle: 'pulse',
                onClick: 'crack',
              },
              label: 'Tap to open',
              interactive: true,
            },
            pulseHint: true,
          },
          responsive: {},
        },
        {
          id: 'el-gate-instruction',
          name: 'Tap to Open Instruction',
          content: {
            type: 'text',
            text: 'Tap to open invitation',
            tag: 'p',
          },
          typography: {
            fontSize: '13px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            textAlign: 'center',
            color: '#a67d2b',
          },
          responsive: {},
        },
      ],
    },

    // 2. HERO SECTION
    {
      id: 'sec-hero',
      type: 'hero',
      name: 'Sacred Garden Hero',
      visible: true,
      order: 2,
      backgroundMedia: {
        type: 'none',
        url: '',
        posterUrl: '',
        overlayColor: 'transparent',
        opacity: 1,
        blurPx: 0,
      },
      elements: [
        {
          id: 'el-hero-tagline',
          name: 'Hero Subtitle',
          content: {
            type: 'text',
            text: 'Together with their families',
            tag: 'p',
          },
          typography: {
            fontSize: '13px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            textAlign: 'center',
            color: '#8c7666',
          },
          responsive: {},
        },
        {
          id: 'el-hero-names',
          name: 'Couple Names',
          content: {
            type: 'text',
            text: 'Zohan & Rose',
            tag: 'h1',
          },
          typography: {
            fontFamily: 'Cinzel',
            fontSize: '36px',
            letterSpacing: '0.04em',
            textAlign: 'center',
            color: '#5a0f1b',
          },
          responsive: {
            mobile: {
              typography: {
                fontSize: '30px',
              },
            },
          },
        },
        {
          id: 'el-hero-date',
          name: 'Wedding Date',
          content: {
            type: 'text',
            text: '27 . 09 . 2026',
            tag: 'p',
          },
          typography: {
            fontSize: '15px',
            letterSpacing: '0.25em',
            textAlign: 'center',
            color: '#a67d2b',
          },
          responsive: {},
        },
        {
          id: 'el-hero-decor-header',
          name: 'Botanical Floral Header',
          content: {
            type: 'decor',
            decorType: 'floral-header',
            alt: 'Botanical jasmine and gold floral arch',
            position: 'center',
          },
          responsive: {},
        },
        {
          id: 'el-hero-message',
          name: 'Invitation Welcome Message',
          content: {
            type: 'text',
            text: 'We request the honour of your presence to celebrate the union of our hearts and souls in an evening of love, laughter, and lifelong promises.',
            tag: 'p',
          },
          typography: {
            fontSize: '14px',
            lineHeight: '1.6',
            textAlign: 'center',
            color: '#6c513f',
            fontFamily: 'Cormorant Garamond',
          },
          responsive: {},
        },
      ],
    },

    // 3. COUNTDOWN SECTION (Targeting 27.09.26)
    {
      id: 'sec-countdown',
      type: 'countdown',
      name: 'Countdown to the Big Day',
      visible: true,
      order: 3,
      elements: [
        {
          id: 'el-countdown-timer',
          name: 'Event Countdown',
          content: {
            type: 'countdown',
            targetDate: '2027-09-27T17:00:00Z',
            timezone: 'UTC',
            labels: {
              days: 'Days',
              hours: 'Hours',
              minutes: 'Minutes',
              seconds: 'Seconds',
            },
            completedMessage: 'The Sacred Garden celebration has begun!',
            layout: 'ornate-boxes',
            digitStyle: 'classic-serif',
            showSeconds: true,
          },
          responsive: {},
        },
      ],
    },

    // 4. SCHEDULE SECTION (5:00 PM to 9:00 PM Itinerary)
    {
      id: 'sec-schedule',
      type: 'schedule',
      name: 'Order of Events',
      visible: true,
      order: 4,
      elements: [
        {
          id: 'el-schedule-heading',
          name: 'Schedule Title',
          content: {
            type: 'text',
            text: 'Order of Events',
            tag: 'h2',
          },
          typography: {
            fontFamily: 'Cinzel',
            fontSize: '24px',
            textAlign: 'center',
            color: '#5a0f1b',
          },
          responsive: {},
        },
        {
          id: 'el-schedule-timeline',
          name: 'Wedding Itinerary',
          content: {
            type: 'schedule',
            items: [
              {
                id: 'sched-1',
                time: '5:00 PM',
                title: 'Guest Arrival',
                description: 'Botanical welcome drinks & acoustic prelude.',
              },
              {
                id: 'sched-2',
                time: '6:00 PM',
                title: 'The Ceremony',
                description: 'Sacred vows under the botanical glasshouse.',
              },
              {
                id: 'sched-3',
                time: '7:00 PM',
                title: 'Mocktail Hour',
                description: 'Artisanal garden mocktails and passed canapes.',
              },
              {
                id: 'sched-4',
                time: '8:00 PM',
                title: 'Dinner Banquet',
                description: 'Gourmet banquet feast and heartfelt family toasts.',
              },
              {
                id: 'sched-5',
                time: '9:00 PM',
                title: 'Evening Dance & Celebration',
                description: 'Music, dessert table, and starlight dancing.',
              },
            ],
            layout: 'timeline',
          },
          responsive: {},
        },
      ],
    },

    // 5. VENUE SECTION (Location & Driving Directions)
    {
      id: 'sec-venue',
      type: 'venue',
      name: 'Venue & Location',
      visible: true,
      order: 5,
      elements: [
        {
          id: 'el-venue-heading',
          name: 'Venue Title',
          content: {
            type: 'text',
            text: 'The Sacred Venue',
            tag: 'h2',
          },
          typography: {
            fontFamily: 'Cinzel',
            fontSize: '24px',
            textAlign: 'center',
            color: '#5a0f1b',
          },
          responsive: {},
        },
        {
          id: 'el-venue-map',
          name: 'Google Maps Location',
          content: {
            type: 'map',
            venueName: 'The Royal Botanical Glasshouse',
            address: '100 Garden Way, Kew Gardens, London, UK',
            embedUrl: 'https://maps.google.com/maps?q=Kew+Gardens+London&hl=en&z=15&output=embed',
            directionsUrl: 'https://maps.google.com/?q=Kew+Gardens+London',
            aspectRatio: '16/9',
            showDirectionsButton: true,
          },
          responsive: {},
        },
      ],
    },

    // 6. DETAILS SECTION (Gift Preference & Dress Code with Color Swatches)
    {
      id: 'sec-details',
      type: 'details',
      name: 'Important Details',
      visible: true,
      order: 6,
      elements: [
        {
          id: 'el-details-heading',
          name: 'Details Title',
          content: {
            type: 'text',
            text: 'Wedding Details',
            tag: 'h2',
          },
          typography: {
            fontFamily: 'Cinzel',
            fontSize: '24px',
            textAlign: 'center',
            color: '#5a0f1b',
          },
          responsive: {},
        },
        {
          id: 'el-details-cards',
          name: 'Details Cards',
          content: {
            type: 'details',
            headline: 'Wedding Details',
            subheadline: 'Kindly review the arrangements below',
            cards: [
              {
                id: 'card-dresscode',
                title: 'Dress Code: Formal Garden Elegance',
                description: 'We kindly invite our guests to wear formal attire in garden earth tones and pastel hues.',
                colorSwatches: ['#5a0f1b', '#a67d2b', '#6c513f', '#f9f0e0', '#556b2f'],
              },
              {
                id: 'card-gifts',
                title: 'Gift Preference: Your Presence & Blessings',
                description: 'Your presence and prayers at our wedding are the greatest gift. If you wish to honor us with a gift, a wishing well will be available.',
                colorSwatches: [],
              },
            ],
            layout: 'grid',
          },
          responsive: {},
        },
      ],
    },

    // 7. RSVP SECTION
    {
      id: 'sec-rsvp',
      type: 'rsvp',
      name: 'RSVP Form Section',
      visible: true,
      order: 7,
      elements: [
        {
          id: 'el-rsvp-form',
          name: 'RSVP Form',
          content: {
            type: 'form',
            headline: 'Will You Join Us?',
            subheadline: 'Kindly reply by August 15, 2027',
            deadline: '2027-08-15T23:59:59Z',
            fields: [
              {
                id: 'field-name',
                name: 'name',
                label: 'Your Full Name',
                type: 'text',
                placeholder: 'e.g. Eleanor Vance',
                required: true,
                options: [],
              },
              {
                id: 'field-attendance',
                name: 'attendance',
                label: 'Will you attend?',
                type: 'radio',
                placeholder: '',
                required: true,
                options: ['Joyfully Accept', 'Regretfully Decline'],
              },
              {
                id: 'field-guest-count',
                name: 'guest_count',
                label: 'Number of Guests Attending',
                type: 'number',
                placeholder: '1',
                required: false,
                options: [],
              },
              {
                id: 'field-song-request',
                name: 'song_request',
                label: 'Song Request for the Dance Floor',
                type: 'text',
                placeholder: 'e.g. Can\'t Take My Eyes Off You',
                required: false,
                options: [],
              },
              {
                id: 'field-dietary',
                name: 'dietary',
                label: 'Dietary Preferences / Allergies',
                type: 'text',
                placeholder: 'e.g. Vegetarian, Halal, Nut allergy',
                required: false,
                options: [],
              },
            ],
            submitLabel: 'Send Response',
            successMessage: 'We cannot wait to celebrate with you!',
            sendEmailConfirmation: false,
          },
          responsive: {},
        },
        {
          id: 'el-rsvp-seal',
          name: 'RSVP Wax Seal',
          content: {
            type: 'seal',
            action: 'open-rsvp',
            seal: {
              initials: 'RSVP',
              baseColor: '#a67d2b',
              shape: 'scalloped',
              sizePx: 80,
              rotation: -6,
              edgeRoughness: 40,
              rings: 2,
              gloss: 75,
              emboss: 55,
              content: {
                type: 'text',
                text: 'RSVP',
                fontFamily: 'Cinzel',
                fontSize: 18,
                fontWeight: 'bold',
                letterSpacing: '0.1em',
                colorMode: 'auto',
              },
              ribbon: {
                enabled: false,
              },
              animation: {
                idle: 'glow',
                onClick: 'melt',
              },
              label: 'Seal & Send',
              interactive: true,
            },
          },
          responsive: {},
        },
      ],
    },

    // 8. CLOSING SECTION
    {
      id: 'sec-closing',
      type: 'closing',
      name: 'Closing Note',
      visible: true,
      order: 8,
      elements: [
        {
          id: 'el-closing-photo',
          name: 'Couple Farewell Photo',
          content: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
            alt: 'Zohan and Rose portrait',
            aspectRatio: '4/5',
            objectFit: 'cover',
          },
          responsive: {},
        },
        {
          id: 'el-closing-note',
          name: 'Heartfelt Message',
          content: {
            type: 'text',
            text: 'Hope to see you there!',
            tag: 'h3',
          },
          typography: {
            fontFamily: 'Cinzel',
            fontSize: '22px',
            textAlign: 'center',
            color: '#5a0f1b',
          },
          responsive: {},
        },
      ],
    },
  ],
};
