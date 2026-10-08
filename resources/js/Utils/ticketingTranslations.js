import { useState, useEffect, useCallback } from 'react';

export const ticketingTranslations = {
    // Navigation & Common
    'Home': { en: 'Home', sw: 'Nyumbani' },
    'All': { en: 'All', sw: 'Yote' },
    'Events': { en: 'Events', sw: 'Matukio' },
    'Flights': { en: 'Flights', sw: 'Ndege' },
    'Hotels': { en: 'Hotels', sw: 'Hoteli' },
    'Night Life': { en: 'Night Life', sw: 'Starehe' },
    'Sports': { en: 'Sports', sw: 'Michezo' },
    'Fashion': { en: 'Fashion', sw: 'Mitindo' },
    'Corporate Events': { en: 'Corporate Events', sw: 'Matukio ya Kibiashara' },
    'Corporate': { en: 'Corporate', sw: 'Kibiashara' },
    'Support': { en: 'Support', sw: 'Msaada' },
    'Sign in': { en: 'Sign in', sw: 'Ingia' },
    'Sign up': { en: 'Sign up', sw: 'Jiunge' },
    'Dashboard': { en: 'Dashboard', sw: 'Dashibodi' },
    'Organizer Portal': { en: 'Organizer Portal', sw: 'Tovuti ya Waandaaji' },

    // Marketplace Hero
    'hero_title': {
        en: 'Experience the hottest events across Tanzania.',
        sw: 'Pata uzoefu wa matukio maarufu zaidi Tanzania.',
    },
    'hero_subtitle': {
        en: 'From comedy nights to city marathons, discover the moments everyone is booking. No account required — instant mobile checkout and live QR passes.',
        sw: 'Kuanzia vichekesho hadi mbio za jiji, gundua matukio yanayopendwa zaidi. Hakuna akaunti inayohitajika — malipo ya simu papo hapo na tiketi za QR.',
    },
    'search_placeholder': {
        en: 'Search events, hotels, or cities (e.g. Dar, Serengeti, Moshi)...',
        sw: 'Tafuta matukio, hoteli, au miji (mfano Dar, Serengeti, Moshi)...',
    },
    'Search': { en: 'Search', sw: 'Tafuta' },
    'Clear Filter': { en: 'Clear Filter', sw: 'Futa Kichujio' },
    'Available Occasions': { en: 'Available Occasions', sw: 'Matukio Yanayopatikana' },
    'All Occasions & Experiences': { en: 'All Tickets', sw: 'Tiketi Zote' },
    'All Tickets': { en: 'All Tickets', sw: 'Tiketi Zote' },
    'Live Events & Festivals': { en: 'Concerts & Events', sw: 'Matamasha & Matukio' },
    'Concerts & Events': { en: 'Concerts & Events', sw: 'Matamasha & Matukio' },
    'Flight Routes & Travel Passes': { en: 'Flights & Travel', sw: 'Safari za Ndege' },
    'Hotel Stays & Getaway Packages': { en: 'Hotels & Stays', sw: 'Hoteli & Malazi' },
    'Hotels & Stays': { en: 'Hotels & Stays', sw: 'Hoteli & Malazi' },
    'Nightlife, Parties & Ocean Cruises': { en: 'Nightlife & Parties', sw: 'Starehe & Vilabu' },
    'Nightlife & Parties': { en: 'Nightlife & Parties', sw: 'Starehe & Vilabu' },
    'Marathons, Matches & Sports Passes': { en: 'Sports & Matches', sw: 'Michezo & Mechi' },
    'Sports & Matches': { en: 'Sports & Matches', sw: 'Michezo & Mechi' },
    'Fashion & Runway Shows': { en: 'Fashion & Galas', sw: 'Mitindo & Gala' },
    'Fashion & Galas': { en: 'Fashion & Galas', sw: 'Mitindo & Gala' },
    'Corporate Events, Summits & Galas': { en: 'Corporate Events', sw: 'Matukio ya Kibiashara' },
    'no_occasions_title': { en: 'No occasions found', sw: 'Hakuna matukio yaliyopatikana' },
    'no_occasions_desc_search': {
        en: 'No tickets matched your query. Try a different keyword or location.',
        sw: 'Hakuna tiketi zilizolingana na utafutaji wako. Jaribu neno jingine au mji tofauti.',
    },
    'no_occasions_desc_empty': {
        en: 'There are no active occasions in this category right now.',
        sw: 'Hakuna matukio yanayopatikana katika kitengo hiki kwa sasa.',
    },
    'View All Occasions': { en: 'View All Occasions', sw: 'Tazama Matukio Yote' },
    'FROM FARE': { en: 'FROM FARE', sw: 'NAULI KUANZIA' },
    'ROOM FROM': { en: 'ROOM FROM', sw: 'CHUMBA KUANZIA' },
    'TICKETS FROM': { en: 'TICKETS FROM', sw: 'TIKETI KUANZIA' },
    'Free': { en: 'Free', sw: 'Bure' },
    'View event': { en: 'View event', sw: 'Tazama tukio' },
    'Sold Out': { en: 'Sold Out', sw: 'Zimekwisha' },
    'All Tickets Sold Out': { en: 'All Tickets Sold Out', sw: 'Tiketi Zote Zimekwisha' },
    'sold_out_desc': {
        en: 'All passes for this occasion have been claimed. No tickets are currently available.',
        sw: 'Tiketi zote za tukio hili zimekwisha. Hakuna tiketi zinazopatikana kwa sasa.',
    },
    'Explore Other Events': { en: 'Explore Other Events', sw: 'Gundua Matukio Mengine' },
    'Only': { en: 'Only', sw: 'Zimebaki' },
    'left': { en: 'left', sw: 'tu' },

    // Footer
    'Official Ticketing Platform': { en: 'Official Ticketing Platform', sw: 'Mfumo Rasmi wa Tiketi' },
    'Instant passes with dynamic QR codes. Secured by': {
        en: 'Instant passes with dynamic QR codes. Secured by',
        sw: 'Tiketi za papo hapo zenye QR code za kiusalama. Zinalindwa na',
    },
    'Terms & Conditions': { en: 'Terms & Conditions', sw: 'Vigezo na Masharti' },
    'Vigezo na Masharti': { en: 'Terms & Conditions', sw: 'Vigezo na Masharti' },
    'Privacy Policy': { en: 'Privacy Policy', sw: 'Sera ya Faragha' },
    'Sera ya Faragha': { en: 'Privacy Policy', sw: 'Sera ya Faragha' },
    'All rights reserved.': { en: 'All rights reserved.', sw: 'Haki zote zimehifadhiwa.' },
    'All rights reserved': { en: 'All rights reserved', sw: 'Haki zote zimehifadhiwa' },
    'Haki zote zimehifadhiwa.': { en: 'All rights reserved.', sw: 'Haki zote zimehifadhiwa.' },
    'Haki zote zimehifadhiwa': { en: 'All rights reserved', sw: 'Haki zote zimehifadhiwa' },
    'Powered by Kardovo': { en: 'Powered by Kardovo', sw: 'Inaendeshwa na Kardovo' },
    'Powered by AzamPay & Kardovo': { en: 'Powered by AzamPay & Kardovo', sw: 'Inaendeshwa na AzamPay & Kardovo' },

    // View Event & Checkout Flow
    'CHECKOUT': { en: 'CHECKOUT', sw: 'KUKATA TIKETI' },
    'Back': { en: 'Back', sw: 'Rudi Nyuma' },
    'Minute': { en: 'Minute', sw: 'Dakika' },
    'Minutes': { en: 'Minutes', sw: 'Dakika' },
    'Second': { en: 'Second', sw: 'Sekunde' },
    'Seconds': { en: 'Seconds', sw: 'Sekunde' },

    // Steps
    'Booking': { en: 'Booking', sw: 'Uwekaji' },
    'Details': { en: 'Details', sw: 'Taarifa' },
    'Payment': { en: 'Payment', sw: 'Malipo' },

    // Step 1: Booking
    'booking_step_title': { en: 'Booking', sw: 'Chagua Tiketi' },
    'booking_step_subtitle': {
        en: 'Choose an access type, then fine-tune quantity.',
        sw: 'Chagua aina ya tiketi, kisha rekebisha idadi ya tiketi unazotaka.',
    },
    'TICKETS': { en: 'TICKETS', sw: 'TIKETI' },
    'each': { en: 'each', sw: 'kila moja' },
    'Booking subtotal': { en: 'Booking subtotal', sw: 'Jumla ndogo ya uwekaji' },
    'Continue': { en: 'Continue', sw: 'Endelea' },
    'select_at_least_1': {
        en: 'Please select at least 1 ticket to continue.',
        sw: 'Tafadhali chagua angalau tiketi 1 ili kuendelea.',
    },
    'no_active_tiers': {
        en: 'No ticket tiers are currently active for this occasion.',
        sw: 'Hakuna vifurushi vya tiketi vilivyo hai kwa tukio hili kwa sasa.',
    },

    // Step 2: Personal Information
    'personal_info_title': { en: 'Personal Information', sw: 'Taarifa Binafsi' },
    'personal_info_subtitle': {
        en: 'Passes will be issued under this name and dispatched via WhatsApp/SMS/Email.',
        sw: 'Tiketi zitatolewa kwa jina hili na kutumwa papo hapo kupitia WhatsApp/SMS/Barua pepe.',
    },
    'Full Name *': { en: 'Full Name *', sw: 'Jina Kamili *' },
    'Enter full name': { en: 'Enter full name', sw: 'Weka jina kamili' },
    'Email Address': { en: 'Email Address', sw: 'Barua Pepe' },
    'Enter your email address': { en: 'Enter your email address', sw: 'Weka barua pepe yako' },
    'phone_label': {
        en: 'Phone Number (for instant Digital Pass) *',
        sw: 'Namba ya Simu (kwa kupokea Tiketi ya Kidigitali) *',
    },
    'phone_placeholder': {
        en: 'Enter phone number (e.g. 712345678)',
        sw: 'Weka namba ya simu (mfano 712345678)',
    },
    'Continue to payment': { en: 'Continue to payment', sw: 'Endelea na malipo' },
    'name_required': { en: 'Full name is required.', sw: 'Jina kamili linahitajika.' },
    'phone_required': { en: 'Phone number is required.', sw: 'Namba ya simu inahitajika.' },
    'valid_email': { en: 'Please provide a valid email address.', sw: 'Tafadhali weka barua pepe sahihi.' },

    // Step 3: Payment
    'payment_method_title': { en: 'Payment Method', sw: 'Njia ya Malipo' },
    'payment_method_subtitle': {
        en: 'Select your preferred settlement channel.',
        sw: 'Chagua njia unayopendelea ya kulipia tiketi yako.',
    },
    'Pay Via Mobile Money': { en: 'Pay Via Mobile Money', sw: 'Lipa kwa Pesa ya Simu' },
    'mobile_money_desc': {
        en: 'Tanzania numbers only - a prompt will be sent to your phone',
        sw: 'Namba za Tanzania pekee - utatumiwa ujumbe wa uthibitisho (USSD Push) kwenye simu yako',
    },
    'Pay Via Card': { en: 'Pay Via Card', sw: 'Lipa kwa Kadi (Visa / Mastercard)' },
    'card_desc': {
        en: 'Visa / Mastercard - you will be redirected to the secure payment page',
        sw: 'Visa / Mastercard - utaelekezwa kwenye mfumo salama wa malipo wa benki',
    },
    'accept_no_refund_terms': {
        en: 'I accept the no-refund terms.',
        sw: 'Ninakubali masharti ya kutorejeshewa fedha.',
    },
    'terms_body_1': {
        en: 'Event tickets, purchases, donations, and raffle entries are non-refundable unless the event is cancelled.',
        sw: 'Tiketi za matukio, ununuzi, michango na namba za bahati nasibu hazirejeshewi fedha isipokuwa tukio likifutwa.',
    },
    'NO-REFUND POLICY': { en: 'NO-REFUND POLICY', sw: 'SERA YA KUTOREJESHA FEDHA' },
    'terms_body_2': {
        en: 'All completed event payments are final. Refunds are only processed if the event is cancelled or the organizer announces a refund exception.',
        sw: 'Malipo yote yaliyokamilika ni ya mwisho. Marejesho hufanyika tu endapo tukio litafutwa au muandaaji ataidhinisha ubaguzi maalum.',
    },
    'must_accept_terms': {
        en: 'You must accept the no-refund policy to continue.',
        sw: 'Lazima ukubali sera ya kutorejesha fedha ili kuendelea.',
    },
    'select_payment_method': {
        en: 'Please select a payment method.',
        sw: 'Tafadhali chagua njia ya malipo.',
    },
    'select_payment_method_to_continue': {
        en: 'Select a payment method to continue.',
        sw: 'Chagua njia ya malipo ili kuendelea.',
    },
    'Buy Now': { en: 'Buy Now', sw: 'Lipa Sasa' },
    'Processing Booking...': { en: 'Processing Booking...', sw: 'Inashughulikia Malipo...' },

    // Step 4: Booking Created
    'Booking Created': { en: 'Booking Created', sw: 'Tiketi Imewekwa Kikamilifu' },
    'booking_created_subtitle': {
        en: 'Payment request sent. Approve the prompt on your phone to complete the booking.',
        sw: 'Ombi la malipo limetumwa. Weka nenosiri (PIN) kuthibitisha kwenye simu yako ili kukamilisha ununuzi.',
    },
    'Booking Ref': { en: 'Booking Ref', sw: 'Namba ya Kumbukumbu' },
    'Event': { en: 'Event', sw: 'Tukio' },
    'Package': { en: 'Package', sw: 'Kifurushi' },
    'Quantity': { en: 'Quantity', sw: 'Idadi' },
    'Service fee': { en: 'Service fee', sw: 'Gharama ya huduma' },
    'Total': { en: 'Total', sw: 'Jumla Kuu' },
    'Status': { en: 'Status', sw: 'Hali' },
    'PENDING': { en: 'PENDING', sw: 'INASUBIRI' },
    'keep_ref_safe': {
        en: 'Keep your booking reference safe. View all tickets in My Tickets.',
        sw: 'Hifadhi namba yako ya kumbukumbu salama. Tazama tiketi zako zote kwenye ukurasa wako.',
    },
    'View My Tickets': { en: 'View My Tickets', sw: 'Tazama Tiketi Yangu' },

    // Right Column Order Summary
    'Start:': { en: 'Start:', sw: 'Mwanzo:' },
    'Tickets': { en: 'Tickets', sw: 'Tiketi' },
    'no_tickets_selected': { en: 'No tickets selected yet.', sw: 'Bado haujachagua tiketi.' },
    'Subtotal': { en: 'Subtotal', sw: 'Jumla Ndogo' },
    'subtotal_notice': {
        en: 'Subtotal - configured service fees are calculated securely by the server',
        sw: 'Jumla ndogo - gharama za huduma zinahesabiwa na seva kwa usalama',
    },
    'Verified': { en: 'Verified', sw: 'Imethibitishwa' },
    'verified': { en: 'Verified', sw: 'Imethibitishwa' },
    'Verified Kardovo Gate': { en: 'Verified Kardovo Gate', sw: 'Lango Lililothibitishwa la Kardovo' },
    'AzamPay Secure': { en: 'AzamPay Secure', sw: 'Malipo Salama ya AzamPay' },
    'payment_phone_label': {
        en: 'Mobile Payment Phone Number (Prompt Recipient)',
        sw: 'Nambari ya Simu ya Malipo (Itakayopokea Ujumbe wa PIN)',
    },
    'payment_phone_placeholder': {
        en: 'e.g. 0712 345 678 or 0754 000 000',
        sw: 'mfano 0712 345 678 au 0754 000 000',
    },
    'payment_phone_hint': {
        en: 'A push notification (USSD PIN prompt) will be sent to this number to authorize payment via your chosen mobile operator.',
        sw: 'Ujumbe wa USSD (wa kuingiza nambari yako ya siri) utatumwa kwenye nambari hii ili kuthibitisha malipo.',
    },
    'payment_phone_required': {
        en: 'Please enter a valid phone number for mobile payment prompt.',
        sw: 'Tafadhali weka nambari sahihi ya simu ya kupokea ujumbe wa malipo.',
    },
    'different_number_hint': {
        en: 'Paying with a different phone? You can enter any valid mobile money number here.',
        sw: 'Unalipa na namba tofauti? Unaweza kuingiza nambari yoyote ya simu hapa.',
    },

    // Digital Ticket Pass
    'Valid Pass': { en: 'Valid Pass', sw: 'Tiketi Halali' },
    'Admitted': { en: 'Admitted', sw: 'Ameingia' },
    'Cancelled': { en: 'Cancelled', sw: 'Imeghairiwa' },
    'Pass Holder': { en: 'Pass Holder', sw: 'Mwenye Tiketi' },
    'Date & Time': { en: 'Date & Time', sw: 'Tarehe na Saa' },
    'Venue': { en: 'Venue', sw: 'Ukumbi / Eneo' },
    'Gate / Entry': { en: 'Gate / Entry', sw: 'Lango / Kuingia' },
    'Ticket Code': { en: 'Ticket Code', sw: 'Namba ya Tiketi' },
    'GATE PASS': { en: 'GATE PASS', sw: 'TIKETI YA LANGO' },
    'Scan for Entry': { en: 'Scan for Entry', sw: 'Skani Kuingia' },
    'Download': { en: 'Download', sw: 'Pakua' },
    'Share': { en: 'Share', sw: 'Shirikisha' },
    'Link Copied': { en: 'Link Copied', sw: 'Kiungo Kimenakiliwa' },
    'Passes in this order': { en: 'Passes in this order', sw: 'Tiketi katika oda hii' },
    'Order': { en: 'Order', sw: 'Oda' },
    'Present this pass at the gate for live digital scan.': {
        en: 'Present this pass at the gate for live digital scan.',
        sw: 'Onyesha tiketi hii langoni kwa uhakiki wa kidijitali.',
    },
};

/**
 * Custom React Hook for managing and synchronizing application language
 * Persists in localStorage and communicates via window custom events.
 */
export function useTicketingLanguage() {
    const [lang, setLangState] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kardovo_lang');
            if (saved === 'en' || saved === 'sw') return saved;
        }
        return 'en'; // default to English or Swahili
    });

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.detail?.lang && (e.detail.lang === 'en' || e.detail.lang === 'sw')) {
                setLangState(e.detail.lang);
            }
        };

        window.addEventListener('kardovo-lang-change', handleStorageChange);
        return () => window.removeEventListener('kardovo-lang-change', handleStorageChange);
    }, []);

    const setLanguage = useCallback((newLang) => {
        if (newLang !== 'en' && newLang !== 'sw') return;
        setLangState(newLang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('kardovo_lang', newLang);
            window.dispatchEvent(new CustomEvent('kardovo-lang-change', { detail: { lang: newLang } }));
        }
    }, []);

    const toggleLang = useCallback(() => {
        const next = lang === 'en' ? 'sw' : 'en';
        setLanguage(next);
    }, [lang, setLanguage]);

    const t = useCallback((key, fallback) => {
        if (ticketingTranslations[key] && ticketingTranslations[key][lang]) {
            return ticketingTranslations[key][lang];
        }
        return fallback !== undefined ? fallback : key;
    }, [lang]);

    return {
        lang,
        setLanguage,
        toggleLang,
        t,
        isSwahili: lang === 'sw',
        isEnglish: lang === 'en',
    };
}
