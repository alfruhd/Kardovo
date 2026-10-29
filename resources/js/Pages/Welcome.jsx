import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    CheckCircle2, Sparkles, Smartphone, QrCode, MessageCircle, 
    Users, BarChart3, Clock, ShieldCheck, ChevronLeft, ChevronRight, HandCoins, ChartPie, Globe,
    Send, Play, ArrowRight, Moon, Sun, ExternalLink, Ticket,
    Calendar, MapPin, Layers, Check, Zap, Building2, Plane, PartyPopper, Trophy, Plus, Briefcase, Crown, Gem, Heart, Eye,
    Download, Share2, CreditCard, ScanLine, CalendarPlus, UserCheck,
    Search, ClipboardCheck, BookOpen, BarChart2, Target, Mail, Phone, ArrowUp, X
} from "lucide-react";
import Login from './Auth/Login';
import Modal from '@/Components/Modal';
import KardovoLogo from '@/Components/KardovoLogo';
import KardovoFooter from '@/Components/KardovoFooter';
import CookieConsentBanner from '@/Components/CookieConsentBanner';

const translations = {
    "Accepted Payment Methods": {
        "en": "Accepted Payment Methods",
        "sw": "Njia za Malipo Zinazokubalika"
    },
    "Pay securely using any of the methods below, powered by AzamPay": {
        "en": "Pay securely using any of the methods below, powered by AzamPay",
        "sw": "Lipa kwa usalama ukitumia njia yoyote hapa chini, kupitia AzamPay"
    },
    "Mobile Money": {
        "en": "Mobile Money",
        "sw": "Mitandao ya Simu"
    },
    "Card Payments": {
        "en": "Card Payments",
        "sw": "Malipo ya Kadi"
    },
    "Bank & Alternative": {
        "en": "Bank & Alternative",
        "sw": "Benki na Njia Mbadala"
    },
    "All payments are processed securely through": {
        "en": "All payments are processed securely through",
        "sw": "Malipo yote yanafanyika kwa usalama kupitia"
    },

    "Maswali Yanayoulizwa Sana (FAQ)": {
        "en": "Frequently Asked Questions (FAQ)",
        "sw": "Maswali Yanayoulizwa Sana (FAQ)"
    },
    "Pata majibu ya maswali muhimu kuhusu matumizi ya Kardovo.": {
        "en": "Get answers to the most common questions about using Kardovo.",
        "sw": "Pata majibu ya maswali muhimu kuhusu matumizi ya Kardovo."
    },
    "Je, natumaje mialiko kwa wageni wangu?": {
        "en": "How do I send invitations to my guests?",
        "sw": "Je, natumaje mialiko kwa wageni wangu?"
    },
    "Kardovo inakuwezesha kutuma mialiko ya kidigitali na QR Codes moja kwa moja kwa wageni wako kupitia WhatsApp au SMS kwa kubofya kitufe kimoja tu kutokea kwenye dashibodi yako.": {
        "en": "Kardovo allows you to send digital passes and QR codes directly to your guests via WhatsApp or SMS with just one click from your dashboard.",
        "sw": "Kardovo inakuwezesha kutuma mialiko ya kidigitali na QR Codes moja kwa moja kwa wageni wako kupitia WhatsApp au SMS kwa kubofya kitufe kimoja tu kutokea kwenye dashibodi yako."
    },
    "Je, wageni wangu wanahitaji kupakua app yoyote?": {
        "en": "Do my guests need to download an app?",
        "sw": "Je, wageni wangu wanahitaji kupakua app yoyote?"
    },
    "Hapana! Wageni wanapokea kiungo (link) kupitia WhatsApp au SMS ambacho kinawafungulia kadi yao ya mwaliko kwenye kivinjari cha simu zao, ambapo wanaweza kujibu (RSVP) mara moja.": {
        "en": "No! Guests receive a link via WhatsApp or SMS that opens their digital pass in their phone's web browser, where they can RSVP instantly.",
        "sw": "Hapana! Wageni wanapokea kiungo (link) kupitia WhatsApp au SMS ambacho kinawafungulia kadi yao ya mwaliko kwenye kivinjari cha simu zao, ambapo wanaweza kujibu (RSVP) mara moja."
    },
    "QR Code scanner inafanyaje kazi mlangoni?": {
        "en": "How does the QR Code scanner work at the entrance?",
        "sw": "QR Code scanner inafanyaje kazi mlangoni?"
    },
    "Baada ya mgeni kuthibitisha (RSVP), anapata Pass yenye QR Code. Siku ya tukio, walinzi au wahudumu wako watatumia simu zao kuscan hizo QR Codes mlangoni ili kuruhusu wageni kuingia haraka bila msongamano.": {
        "en": "After a guest RSVPs, they receive a Pass with a QR Code. On the day of the event, your security or ushers will use their phones to scan these QR codes to check guests in quickly without congestion.",
        "sw": "Baada ya mgeni kuthibitisha (RSVP), anapata Pass yenye QR Code. Siku ya tukio, walinzi au wahudumu wako watatumia simu zao kuscan hizo QR Codes mlangoni ili kuruhusu wageni kuingia haraka bila msongamano."
    },
    "Je, ninaweza kuona wangapi wamethibitisha kuhudhuria?": {
        "en": "Can I see how many people have confirmed their attendance?",
        "sw": "Je, ninaweza kuona wangapi wamethibitisha kuhudhuria?"
    },
    "Ndiyo, dashibodi yako inakupa ripoti ya moja kwa moja (live) inayoonyesha idadi ya wageni walioalikwa, waliothibitisha kuhudhuria (RSVP Attending), waliokataa, na wale ambao tayari wameingia ukumbini.": {
        "en": "Yes, your dashboard provides a live report showing the number of invited guests, those who confirmed (RSVP Attending), declined, and those who have already checked in at the venue.",
        "sw": "Ndiyo, dashibodi yako inakupa ripoti ya moja kwa moja (live) inayoonyesha idadi ya wageni walioalikwa, waliothibitisha kuhudhuria (RSVP Attending), waliokataa, na wale ambao tayari wameingia ukumbini."
    },
    "Kuna ukomo wa idadi ya wageni ninaoweza kualika?": {
        "en": "Is there a limit to the number of guests I can invite?",
        "sw": "Kuna ukomo wa idadi ya wageni ninaoweza kualika?"
    },
    "Vifurushi vyetu vimepangwa kuendana na ukubwa wa tukio lako. Kifurushi cha Premium kinakidhi hadi wageni 300, wakati Executive inaruhusu hadi wageni 1,000, na Corporate inashughulikia hadi wageni 5,000.": {
        "en": "Our plans are structured to match the size of your event. The Premium plan caters for up to 300 guests, while Executive allows up to 1,000, and Corporate handles up to 5,000 guests.",
        "sw": "Vifurushi vyetu vimepangwa kuendana na ukubwa wa tukio lako. Kifurushi cha Premium kinakidhi hadi wageni 300, wakati Executive inaruhusu hadi wageni 1,000, na Corporate inashughulikia hadi wageni 5,000."
    },
    "Je, ninaweza kufanya malipo kwa njia gani?": {
        "en": "What payment methods do you accept?",
        "sw": "Je, ninaweza kufanya malipo kwa njia gani?"
    },
    "Tunapokea malipo kupitia mitandao yote ya simu (M-Pesa, Mixx by Yas, Airtel Money, HaloPesa, AzamPesa) na kadi za benki (Visa, Mastercard, Amex) kwa usalama na uhakika kupitia AzamPay.": {
        "en": "We accept payments via all mobile money networks (M-Pesa, Mixx by Yas, Airtel Money, HaloPesa, AzamPesa) and bank cards (Visa, Mastercard, Amex) securely through AzamPay.",
        "sw": "Tunapokea malipo kupitia mitandao yote ya simu (M-Pesa, Mixx by Yas, Airtel Money, HaloPesa, AzamPesa) na kadi za benki (Visa, Mastercard, Amex) kwa usalama na uhakika kupitia AzamPay."
    },
    "Je, wanunuzi wa tiketi wanahitaji kufungua akaunti?": {
        "en": "Do ticket buyers need to create an account?",
        "sw": "Je, wanunuzi wa tiketi wanahitaji kufungua akaunti?"
    },
    "faq_no_account_ans": {
        "en": "No! Attendees do not need to register an account or remember passwords. They simply provide their name and phone number, paying instantly with M-Pesa, Mixx, Airtel Money, or Cards. Digital ticket passes display immediately on screen and arrive directly via SMS and Email.",
        "sw": "Hapana! Wanunuzi hawahitaji kujisajili au kukumbuka nywila (password). Wanaingiza tu jina na namba ya simu, na kulipia kwa M-Pesa, Mixx, Airtel Money au Kadi. Mara malipo yanapokamilika, tiketi ya kidigitali inaonekana moja kwa moja skrini na kufika kupitia SMS na barua pepe yao."
    },
    "Mratibu wa tukio anawezaje kuanza kuuza tiketi na kupokea malipo?": {
        "en": "How do event organizers start selling tickets and receive payouts?",
        "sw": "Mratibu wa tukio anawezaje kuanza kuuza tiketi na kupokea malipo?"
    },
    "faq_organizer_payout_ans": {
        "en": "Organizers can create events, configure ticket tiers (VIP, Regular, Early Bird, etc.), and set prices in the Organizer Portal. Ticket sales are tracked in real time and revenue payouts are sent directly via mobile money or bank accounts.",
        "sw": "Waandaaji wanaweza kuunda tukio, kuweka madaraja ya tiketi (VIP, Regular, n.k.) na bei zake katika Dashibodi ya Waandaaji (Organizer Portal). Mauzo yanafuatiliwa moja kwa moja na malipo (payouts) yanatumwa moja kwa moja kwenye mitandao ya simu au benki."
    },
    "Uhakiki wa tiketi mlangoni unazuiaje tiketi bandia au zilizonakiliwa?": {
        "en": "How does gate verification prevent counterfeit or duplicate tickets?",
        "sw": "Uhakiki wa tiketi mlangoni unazuiaje tiketi bandia au zilizonakiliwa?"
    },
    "faq_gate_security_ans": {
        "en": "Every digital ticket carries a unique tamper-proof dynamic QR code. Our live gate scanner checks passes in under 0.2s, instantly alerting security to duplicate or fake passes and preventing unauthorized access.",
        "sw": "Kila tiketi ina dynamic QR code iliyosimbwa kwa njia salama (cryptographic token). Scanner yetu ya simu inasoma tiketi chini ya sekunde 0.2 na inatambua mara moja tiketi iliyokwishatumika au iliyonakiliwa kwa kutoa onyo la 'Duplicate', hivyo kuzuia wizi au uingiaji haramu."
    },
    "Je, inakuwaje tukio likiahirishwa au kufutwa?": {
        "en": "What happens if an event is postponed or cancelled?",
        "sw": "Je, inakuwaje tukio likiahirishwa au kufutwa?"
    },
    "faq_event_cancel_ans": {
        "en": "If an organizer reschedules or updates the venue, issued ticket passes update automatically without needing re-issuance. If an event is cancelled, organizers communicate refund procedures directly to attendees via SMS and WhatsApp.",
        "sw": "Mratibu anapobadilisha tarehe au ukumbi, tiketi zilizokwisha nunuliwa zinasasishwa moja kwa moja kidigitali bila hitaji la kutoa tiketi mpya. Ikiwa tukio litafutwa, waandaaji wanawasiliana na wanunuzi kupitia SMS na WhatsApp kuhusu utaratibu wa marejesho (refunds)."
    },
    "Features": {
        "en": "Features",
        "sw": "Vipengele"
    },
    "How It Works": {
        "en": "How It Works",
        "sw": "Hatua Rahisi"
    },
    "Payment": {
        "en": "Pricing",
        "sw": "Bei Zetu"
    },
    "FAQ": {
        "en": "FAQ",
        "sw": "Maswali (FAQ)"
    },
    "Ticketing": {
        "en": "Tickets",
        "sw": "Kununua Tiketi"
    },
    "Huduma za Tiketi": {
        "en": "Ticketing Services",
        "sw": "Huduma za Tiketi"
    },
    "Mialiko & RSVP": {
        "en": "Invitations & RSVP",
        "sw": "Mialiko & RSVP"
    },
    "Browse & Buy Tickets": {
        "en": "Browse & Buy Tickets",
        "sw": "Tazama & Nunua Tiketi"
    },
    "Create Invitations": {
        "en": "Create Invitations",
        "sw": "Tengeneza Mialiko"
    },
    "Passes Papo Hapo WhatsApp & SMS": {
        "en": "Instant WhatsApp & SMS Passes",
        "sw": "Passes Papo Hapo WhatsApp & SMS"
    },
    "Malipo ya Mitandao Yote & Kadi": {
        "en": "Mobile Money & Card Payments",
        "sw": "Malipo ya Mitandao Yote & Kadi"
    },
    "Kuscan Mlangoni kwa Simu": {
        "en": "Live Gate Scanner App",
        "sw": "Kuscan Mlangoni kwa Simu"
    },
    "Bila Kufungua Akaunti (Tiketi)": {
        "en": "Zero Account Needed to Buy Tickets",
        "sw": "Bila Kufungua Akaunti (Tiketi)"
    },
    "Kardovo Ticketing Platform": {
        "en": "Kardovo Ticketing Platform",
        "sw": "Mfumo wa Tiketi wa Kardovo"
    },
    "Discover, Book & Sell Tickets Instantly": {
        "en": "Discover, Book & Sell Tickets Across Tanzania",
        "sw": "Gundua, Nunua & Uza Tiketi Zako Papo Hapo"
    },
    "ticketing_showcase_desc": {
        "en": "No queues, no mandatory account sign-up. Attendees book tickets in seconds with M-Pesa, Airtel Money, Tigo Pesa, or Cards, receiving instant dynamic QR passes directly on their phone.",
        "sw": "Ondoa usumbufu wa foleni au kujiandikisha. Wanunuzi wanakata tiketi chini ya dakika 1 kwa M-Pesa, Airtel Money, Tigo Pesa au Kadi, na kupata Pass ya QR moja kwa moja kwenye simu zao."
    },
    "For Ticket Buyers": {
        "en": "For Ticket Buyers",
        "sw": "Kwa Wanunuzi wa Tiketi"
    },
    "For Organizers & Businesses": {
        "en": "For Organizers & Businesses",
        "sw": "Kwa Waandaaji wa Matukio"
    },
    "Door Access & Gate Pass": {
        "en": "Door Access & Gate Pass",
        "sw": "Uhakiki & Lango la Kuingilia"
    },
    "Explore Ticketing Marketplace": {
        "en": "Explore Ticketing Marketplace",
        "sw": "Fungua Soko la Tiketi"
    },
    "Start Selling Tickets": {
        "en": "Start Selling Tickets",
        "sw": "Anza Kuuza Tiketi Zako"
    },
    "Featured Live Experiences": {
        "en": "Featured Live Experiences Across Tanzania",
        "sw": "Matukio Yanayoendelea Tanzania"
    },
    "View event": {
        "en": "View event",
        "sw": "Kata Tiketi"
    },
    "Log In": {
        "en": "Log In",
        "sw": "Ingia"
    },
    "Sign Up": {
        "en": "Sign Up",
        "sw": "Tengeneza Akaunti"
    },
    "Go to Dashboard": {
        "en": "Go to Dashboard",
        "sw": "Ingia Kwenye Akaunti"
    },
    "Start Now": {
        "en": "Start Now",
        "sw": "Anza Sasa"
    },
    "Kadi za Kidigitali na Usimamizi Kisasa": {
        "en": "Digital Invitations, Ticketing & Voting Platform",
        "sw": "Kadi za Kidigitali, Tiketi & Upigaji Kura Tanzania"
    },
    "Tuma Mialiko Yako Kidigitali": {
        "en": "Send Your Invitations Digitally",
        "sw": "Tuma Mialiko Yako Kidigitali"
    },
    "Kupitia": {
        "en": "Via",
        "sw": "Kupitia"
    },
    "Tengeneza kadi zenye muonekano wa kuvutia, pokea majibu (RSVP) moja kwa moja, na dhibiti uingiaji wa wageni mlangoni kwa kutumia QR Code scanner.": {
        "en": "Create stunning cards, receive instant RSVPs, and manage guest entry at the door using a QR Code scanner.",
        "sw": "Tengeneza kadi zenye muonekano wa kuvutia, pokea majibu (RSVP) moja kwa moja, na dhibiti uingiaji wa wageni mlangoni kwa kutumia QR Code scanner."
    },
    "Tengeneza Kadi Yako": {
        "en": "Create Your Card",
        "sw": "Tengeneza Kadi Yako"
    },
    "Tuma Mfano": {
        "en": "Send Demo",
        "sw": "Tuma Mfano"
    },
    "Mfano:": {
        "en": "Example:",
        "sw": "Mfano:"
    },
    "Mialiko Iliyotumwa": {
        "en": "Invitations Sent",
        "sw": "Mialiko Iliyotumwa"
    },
    "Uhakika wa Kufika": {
        "en": "Target System Uptime",
        "sw": "Uhakika wa Mfumo"
    },
    "Huduma kwa Wateja": {
        "en": "Customer Service",
        "sw": "Huduma kwa Wateja"
    },
    "Kuscan Mlangoni": {
        "en": "Door Scanning",
        "sw": "Kuscan Mlangoni"
    },
    "Hatua tano tu zinazokutenganisha wewe na usimamizi bora wa tukio lako kidigitali.": {
        "en": "Just five steps separate you from perfect digital event management.",
        "sw": "Hatua tano tu zinazokutenganisha wewe na usimamizi bora wa tukio lako kidigitali."
    },
    "Chagua kifurushi kinachoendana na mahitaji ya ukubwa wa tukio lako.": {
        "en": "Choose a package that suits the size of your event.",
        "sw": "Chagua kifurushi kinachoendana na mahitaji ya ukubwa wa tukio lako."
    },
    "Kumbuka:": {
        "en": "Note:",
        "sw": "Kumbuka:"
    },
    "Utalipia Tsh 35,000 ya Scanner siku ya tukio au upewe App bure ujiscanie.": {
        "en": "You will pay Tsh 35,000 for Scanner on event day or get the App free to scan yourself.",
        "sw": "Utalipia Tsh 35,000 ya Scanner siku ya tukio au upewe App bure ujiscanie."
    },
    "Kadi za kidigitali zenye QR": {
        "en": "Digital cards with QR",
        "sw": "Kadi za kidigitali zenye QR"
    },
    "Kutuma WhatsApp & SMS": {
        "en": "Send WhatsApp & SMS",
        "sw": "Kutuma WhatsApp & SMS"
    },
    "Wageni Waliohudumiwa": {
        "en": "Guests Served",
        "sw": "Wageni Waliohudumiwa"
    },
    "Uhakika wa Mfumo": {
        "en": "System Reliability",
        "sw": "Uhakika wa Mfumo"
    },
    "Msaada wa Wateja": {
        "en": "Customer Support",
        "sw": "Msaada wa Wateja"
    },
    "Kasi ya Kuscani": {
        "en": "Scanning Speed",
        "sw": "Kasi ya Kuscani"
    },
    "Sekunde": {
        "en": "Seconds",
        "sw": "Sekunde"
    },
    "All-in-One Event Toolkit": {
        "en": "All-in-One Event Toolkit",
        "sw": "Suluhisho Kamili Kwa Tukio Lako"
    },
    "Gundua vipengele vinavyofanya mfumo wetu kuwa chaguo namba moja kwa waandaaji wa matukio ya kisasa.": {
        "en": "Discover the features that make our system the number one choice for modern event organizers.",
        "sw": "Gundua vipengele vinavyofanya mfumo wetu kuwa chaguo namba moja kwa waandaaji wa matukio ya kisasa."
    },
    "Kadi za Kidigitali": {
        "en": "Digital Cards",
        "sw": "Kadi za Kidigitali"
    },
    "Tengeneza kadi zenye muonekano wa kisasa. Jumuisha namba ya kiti, ramani, na QR Code kwa ajili ya mlangoni.": {
        "en": "Create modern looking cards. Include seat numbers, maps, and QR Codes for door entry.",
        "sw": "Tengeneza kadi zenye muonekano wa kisasa. Jumuisha namba ya kiti, ramani, na QR Code kwa ajili ya mlangoni."
    },
    "WhatsApp & SMS": {
        "en": "WhatsApp & SMS",
        "sw": "WhatsApp & SMS"
    },
    "Watumie wageni wako kadi zao moja kwa moja kwenye namba zao za simu kwa uharaka na uhakika mkubwa.": {
        "en": "Send your guests their cards directly to their phone numbers quickly and reliably.",
        "sw": "Watumie wageni wako kadi zao moja kwa moja kwenye namba zao za simu kwa uharaka na uhakika mkubwa."
    },
    "Usimamizi wa Michango": {
        "en": "Contribution Management",
        "sw": "Usimamizi wa Michango"
    },
    "Dhibiti ahadi na michango kwa urahisi. Tuma jumbe za kukumbusha wageni kuhusu ahadi zao kiotomatiki.": {
        "en": "Easily manage pledges and contributions. Send automated reminder messages to guests.",
        "sw": "Dhibiti ahadi na michango kwa urahisi. Tuma jumbe za kukumbusha wageni kuhusu ahadi zao kiotomatiki."
    },
    "Majibu ya Wageni (RSVP)": {
        "en": "Guest Responses (RSVP)",
        "sw": "Majibu ya Wageni (RSVP)"
    },
    "Pata majibu ya uhakika (RSVP) moja kwa moja kwenye mfumo wakati wageni wanapothibitisha ushiriki wao.": {
        "en": "Get reliable RSVPs directly in the system when guests confirm their attendance.",
        "sw": "Pata majibu ya uhakika (RSVP) moja kwa moja kwenye mfumo wakati wageni wanapothibitisha ushiriki wao."
    },
    "Kuscan QR Mlangoni": {
        "en": "QR Scanning at Door",
        "sw": "Kuscan QR Mlangoni"
    },
    "Ondoa kero ya watu wasioalikwa. Tumia simu kuscan QR Code mlangoni na kuhakiki taarifa za mgeni sekunde chache tu.": {
        "en": "Eliminate uninvited guests. Use a phone to scan QR Codes at the door and verify guest details in seconds.",
        "sw": "Ondoa kero ya watu wasioalikwa. Tumia simu kuscan QR Code mlangoni na kuhakiki taarifa za mgeni sekunde chache tu."
    },
    "Ripoti za Moja kwa Moja": {
        "en": "Real-time Reports",
        "sw": "Ripoti za Moja kwa Moja"
    },
    "Fuatilia kwa ukaribu idadi ya mialiko iliyofika, majibu ya RSVP, na wageni waliokwisha ingia ukumbini.": {
        "en": "Closely monitor the number of delivered invitations, RSVP responses, and guests who have entered the venue.",
        "sw": "Fuatilia kwa ukaribu idadi ya mialiko iliyofika, majibu ya RSVP, na wageni waliokwisha ingia ukumbini."
    },
    "Jinsi Inavyofanya Kazi": {
        "en": "How It Works",
        "sw": "Jinsi Inavyofanya Kazi"
    },
    "Rahisi Kutumia Kuanzia Mwanzo Hadi Mwisho": {
        "en": "Easy to Use From Start to Finish",
        "sw": "Rahisi Kutumia Kuanzia Mwanzo Hadi Mwisho"
    },
    "Hatua tatu rahisi za kufanikisha sherehe yako kidigitali bila stress.": {
        "en": "Three simple steps to digitally organize your event stress-free.",
        "sw": "Hatua tatu rahisi za kufanikisha sherehe yako kidigitali bila stress."
    },
    "1. Tengeneza na Tuma": {
        "en": "1. Create and Send",
        "sw": "1. Tengeneza na Tuma"
    },
    "Ingiza majina, tengeneza kadi nzuri na utume kwa wageni wako wote kwa click moja tu.": {
        "en": "Enter names, create beautiful cards and send them to all your guests with just one click.",
        "sw": "Ingiza majina, tengeneza kadi nzuri na utume kwa wageni wako wote kwa click moja tu."
    },
    "2. Pokea Michango & RSVP": {
        "en": "2. Receive Pledges & RSVPs",
        "sw": "2. Pokea Michango & RSVP"
    },
    "Wageni wako watapata link ya kuthibitisha ushiriki (RSVP) na kuweka ahadi zao.": {
        "en": "Your guests will receive a link to confirm attendance (RSVP) and make their pledges.",
        "sw": "Wageni wako watapata link ya kuthibitisha ushiriki (RSVP) na kuweka ahadi zao."
    },
    "3. Scan na Mkaribishe Mgeni": {
        "en": "3. Scan and Welcome Guest",
        "sw": "3. Scan and Welcome Guest"
    },
    "Siku ya sherehe, mgeni akifika mlangoni anaonyesha QR Code yake na kuscania.": {
        "en": "On the event day, arriving guests show their QR Code for quick scanning.",
        "sw": "Siku ya sherehe, mgeni akifika mlangoni anaonyesha QR Code yake na kuscania."
    },
    "Bei Zetu ni Nafuu": {
        "en": "Affordable Payment",
        "sw": "Bei Zetu ni Nafuu"
    },
    "Chagua Kifurushi Kinachokufaa": {
        "en": "Choose Your Perfect Plan",
        "sw": "Chagua Kifurushi Kinachokufaa"
    },
    "Kila kitu unachokihitaji kurahisisha usimamizi wa sherehe yako kuanzia maandalizi hadi siku ya tukio yenyewe.": {
        "en": "Everything you need to simplify your event management from preparation to the event day.",
        "sw": "Kila kitu unachokihitaji kurahisisha usimamizi wa sherehe yako kuanzia maandalizi hadi siku ya tukio yenyewe."
    },
    "Vipengele vyote vya Basic": {
        "en": "All Basic features",
        "sw": "Vipengele vyote vya Basic"
    },
    "Vipengele vyote vya Standard": {
        "en": "All Standard features",
        "sw": "Vipengele vyote vya Standard"
    },
    "Vipengele vyote vya Premium": {
        "en": "All Premium features",
        "sw": "Vipengele vyote vya Premium"
    },
    "Kadi zisizo na kikomo": {
        "en": "Unlimited cards",
        "sw": "Kadi zisizo na kikomo"
    },
    "Simu kuhakiki kadi kufika": {
        "en": "Phone calls to verify card delivery",
        "sw": "Simu kuhakiki kadi kufika"
    },
    "Check-in scanner siku ya tukio": {
        "en": "Check-in scanner on event day",
        "sw": "Check-in scanner siku ya tukio"
    },
    "Check-in scanner siku ya tukio (Min. kadi 200)": {
        "en": "Check-in scanner on event day (Min. 200 cards)",
        "sw": "Check-in scanner siku ya tukio (Min. kadi 200)"
    },
    "Ujumbe wa shukrani baadaye": {
        "en": "Thank you message afterwards",
        "sw": "Ujumbe wa shukrani baadaye"
    },
    "Simu za uhakiki kwa wageni": {
        "en": "Verification calls to guests",
        "sw": "Simu za uhakiki kwa wageni"
    },
    "Ujumbe kukumbusha michango": {
        "en": "Messages to remind about pledges",
        "sw": "Ujumbe kukumbusha michango"
    },
    "Minimum order: Kadi 200": {
        "en": "Minimum order: 200 cards",
        "sw": "Minimum order: Kadi 200"
    },
    "Tovuti (Web Page) maalum kwa ajili ya tukio lako lote.": {
        "en": "Custom Web Page for your entire event.",
        "sw": "Tovuti (Web Page) maalum kwa ajili ya tukio lako lote."
    },
    
    "Chagua Kifurushi": {
        "en": "Choose Plan",
        "sw": "Chagua Kifurushi"
    },
    "Bure kwa majaribio!": {
        "en": "Free for trial!",
        "sw": "Bure kwa majaribio!"
    },
    "Pendekezo": {
        "en": "Recommended",
        "sw": "Pendekezo"
    },
    "Tsh/kadi": {
        "en": "Tsh/card",
        "sw": "Tsh/kadi"
    },
    "Haki zote zimehifadhiwa.": {
        "en": "All rights reserved.",
        "sw": "Haki zote zimehifadhiwa."
    },
    "Vigezo na Masharti": {
        "en": "Terms & Conditions",
        "sw": "Vigezo na Masharti"
    },
    "Sera ya Faragha": {
        "en": "Privacy Policy",
        "sw": "Sera ya Faragha"
    },
    "Haki zote zimehifadhiwa": {
        "en": "All rights reserved",
        "sw": "Haki zote zimehifadhiwa"
    },
    "4. Hakiki na Uripoti": {
        "en": "4. Verify and Report",
        "sw": "4. Hakiki na Uripoti"
    },
    "Pata taarifa za kina kuhusu nani ameingia ukumbini, michango iliyopokelewa, na idadi ya wageni waliobaki.": {
        "en": "Get detailed reports on who has entered the venue, pledges received, and remaining guests.",
        "sw": "Pata taarifa za kina kuhusu nani ameingia ukumbini, michango iliyopokelewa, na idadi ya wageni waliobaki."
    },
    "Tengeneza akaunti na uchague muonekano wa kadi yako ya kidigitali katika mfumo.": {
        "en": "Create an account and choose the design of your digital card in the system.",
        "sw": "Tengeneza akaunti na uchague muonekano wa kadi yako ya kidigitali katika mfumo."
    },
    "Tuma Mialiko": {
        "en": "Send Invitations",
        "sw": "Tuma Mialiko"
    },
    "Weka majina ya wageni wako kisha watumie mialiko yao moja kwa moja kwa WhatsApp au SMS.": {
        "en": "Enter your guests' names and send their invitations directly via WhatsApp or SMS.",
        "sw": "Weka majina ya wageni wako kisha watumie mialiko yao moja kwa moja kwa WhatsApp au SMS."
    },
    "Wageni watafungua kadi zao na kuthibitisha (RSVP) mtandaoni kama watahudhuria au la.": {
        "en": "Guests will open their cards and confirm (RSVP) online whether they will attend or not.",
        "sw": "Wageni watafungua kadi zao na kuthibitisha (RSVP) mtandaoni kama watahudhuria au la."
    },
    "Siku ya tukio, scan QR code kwenye kadi zao mlangoni kuruhusu walioalikwa tu kuingia.": {
        "en": "On event day, scan the QR code on their cards at the door to allow only invitees to enter.",
        "sw": "Siku ya tukio, scan QR code kwenye kadi zao mlangoni kuruhusu walioalikwa tu kuingia."
    },
    "Sajili Tukio Lako": {
        "en": "Register Your Event",
        "sw": "Sajili Tukio Lako"
    },
    "Fanya Malipo": {
        "en": "Make Payment",
        "sw": "Fanya Malipo"
    },
    "Nunua kifurushi kufungua huduma zote muhimu na kuendelea na maandalizi.": {
        "en": "Purchase a package to unlock all essential services and proceed with preparations.",
        "sw": "Nunua kifurushi kufungua huduma zote muhimu na kuendelea na maandalizi."
    },
    "Pokea Majibu": {
        "en": "Receive RSVPs",
        "sw": "Pokea Majibu"
    },
    "Scan QR Mlangoni": {
        "en": "Scan QR at the Door",
        "sw": "Scan QR Mlangoni"
    }
};

function TechBackground() {
    return (
        <div className="absolute -inset-10 z-0 pointer-events-none overflow-hidden opacity-80">
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes float-node-1 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
                    33% { transform: translate(50px, -50px) scale(1.1); opacity: 0.3; }
                    66% { transform: translate(-30px, -20px) scale(0.9); opacity: 0.2; }
                }
                @keyframes float-node-2 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
                    25% { transform: translate(-60px, 40px) scale(1.1); opacity: 0.3; }
                    50% { transform: translate(-20px, 80px) scale(1.0); opacity: 0.2; }
                    75% { transform: translate(40px, 20px) scale(0.9); opacity: 0.3; }
                }
                @keyframes float-node-3 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
                    50% { transform: translate(-80px, -80px) scale(1.2); opacity: 0.4; }
                }
                @keyframes plane-s-curve-1 {
                    0% { transform: translate(-10vw, 50vh) rotate(25deg) scale(0.8); opacity: 0; }
                    12.5% { transform: translate(10vw, 30vh) rotate(35deg) scale(0.9); opacity: 0.6; }
                    25% { transform: translate(30vw, 20vh) rotate(45deg) scale(1); opacity: 0.8; }
                    37.5% { transform: translate(50vw, 30vh) rotate(55deg) scale(1.1); opacity: 0.8; }
                    50% { transform: translate(70vw, 50vh) rotate(65deg) scale(1.1); opacity: 0.8; }
                    62.5% { transform: translate(90vw, 70vh) rotate(55deg) scale(1); opacity: 0.8; }
                    75% { transform: translate(110vw, 80vh) rotate(45deg) scale(0.9); opacity: 0.6; }
                    100% { transform: translate(130vw, 50vh) rotate(25deg) scale(0.8); opacity: 0; }
                }
                @keyframes plane-s-curve-2 {
                    0% { transform: translate(110vw, 40vh) rotate(-115deg) scale(0.6); opacity: 0; }
                    12.5% { transform: translate(90vw, 60vh) rotate(-125deg) scale(0.7); opacity: 0.5; }
                    25% { transform: translate(70vw, 70vh) rotate(-135deg) scale(0.8); opacity: 0.6; }
                    37.5% { transform: translate(50vw, 60vh) rotate(-145deg) scale(0.9); opacity: 0.6; }
                    50% { transform: translate(30vw, 40vh) rotate(-155deg) scale(0.9); opacity: 0.6; }
                    62.5% { transform: translate(10vw, 20vh) rotate(-145deg) scale(0.8); opacity: 0.6; }
                    75% { transform: translate(-10vw, 10vh) rotate(-135deg) scale(0.7); opacity: 0.5; }
                    100% { transform: translate(-30vw, 40vh) rotate(-115deg) scale(0.6); opacity: 0; }
                }
                @keyframes data-flow {
                    to { stroke-dashoffset: 0; }
                }
                @keyframes pulse-node {
                    0%, 100% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.5); opacity: 0.8; }
                }
                @keyframes float-network {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-20px) scale(1.02); }
                }
                .circuit-path {
                    fill: none;
                    stroke: currentColor;
                    stroke-width: 1.5;
                    stroke-dasharray: 15 100;
                    stroke-dashoffset: 100;
                    animation: data-flow 8s linear infinite;
                }
                .circuit-path-slow {
                    animation-duration: 14s;
                }
                .circuit-path-reverse {
                    animation-direction: reverse;
                    stroke-dasharray: 10 120;
                }
            `}} />
            
            {/* Tech Grid */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#0B2545 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>
            
            {/* Network / Circuit SVG Canvas */}
            <div className="absolute inset-0 flex justify-center items-center opacity-40 -mt-24 md:-mt-40" style={{ animation: 'float-network 25s ease-in-out infinite' }}>
                <svg className="w-[120%] h-[120%] max-w-none text-slate-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
                    <g className="text-blue-500/30">
                        {/* Static Traces */}
                        <path d="M 100 500 L 200 500 L 300 400 L 500 400 L 550 350 L 800 350" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <path d="M 150 100 L 250 200 L 400 200 L 500 100 L 900 100" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <path d="M 400 600 L 500 500 L 700 500 L 800 600" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        
                        {/* Animated Data Flows */}
                        <path className="circuit-path" d="M 100 500 L 200 500 L 300 400 L 500 400 L 550 350 L 800 350" />
                        <path className="circuit-path circuit-path-slow circuit-path-reverse text-emerald-500/40" d="M 150 100 L 250 200 L 400 200 L 500 100 L 900 100" />
                        <path className="circuit-path circuit-path-slow text-indigo-400/40" d="M 400 600 L 500 500 L 700 500 L 800 600" />
                        <path className="circuit-path text-sky-400/30" d="M 0 300 L 300 300 L 400 200 L 600 200 L 700 300 L 1000 300" />
                    </g>
                    
                    {/* Circuit Nodes */}
                    <circle cx="200" cy="500" r="4" fill="currentColor" className="text-blue-400" style={{ animation: 'pulse-node 16s infinite' }} />
                    <circle cx="300" cy="400" r="3" fill="currentColor" className="text-slate-300" />
                    <circle cx="500" cy="400" r="4" fill="currentColor" className="text-blue-400" style={{ animation: 'pulse-node 16s infinite 1s' }} />
                    <circle cx="550" cy="350" r="3" fill="currentColor" className="text-slate-300" />
                    
                    <circle cx="250" cy="200" r="4" fill="currentColor" className="text-emerald-400" style={{ animation: 'pulse-node 14s infinite' }} />
                    <circle cx="400" cy="200" r="3" fill="currentColor" className="text-slate-300" />
                    <circle cx="500" cy="100" r="5" fill="currentColor" className="text-emerald-400" style={{ animation: 'pulse-node 14s infinite 1.5s' }} />
                    
                    <circle cx="500" cy="500" r="4" fill="currentColor" className="text-indigo-400" style={{ animation: 'pulse-node 12s infinite' }} />
                    <circle cx="700" cy="500" r="4" fill="currentColor" className="text-indigo-400" style={{ animation: 'pulse-node 12s infinite 1s' }} />
                    
                    <circle cx="300" cy="300" r="3" fill="currentColor" className="text-sky-400" />
                    <circle cx="400" cy="200" r="4" fill="currentColor" className="text-sky-400" style={{ animation: 'pulse-node 16s infinite' }} />
                    <circle cx="600" cy="200" r="3" fill="currentColor" className="text-sky-400" />
                    <circle cx="700" cy="300" r="5" fill="currentColor" className="text-sky-400" style={{ animation: 'pulse-node 16s infinite 2s' }} />
                </svg>
            </div>
            
            
            
            
        
        </div>
    );
}

function AnimatedCounter({ end, duration = 2500, suffix = '', decimals = 0 }) {
    const [count, setCount] = React.useState(0);
    const countRef = React.useRef(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                let startTimestamp = null;
                const step = (timestamp) => {
                    if (!startTimestamp) startTimestamp = timestamp;
                    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                    setCount(progress * end);
                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    } else {
                        setCount(end);
                    }
                };
                window.requestAnimationFrame(step);
                observer.disconnect();
            }
        }, { threshold: 0.5 });
        if (countRef.current) {
            observer.observe(countRef.current);
        }
        return () => observer.disconnect();
    }, [end, duration]);

    return (
        <span ref={countRef}>
            {count.toFixed(decimals)}{suffix}
        </span>
    );
}


function FAQItem({ question, answer }) {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <div className="border-b border-slate-200/60 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center justify-between w-full py-5 text-left cursor-pointer group"
            >
                <span className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors pr-6">{question}</span>
                <span className={`transform transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-slate-600 leading-relaxed text-sm">{answer}</p>
            </div>
        </div>
    );
}

function FAQSection({ t }) {
    const faqs = [
        {
            q: t("Je, wanunuzi wa tiketi wanahitaji kufungua akaunti?"),
            a: t("faq_no_account_ans")
        },
        {
            q: t("Je, wageni wangu wanahitaji kupakua app yoyote?"),
            a: t("Hapana! Wageni wanapokea kiungo (link) kupitia WhatsApp au SMS ambacho kinawafungulia kadi yao ya mwaliko kwenye kivinjari cha simu zao, ambapo wanaweza kujibu (RSVP) mara moja.")
        },
        {
            q: t("QR Code scanner inafanyaje kazi mlangoni?"),
            a: t("Baada ya mgeni kuthibitisha (RSVP) au kununua tiketi, anapata Pass yenye QR Code. Siku ya tukio, walinzi au wahudumu wako watatumia simu zao kuscan hizo QR Codes mlangoni ili kuruhusu wageni kuingia haraka chini ya sekunde 0.2 bila msongamano wala tiketi bandia.")
        },
        {
            q: t("Mratibu wa tukio anawezaje kuanza kuuza tiketi na kupokea malipo?"),
            a: t("faq_organizer_payout_ans")
        },
        {
            q: t("Je, ninaweza kufanya malipo kwa njia gani?"),
            a: t("Tunapokea malipo kupitia mitandao yote ya simu (M-Pesa, Mixx by Yas, Airtel Money, HaloPesa, AzamPesa) na kadi za benki (Visa, Mastercard, Amex) kwa usalama na uhakika kupitia AzamPay.")
        }
    ];

    return (
        <section id="faq" className="min-h-[calc(100vh-5rem)] flex flex-col justify-center py-12 sm:py-16 bg-[#F0F2F5] scroll-mt-20">
            <div className="max-w-4xl mx-auto px-6 w-full">
                <div className="text-center mb-10 sm:mb-12 scroll-animate delay-100">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 mb-3 font-display pb-1">{t("Maswali Yanayoulizwa Sana (FAQ)")}</h2>
                    <p className="text-slate-500 text-base sm:text-lg">{t("Pata majibu ya maswali muhimu kuhusu matumizi ya Kardovo.")}</p>
                </div>
                <div className="bg-slate-50 rounded-3xl p-6 md:p-10 border border-slate-100 shadow-xs scroll-animate delay-200">
                    {faqs.map((faq, idx) => (
                        <FAQItem key={idx} question={faq.q} answer={faq.a} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function InstagramIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
    );
}

function FacebookIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
    );
}

function WhatsAppIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
    );
}

export default function Welcome({ auth }) {
    const [lang, setLangState] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kardovo_lang');
            if (saved === 'en' || saved === 'sw') return saved;
        }
        return 'sw';
    });

    const setLang = (newLang) => {
        setLangState(newLang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('kardovo_lang', newLang);
            window.dispatchEvent(new CustomEvent('kardovo-lang-change', { detail: { lang: newLang } }));
        }
    };

    useEffect(() => {
        const handleLangChange = (e) => {
            if (e.detail?.lang && (e.detail.lang === 'en' || e.detail.lang === 'sw')) {
                setLangState(e.detail.lang);
            }
        };
        window.addEventListener('kardovo-lang-change', handleLangChange);
        return () => window.removeEventListener('kardovo-lang-change', handleLangChange);
    }, []);

    const t = (key) => translations[key] ? translations[key][lang] : key;

    // Apply the landing page hero background to body only while on Welcome page to prevent refresh glitch,
    // and clean up so it never bleeds into ScannerApp or other pages.
    useEffect(() => {
        document.body.classList.add('bg-[#0B2545]');
        document.documentElement.classList.remove('dark');
        return () => {
            document.body.classList.remove('bg-[#0B2545]');
        };
    }, []);

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('register');

    const openAuthModal = (mode) => {
        setAuthModalMode(mode);
        setShowLoginModal(true);
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const authParam = params.get('auth');
            if (authParam === 'login' || authParam === 'register') {
                openAuthModal(authParam);
            }
            const scrollParam = params.get('scroll');
            if (scrollParam) {
                setTimeout(() => window.scrollTo(0, parseInt(scrollParam, 10)), 100);
            }
        }
    }, []);
    const [activeSection, setActiveSection] = React.useState('');

    // ── TOP NAVBAR TRANSPARENT ON TOP SECTION, SOLID NAVY ON INVITATIONS & BELOW ──
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const invitationsEl = document.getElementById('invitations');
            if (invitationsEl) {
                const navHeight = 80; // h-20 navbar
                const rect = invitationsEl.getBoundingClientRect();
                setIsScrolled(rect.top <= navHeight);
            } else {
                setIsScrolled(window.scrollY > 400);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e, sectionId) => {
        if (e) e.preventDefault();
        const el = document.getElementById(sectionId);
        if (!el) return;

        const navHeight = 80; // h-20 sticky header
        const rect = el.getBoundingClientRect();
        const targetTop = rect.top + window.scrollY - navHeight;

        window.scrollTo({
            top: Math.max(0, Math.round(targetTop)),
            behavior: 'smooth'
        });

        if (window.history?.replaceState) {
            window.history.replaceState(null, '', `#${sectionId}`);
        }
        setActiveSection(sectionId);
    };

    useEffect(() => {
        // Ensure page always starts at top on fresh page load/reload
        if (typeof window !== 'undefined') {
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'manual';
            }
            // If the browser reloaded with an anchor hash in the URL, remove hash and scroll to top
            if (window.location.hash) {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
                window.scrollTo(0, 0);
            }
        }
    }, []);

    React.useEffect(() => {
        const sections = ['invitations', 'how-it-works', 'payment', 'faq', 'contact'];
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    let current = '';
                    const navHeight = 80;
                    sections.forEach(section => {
                        const el = document.getElementById(section);
                        if (el) {
                            const rect = el.getBoundingClientRect();
                            if (rect.top <= navHeight + 80 && rect.bottom >= navHeight + 80) {
                                current = section;
                            }
                        }
                    });
                    if (window.scrollY < 200) {
                        current = '';
                    }
                    setActiveSection(current);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        // Scroll Animation Logic
        const animObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        const animElements = document.querySelectorAll('.scroll-animate, .scroll-animate-mockup, .scroll-animate-phone');
        animElements.forEach((el) => animObserver.observe(el));

        return () => {
            window.removeEventListener('scroll', handleScroll);
            animObserver.disconnect();
        };
    }, []);
    return (
        <div className="min-h-screen bg-[#F0F2F5] text-slate-800 font-sans selection:bg-[#154F7C] selection:text-white relative overflow-x-clip overscroll-none">
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes float {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: float 15s infinite ease-in-out;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .scroll-animate {
                    opacity: 0;
                    transform: translateY(60px) scale(0.95);
                    transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .scroll-animate-mockup {
                    opacity: 0;
                    transform: perspective(1200px) rotateX(15deg) translateY(100px) scale(0.9);
                    transition: all 1.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                @keyframes mockup-shake {
                    0% { transform: perspective(1000px) translateY(120px) rotate(8deg) scale(0.85); opacity: 0; }
                    40% { transform: perspective(1000px) translateY(-15px) rotate(-4deg) scale(1.05); opacity: 1; }
                    60% { transform: perspective(1000px) translateY(10px) rotate(2deg) scale(0.98); opacity: 1; }
                    80% { transform: perspective(1000px) translateY(-5px) rotate(-1deg) scale(1.01); opacity: 1; }
                    100% { transform: perspective(1000px) translateY(0) rotate(0) scale(1); opacity: 1; }
                }
                .scroll-animate-phone {
                    opacity: 0;
                }
                .scroll-animate-phone.is-visible {
                    animation: mockup-shake 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                    animation-delay: 800ms;
                }

                .scroll-animate-mockup.is-visible {
                    opacity: 1;
                    transform: perspective(1200px) rotateX(0deg) translateY(0) scale(1);
                }

                .scroll-animate.is-visible {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                .delay-100 { transition-delay: 100ms; }
                .delay-200 { transition-delay: 200ms; }
                .delay-300 { transition-delay: 300ms; }
                .delay-400 { transition-delay: 400ms; }
                .delay-500 { transition-delay: 500ms; }
                @keyframes move-forever {
                    0% { transform: translate3d(-90px, 0, 0); }
                    100% { transform: translate3d(85px, 0, 0); }
                }
                .animate-wave-slow { animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite; }
                .animate-wave-medium { animation: move-forever 20s cubic-bezier(.55,.5,.45,.5) infinite; }
                .animate-wave-fast { animation: move-forever 15s cubic-bezier(.55,.5,.45,.5) infinite; }
                .animate-wave-fastest { animation: move-forever 10s cubic-bezier(.55,.5,.45,.5) infinite; }
                
                /* Silky-smooth Page Loaded Reveal Transition */
                @keyframes heroBackdropReveal {
                    0% {
                        opacity: 0;
                        transform: scale(1.04);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .hero-backdrop-reveal {
                    animation: heroBackdropReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    will-change: transform, opacity;
                }

                @keyframes hero-fade-up {
                    0% {
                        opacity: 0;
                        transform: translateY(24px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes shimmer-gradient {
                    0%, 100% {
                        background-size: 200% 200%;
                        background-position: 0% 50%;
                    }
                    50% {
                        background-size: 200% 200%;
                        background-position: 100% 50%;
                    }
                }
                .animate-hero-headline {
                    animation: hero-fade-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
                }
                .animate-hero-gradient {
                    background-size: 200% 200%;
                    animation: shimmer-gradient 6s ease-in-out infinite;
                }
                .animate-hero-subtitle {
                    animation: hero-fade-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both;
                }
                .animate-hero-cta {
                    animation: hero-fade-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.38s both;
                }
                @keyframes float-gentle-1 {
                    0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
                    33% { transform: translate(12px, -18px) rotate(4deg); }
                    66% { transform: translate(-8px, 10px) rotate(-3deg); }
                }
                @keyframes float-gentle-2 {
                    0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
                    33% { transform: translate(-14px, 14px) rotate(-5deg); }
                    66% { transform: translate(10px, -12px) rotate(3deg); }
                }
                @keyframes float-gentle-3 {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    50% { transform: translate(15px, -15px) scale(1.05); }
                }
                @keyframes float-gentle-4 {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(-16px, -12px) scale(1.08); }
                    66% { transform: translate(12px, 14px) scale(0.95); }
                }
                @keyframes float-gentle-5 {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    50% { transform: translate(-20px, 18px) scale(1.12); }
                }
                @keyframes float-gentle-6 {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    40% { transform: translate(18px, -16px) scale(1.06); }
                    80% { transform: translate(-10px, 8px) scale(0.96); }
                }
                @keyframes float-orbit {
                    0% { transform: rotate(0deg) translateX(25px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(25px) rotate(-360deg); }
                }
                .hero-float-1 { animation: float-gentle-1 9s ease-in-out infinite; }
                .hero-float-2 { animation: float-gentle-2 11s ease-in-out infinite; }
                .hero-float-3 { animation: float-gentle-3 8s ease-in-out infinite; }
                .hero-float-4 { animation: float-gentle-4 10s ease-in-out infinite; }
                .hero-float-5 { animation: float-gentle-5 13s ease-in-out infinite; }
                .hero-float-6 { animation: float-gentle-6 12s ease-in-out infinite; }
                .hero-float-orbit { animation: float-orbit 20s linear infinite; }

                /* Hero Cards Cascading Entrance Animations */
                @keyframes heroCardFadeIn1 {
                    0% {
                        opacity: 0;
                        transform: translateY(32px) rotate(-6deg) scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) rotate(-3deg) scale(1);
                    }
                }
                @keyframes heroCardFadeIn2 {
                    0% {
                        opacity: 0;
                        transform: translateY(32px) rotate(6deg) scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) rotate(3deg) scale(1);
                    }
                }
                @keyframes heroCardFadeIn3 {
                    0% {
                        opacity: 0;
                        transform: translateY(36px) scale(0.94);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .hero-card-anim-1 {
                    animation: heroCardFadeIn1 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both;
                }
                .hero-card-anim-2 {
                    animation: heroCardFadeIn2 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both;
                }
                .hero-card-anim-3 {
                    animation: heroCardFadeIn3 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both;
                }

                /* Hero Floating Stats Bar Entrance */
                @keyframes heroStatsBarSlide {
                    0% { opacity: 0; transform: translateY(28px) scale(0.98); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .hero-stats-anim {
                    animation: heroStatsBarSlide 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
                }

                /* Category Card Staggered Pop-In for Ticketing Section */
                @keyframes ticketCategoryPop {
                    0% {
                        opacity: 0;
                        transform: translateY(28px) scale(0.94);
                    }
                    60% {
                        opacity: 1;
                        transform: translateY(-4px) scale(1.01);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .is-visible .ticket-category-card {
                    animation: ticketCategoryPop 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
            `}} />
            <Head title={t("Kadi za Kidigitali na Usimamizi Kisasa")} />

            {/* Top Navigation Bar (Translucent glass throughout, generous height, right-aligned nav) */}
            <header 
                className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
                    isScrolled 
                        ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-xs" 
                        : "bg-white/[0.1] backdrop-blur-xl border-b border-white/25 shadow-lg"
                }`}
            >
                <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6 transition-colors duration-300 ${isScrolled ? 'text-slate-800' : 'text-white'}`}>
                    {/* Brand Logo on the Far Left */}
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer focus:outline-none flex items-center shrink-0">
                        <KardovoLogo 
                            light={!isScrolled} 
                            showText={true} 
                            textClassName={`${isScrolled ? 'text-slate-900' : 'text-white'} text-base sm:text-lg font-black tracking-widest transition-colors duration-300`} 
                            imgClassName="h-8 w-8 sm:h-9 sm:w-9" 
                        />
                    </button>
                    
                    {/* Right Group: Navigation Links (moved right) + Language Toggle & Auth Buttons */}
                    <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 ml-auto">
                        {/* Navigation Links (Minimalist, clean horizontal arrangement with zero text wrapping) */}
                        <nav className={`hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium transition-colors duration-300 ${isScrolled ? 'text-slate-600' : 'text-white/85'}`}>
                            {/* 1. Tickets */}
                            <Link 
                                href={route('tickets.marketplace')} 
                                className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                    isScrolled
                                        ? 'hover:bg-slate-100 hover:text-slate-900'
                                        : 'hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {lang === 'sw' ? 'Tiketi' : 'Tickets'}
                            </Link>

                            {/* 3. Awards & Voting */}
                            <Link
                                href={route('voting.index')}
                                className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                    isScrolled
                                        ? 'hover:bg-slate-100 hover:text-slate-900'
                                        : 'hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {lang === 'sw' ? 'Kura' : 'Voting'}
                            </Link>

                            {/* 3. How It Works, Pricing, FAQ */}
                            {[
                                { id: 'how-it-works', label: t('How It Works') },
                                { id: 'payment', label: t('Payment') },
                                { id: 'faq', label: t('FAQ') },
                            ].map(link => (
                                <a 
                                    key={link.id}
                                    href={`#${link.id}`} 
                                    onClick={(e) => scrollToSection(e, link.id)}
                                    className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                        isScrolled
                                            ? (activeSection === link.id ? 'bg-sky-50 text-[#154F7C] font-semibold shadow-2xs' : 'hover:bg-slate-100 hover:text-slate-900')
                                            : (activeSection === link.id ? 'bg-white/15 text-white font-semibold backdrop-blur-xs' : 'hover:bg-white/10 hover:text-white')
                                    }`}
                                >
                                    {link.label}
                                </a>
                            ))}

                            {/* 4. Contact Us Popup Trigger (Minimalist text link without icon) */}
                            <button
                                type="button"
                                onClick={() => setShowContactModal(true)}
                                className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                    isScrolled
                                        ? 'hover:bg-slate-100 hover:text-slate-900'
                                        : 'hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {lang === 'sw' ? 'Wasiliana Nasi' : 'Contact Us'}
                            </button>
                        </nav>

                        {/* Subtle Minimal Divider between Nav and Utility Controls */}
                        <div className={`hidden lg:block h-4 w-px mx-1 ${isScrolled ? 'bg-slate-200' : 'bg-white/20'}`} />

                        {/* Right-Side Controls: Contact (Mobile), Language Toggle & Auth */}
                        <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-semibold shrink-0">
                            {/* Mobile Quick Contact Button */}
                            <button
                                type="button"
                                onClick={() => setShowContactModal(true)}
                                className={`lg:hidden flex items-center gap-1 px-2.5 py-2 rounded-xl transition-colors text-xs font-semibold cursor-pointer ${
                                    isScrolled 
                                        ? 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/80' 
                                        : 'text-white/95 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20'
                                }`}
                                title={lang === 'sw' ? 'Wasiliana Nasi' : 'Contact Us'}
                                aria-label="Contact Us"
                            >
                                <MessageCircle className="w-4 h-4 text-emerald-400" />
                                <span className="hidden xs:inline">{lang === 'sw' ? 'Msaada' : 'Contact'}</span>
                            </button>

                            {/* Language Toggle */}
                            <button 
                                type="button"
                                onClick={() => setLang(lang === 'en' ? 'sw' : 'en')} 
                                className={`flex items-center gap-1.5 px-2.5 py-2 transition-colors text-xs sm:text-sm font-semibold cursor-pointer ${
                                    isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-white/90 hover:text-white'
                                }`}
                                title={lang === 'en' ? 'Badili lugha kuwa Kiswahili' : 'Switch language to English'}
                            >
                                <Globe className={`w-4 h-4 ${isScrolled ? 'text-[#154F7C]' : 'text-sky-300'}`} />
                                <span>{lang === 'en' ? 'SWA' : 'ENG'}</span>
                            </button>
                            
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs sm:text-sm font-bold transition shadow-md shadow-[#154F7C]/25 border border-sky-400/25 active:scale-95"
                                >
                                    <span>{t("Go to Dashboard")}</span>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2 sm:gap-2.5">
                                    <button
                                        onClick={() => openAuthModal('login')}
                                        className={`px-4 py-2 sm:py-2.5 rounded-xl font-bold transition text-xs sm:text-sm cursor-pointer active:scale-95 ${
                                            isScrolled
                                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 shadow-2xs'
                                                : 'bg-white/[0.1] hover:bg-white/[0.18] text-white backdrop-blur-md border border-white/25'
                                        }`}
                                    >
                                        {t("Log In")}
                                    </button>
                                    <button
                                        onClick={() => openAuthModal('register')}
                                        className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs sm:text-sm font-bold transition shadow-md shadow-[#154F7C]/25 border border-sky-400/25 cursor-pointer active:scale-95"
                                    >
                                        <span>{t("Start Now")}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section (Fills Initial Viewport with Anchored Metrics - Zero White Space) */}
                {/* Hero Section (Clean, Minimalist, High-Tech Event & Invitation Canvas) */}
                {/* Hero Section — Modern Asymmetric Two-Column Conference/Event Layout */}
                <section id="hero" className="min-h-screen min-h-[100dvh] pt-20 bg-[#0B2545] text-white relative overflow-hidden flex flex-col justify-between select-none">
                    {/* Full Hero Background Image with darker shade of blue overlay and smooth reveal transition */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#0B2545] hero-backdrop-reveal">
                        <img
                            src="/images/hero-art.jpg"
                            alt="Digital event passes, invitations and ticketing background"
                            className="w-full h-full object-cover object-center"
                        />
                        {/* Rich darker shade of blue overlay enhancing depth and text clarity */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0B2545]/85 via-[#0E355F]/70 to-[#0B2545]/90" />
                        <div className="absolute inset-0 bg-[#07192F]/30 pointer-events-none" />

                        {/* Mobile Soft Ambient Atmospheric Glows (No harsh wireframe rings over text) */}
                        <div className="sm:hidden absolute -top-8 -right-8 w-64 h-64 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
                        <div className="sm:hidden absolute top-1/3 -left-12 w-60 h-60 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Aesthetic Floating Geometric & Glass Elements for Tablet & Desktop screens */}
                        <div className="hidden sm:block hero-float-1 absolute top-[20%] left-[22%] w-28 h-28 sm:w-44 sm:h-44 rounded-full border border-white/20 bg-transparent shadow-xl pointer-events-none" />
                        <div className="hidden sm:block hero-float-2 absolute bottom-[26%] left-[6%] w-16 h-16 sm:w-24 sm:h-24 rounded-full border border-white/20 bg-transparent pointer-events-none" />
                        <div className="hidden sm:block hero-float-3 absolute top-[14%] right-[10%] w-32 h-32 sm:w-48 sm:h-48 rounded-full border-2 border-sky-300/20 bg-sky-400/[0.03] backdrop-blur-xs pointer-events-none" />
                        
                        {/* Additional Floating Moving Circles for Richer Atmosphere (Desktop/Tablet) */}
                        <div className="hidden sm:block hero-float-4 absolute top-[8%] left-[10%] w-20 h-20 sm:w-28 sm:h-28 rounded-full border border-white/20 bg-transparent pointer-events-none" />
                        <div className="hidden sm:block hero-float-5 absolute top-[38%] left-[2%] w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-cyan-400/25 to-blue-500/15 border border-cyan-300/30 backdrop-blur-xs pointer-events-none" />
                        <div className="hidden sm:block hero-float-6 absolute bottom-[18%] left-[30%] w-20 h-20 sm:w-32 sm:h-32 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-md shadow-lg pointer-events-none" />
                        <div className="hidden sm:block hero-float-1 absolute top-[5%] right-[28%] w-14 h-14 sm:w-20 sm:h-20 rounded-full border border-sky-200/25 bg-sky-300/[0.06] backdrop-blur-xs pointer-events-none" />
                        <div className="hidden sm:block hero-float-2 absolute bottom-[12%] right-[5%] w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-indigo-500/20 via-sky-500/15 to-transparent border border-white/20 backdrop-blur-sm shadow-xl pointer-events-none" />
                        <div className="hidden sm:block hero-float-4 absolute top-[45%] right-[22%] w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-emerald-300/25 bg-emerald-400/[0.08] backdrop-blur-xs pointer-events-none" />
                        <div className="hidden sm:block hero-float-5 absolute bottom-[35%] right-[38%] w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-sky-400/20 border border-sky-300/40 pointer-events-none shadow-md" />

                        {/* Modern Decorative Dot Matrix Grids (Desktop/Tablet) */}
                        <div className="hidden sm:grid absolute top-20 left-8 sm:left-14 w-28 h-28 grid-cols-6 gap-2 opacity-25 pointer-events-none">
                            {Array.from({ length: 36 }).map((_, i) => (
                                <span key={i} className="w-1 h-1 rounded-full bg-white/70" />
                            ))}
                        </div>
                        <div className="hidden sm:grid absolute bottom-28 right-8 sm:right-14 w-28 h-28 grid-cols-6 gap-2 opacity-20 pointer-events-none">
                            {Array.from({ length: 36 }).map((_, i) => (
                                <span key={i} className="w-1 h-1 rounded-full bg-white/70" />
                            ))}
                        </div>
                    </div>

                    {/* Main Two-Column Hero Content */}
                    <div className="flex-1 flex items-center relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-10 lg:py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center w-full">
                            
                            {/* Left Column: Bold Headline, Subtitle, and Pill CTAs */}
                            <div className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left pt-1 sm:pt-2 lg:pt-0">
                                {/* Main Headline */}
                                <h1 className="animate-hero-headline text-[1.85rem] xs:text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black font-display tracking-tight text-white leading-[1.12] sm:leading-[1.08] mb-3 sm:mb-5 max-w-2xl mx-auto lg:mx-0">
                                    {lang === 'sw' ? (
                                        <>
                                            <span>Mialiko ya Kidigitali,</span>
                                            <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-300">
                                                Tiketi & Upigaji Kura
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Digital Invitations,</span>
                                            <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-300">
                                                Ticketing & Voting
                                            </span>
                                        </>
                                    )}
                                </h1>

                                {/* Subtitle copy */}
                                <p className="text-xs xs:text-sm sm:text-base md:text-lg text-slate-300/90 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 mb-5 sm:mb-8">
                                    {lang === 'sw' 
                                        ? 'Mfumo wa kisasa wa kutuma mialiko ya kidigitali yenye majibu ya papo hapo (RSVP) na udhibiti wa wageni mlangoni, pamoja na huduma za tiketi za matukio na upigaji kura mtandaoni.'
                                        : 'A modern, unified platform to send elegant digital invitations with real-time RSVPs and seamless door access, complete with online event ticketing and live award voting.'
                                    }
                                </p>

                                {/* Action Buttons matching layout aesthetic */}
                                <div className="animate-hero-cta flex flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-4 w-full sm:w-auto">
                                    <Link
                                        href={route('tickets.marketplace')}
                                        className="group flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 active:scale-[0.98] text-white text-xs xs:text-sm sm:text-base font-bold shadow-xl shadow-[#154F7C]/30 hover:shadow-[#154F7C]/50 transition-all duration-300 cursor-pointer whitespace-nowrap"
                                    >
                                        <Ticket className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                                        <span>{lang === 'sw' ? 'Kununua Tiketi' : 'Browse Tickets'}</span>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => openAuthModal('register')}
                                        className="group flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white/[0.1] hover:bg-white/[0.18] active:scale-[0.98] border border-white/25 hover:border-white/40 text-white text-xs xs:text-sm sm:text-base font-bold backdrop-blur-xl transition-all duration-300 cursor-pointer whitespace-nowrap"
                                    >
                                        <Plus className="w-4 h-4 text-sky-400 group-hover:rotate-90 transition-transform duration-300" />
                                        <span>{lang === 'sw' ? 'Tengeneza Mwaliko' : 'Create Invitation'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Right Column: Cascading 3 Asymmetrical Rounded Image Cards (Spacious Breathing Room) */}
                            <div className="lg:col-span-5 relative flex justify-center lg:justify-end items-center mt-6 lg:mt-0">
                                <div className="relative w-full max-w-[340px] xs:max-w-[390px] sm:max-w-[460px] lg:max-w-[500px] h-[300px] xs:h-[350px] sm:h-[440px] lg:h-[470px]">
                                    
                                    {/* Back Card 1 (Top Left): Live Event Crowd & Presentation */}
                                    <div className="hero-card-anim-1 absolute top-0 left-0 w-[50%] sm:w-[52%] h-[50%] sm:h-[52%] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 transform -rotate-3 hover:rotate-0 transition-transform duration-500 z-10 group">
                                        <img 
                                            src="/images/categories/events.jpg" 
                                            alt="Events and Conferences" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                                    </div>

                                    {/* Card 2 (Top Right): Safari & Adventure Showcase */}
                                    <div className="hero-card-anim-2 absolute top-2 right-0 w-[48%] sm:w-[50%] h-[52%] sm:h-[54%] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 transform rotate-3 hover:rotate-0 transition-transform duration-500 z-20 group">
                                        <img 
                                            src="/images/hero_safari_adventure.jpg" 
                                            alt="Serengeti Sunset Safari Adventure" 
                                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                                    </div>

                                    {/* Front Card 3 (Center Lower Front): Fashion & Runway Shows */}
                                    <div className="hero-card-anim-3 absolute bottom-0 left-[16%] sm:left-[18%] w-[66%] sm:w-[68%] h-[58%] sm:h-[60%] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/70 border border-white/15 transform hover:scale-[1.02] transition-transform duration-500 z-30 group">
                                        <img 
                                            src="/images/categories/fashion.jpg" 
                                            alt="Fashion and Runway Shows" 
                                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Floating Stats Pill Card (Clean Frosted Translucent Glass Aesthetic) */}
                    <div className="w-full relative z-20 pb-4 sm:pb-6 px-3 sm:px-6 lg:px-8 hero-stats-anim">
                        <div className="max-w-5xl mx-auto bg-white/[0.12] backdrop-blur-2xl rounded-2xl sm:rounded-[2.25rem] border border-white/25 shadow-2xl shadow-black/40 px-3 sm:px-8 py-3.5 sm:py-5 flex items-center justify-between gap-4">
                            
                            {/* 4 Key Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 w-full divide-x divide-white/15">
                                <div className="text-center px-2">
                                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 tracking-tight drop-shadow-sm">
                                        <AnimatedCounter end={10} suffix="K+" />
                                    </h3>
                                    <p className="text-[10px] sm:text-xs font-bold text-slate-200/90 mt-0.5 uppercase tracking-wider">{t("Mialiko Iliyotumwa")}</p>
                                </div>
                                <div className="text-center px-2">
                                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 tracking-tight drop-shadow-sm">
                                        <AnimatedCounter end={99.9} decimals={1} suffix="%" />
                                    </h3>
                                    <p className="text-[10px] sm:text-xs font-bold text-slate-200/90 mt-0.5 uppercase tracking-wider">{t("Uhakika wa Kufika")}</p>
                                </div>
                                <div className="text-center px-2">
                                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 tracking-tight drop-shadow-sm">
                                        <AnimatedCounter end={24} suffix="/7" />
                                    </h3>
                                    <p className="text-[10px] sm:text-xs font-bold text-slate-200/90 mt-0.5 uppercase tracking-wider">{t("Huduma kwa Wateja")}</p>
                                </div>
                                <div className="text-center px-2">
                                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 tracking-tight drop-shadow-sm">
                                        <AnimatedCounter end={100} suffix="%" />
                                    </h3>
                                    <p className="text-[10px] sm:text-xs font-bold text-slate-200/90 mt-0.5 uppercase tracking-wider">{lang === 'sw' ? 'Tiketi za Kidigitali' : 'Instant E-Tickets'}</p>
                                </div>
                            </div>

                            {/* Floating Next-Section Arrow */}
                            <a
                                href="#invitations"
                                onClick={(e) => scrollToSection(e, 'invitations')}
                                title="Scroll down"
                                className="hidden sm:flex w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] active:scale-95 text-white items-center justify-center shrink-0 shadow-lg shadow-[#154F7C]/30 border border-sky-400/30 transition-all cursor-pointer"
                            >
                                <ArrowRight className="w-4 h-4 rotate-90" />
                            </a>
                        </div>
                    </div>
                </section>

                {/* Features & Invitations Section — Neumorphic Infographic Circles Style */}
                <section id="invitations" className="min-h-[calc(100vh-5rem)] flex flex-col justify-center py-12 sm:py-20 bg-[#F0F2F5] relative scroll-mt-20 overflow-hidden">
                    {/* Keyframes & Transition Styles */}
                    <style dangerouslySetInnerHTML={{__html: `
                        @keyframes neuDiscPopIn {
                            0% {
                                opacity: 0;
                                transform: scale(0.85) translateY(24px);
                            }
                            60% {
                                opacity: 1;
                                transform: scale(1.02) translateY(-4px);
                            }
                            100% {
                                opacity: 1;
                                transform: scale(1) translateY(0);
                            }
                        }
                        @keyframes neuArcDraw {
                            0% {
                                stroke-dashoffset: 300;
                            }
                            100% {
                                stroke-dashoffset: 0;
                            }
                        }
                        @keyframes neuDotFade {
                            0% {
                                opacity: 0;
                                transform: scale(0);
                            }
                            70% {
                                opacity: 1;
                                transform: scale(1.3);
                            }
                            100% {
                                opacity: 1;
                                transform: scale(1);
                            }
                        }
                        @keyframes neuIconGlow {
                            0%, 100% {
                                transform: translateY(0px) scale(1);
                            }
                            50% {
                                transform: translateY(-3px) scale(1.08);
                            }
                        }
                        .is-visible .neu-card-anim {
                            animation: neuDiscPopIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
                        }
                        .is-visible .neu-arc-path {
                            stroke-dasharray: 300;
                            stroke-dashoffset: 300;
                            animation: neuArcDraw 1.1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                        }
                        .is-visible .neu-dot-anim {
                            animation: neuDotFade 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                        }
                        .neu-icon-pulse {
                            animation: neuIconGlow 4s ease-in-out infinite;
                        }
                    `}} />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        {/* Section Header */}
                        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 scroll-animate">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 mb-2 sm:mb-3 font-display pb-1 tracking-tight">
                                {t("All-in-One Event Toolkit")}
                            </h2>
                            <p className="text-base sm:text-lg text-slate-500 font-medium">
                                {t("Kila kitu unachokihitaji kurahisisha usimamizi wa sherehe yako kuanzia maandalizi hadi siku ya tukio yenyewe.")}
                            </p>
                        </div>

                        {/* 6 Neumorphic Circular Infographic Elements: 3 Top and 3 Bottom */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12 lg:gap-10 justify-items-center items-center">
                            {[
                                {
                                    title: t("Kadi za Kidigitali"),
                                    desc: t("Tengeneza kadi zenye muonekano wa kisasa. Jumuisha namba ya kiti, ramani, na QR Code kwa ajili ya mlangoni."),
                                    icon: Smartphone,
                                    gradientId: "neugrad1",
                                    startColor: "#06B6D4", // Cyan
                                    endColor: "#8B5CF6",   // Violet / Purple
                                    arcPosition: "top",    // arc across top
                                },
                                {
                                    title: t("WhatsApp & SMS"),
                                    desc: t("Watumie wageni wako kadi zao moja kwa moja kwenye namba zao za simu kwa uharaka na uhakika mkubwa."),
                                    icon: MessageCircle,
                                    gradientId: "neugrad2",
                                    startColor: "#0284C7", // Sky Blue
                                    endColor: "#A855F7",   // Purple
                                    arcPosition: "bottom", // arc across bottom
                                },
                                {
                                    title: t("Usimamizi wa Michango"),
                                    desc: t("Dhibiti ahadi na michango kwa urahisi. Tuma jumbe za kukumbusha wageni kuhusu ahadi zao kiotomatiki."),
                                    icon: HandCoins,
                                    gradientId: "neugrad3",
                                    startColor: "#00BAF2", // Bright Cyan
                                    endColor: "#6366F1",   // Indigo
                                    arcPosition: "top",    // arc across top
                                },
                                {
                                    title: t("Majibu ya Wageni (RSVP)"),
                                    desc: t("Pata majibu ya uhakika (RSVP) moja kwa moja kwenye mfumo wakati wageni wanapothibitisha ushiriki wao."),
                                    icon: Users,
                                    gradientId: "neugrad4",
                                    startColor: "#10B981", // Emerald
                                    endColor: "#06B6D4",   // Cyan / Teal
                                    arcPosition: "bottom", // arc across bottom
                                },
                                {
                                    title: t("Kuscan QR Mlangoni"),
                                    desc: t("Ondoa kero ya watu wasioalikwa. Tumia simu kuscan QR Code mlangoni na kuhakiki taarifa za mgeni sekunde chache tu."),
                                    icon: QrCode,
                                    gradientId: "neugrad5",
                                    startColor: "#3B82F6", // Royal Blue
                                    endColor: "#8B5CF6",   // Violet
                                    arcPosition: "top",    // arc across top
                                },
                                {
                                    title: t("Ripoti za Moja kwa Moja"),
                                    desc: t("Fuatilia kwa ukaribu idadi ya mialiko iliyofika, majibu ya RSVP, na wageni waliokwisha ingia ukumbini."),
                                    icon: ChartPie,
                                    gradientId: "neugrad6",
                                    startColor: "#14B8A6", // Teal
                                    endColor: "#3B82F6",   // Blue
                                    arcPosition: "bottom", // arc across bottom
                                }
                            ].map((item, idx) => {
                                const cardDelay = `${(idx % 3) * 150 + Math.floor(idx / 3) * 200}ms`;
                                const arcDelay = `${(idx % 3) * 150 + Math.floor(idx / 3) * 200 + 350}ms`;
                                const dotDelay = `${(idx % 3) * 150 + Math.floor(idx / 3) * 200 + 800}ms`;

                                return (
                                    <div 
                                        key={idx} 
                                        className="group relative flex flex-col items-center justify-center w-full max-w-[340px] sm:max-w-[360px] aspect-square rounded-full p-4 scroll-animate neu-card-anim transition-transform duration-500 hover:scale-[1.03]"
                                        style={{ animationDelay: cardDelay }}
                                    >
                                        {/* Neumorphic Outer Raised Ring Foundation */}
                                        <div 
                                            className="absolute inset-0 rounded-full bg-[#F0F2F5] transition-all duration-300"
                                            style={{
                                                boxShadow: `
                                                    16px 16px 36px rgba(166, 178, 196, 0.45),
                                                    -16px -16px 36px rgba(255, 255, 255, 0.95),
                                                    inset 1px 1px 2px rgba(255, 255, 255, 0.8),
                                                    inset -1px -1px 2px rgba(166, 178, 196, 0.25)
                                                `
                                            }}
                                        />

                                        {/* SVG Orbital Track & Vibrantly Colored Arc with Terminal Pin Dots */}
                                        <div className="absolute inset-0 pointer-events-none p-2 sm:p-2.5">
                                            <svg 
                                                className="w-full h-full" 
                                                viewBox="0 0 340 340" 
                                                fill="none"
                                            >
                                                <defs>
                                                    <linearGradient id={item.gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor={item.startColor} />
                                                        <stop offset="100%" stopColor={item.endColor} />
                                                    </linearGradient>
                                                </defs>

                                                {/* Full 360-degree Fine Grey Guide Orbit (Radius 145, Center 170,170) */}
                                                <circle 
                                                    cx="170" 
                                                    cy="170" 
                                                    r="145" 
                                                    stroke="#D5DCE5" 
                                                    strokeWidth="1.6" 
                                                />

                                                {/* Colored Gradient Arc Segment with Rounded Ends */}
                                                {item.arcPosition === "top" ? (
                                                    // Arc across the top perimeter
                                                    <g>
                                                        <path 
                                                            d="M 51 90 A 145 145 0 0 1 289 90" 
                                                            stroke={`url(#${item.gradientId})`} 
                                                            strokeWidth="5.5" 
                                                            strokeLinecap="round" 
                                                            className="neu-arc-path"
                                                            style={{ animationDelay: arcDelay }}
                                                        />
                                                        {/* Terminal anchor dots on the track */}
                                                        <circle cx="51" cy="90" r="3" fill="#64748B" className="neu-dot-anim opacity-0" style={{ transformOrigin: '51px 90px', animationDelay: dotDelay }} />
                                                        <circle cx="289" cy="90" r="3" fill="#64748B" className="neu-dot-anim opacity-0" style={{ transformOrigin: '289px 90px', animationDelay: dotDelay }} />
                                                    </g>
                                                ) : (
                                                    // Arc across the bottom perimeter
                                                    <g>
                                                        <path 
                                                            d="M 51 250 A 145 145 0 0 0 289 250" 
                                                            stroke={`url(#${item.gradientId})`} 
                                                            strokeWidth="5.5" 
                                                            strokeLinecap="round" 
                                                            className="neu-arc-path"
                                                            style={{ animationDelay: arcDelay }}
                                                        />
                                                        {/* Terminal anchor dots on the track */}
                                                        <circle cx="51" cy="250" r="3" fill="#64748B" className="neu-dot-anim opacity-0" style={{ transformOrigin: '51px 250px', animationDelay: dotDelay }} />
                                                        <circle cx="289" cy="250" r="3" fill="#64748B" className="neu-dot-anim opacity-0" style={{ transformOrigin: '289px 250px', animationDelay: dotDelay }} />
                                                    </g>
                                                )}
                                            </svg>
                                        </div>

                                        {/* Neumorphic Recessed / Inner Well Center Disk */}
                                        <div 
                                            className="relative z-10 w-[80%] h-[80%] rounded-full bg-[#F0F2F5] flex flex-col items-center justify-center text-center p-6 sm:p-7 transition-all duration-300"
                                            style={{
                                                boxShadow: `
                                                    inset 6px 6px 14px rgba(166, 178, 196, 0.4),
                                                    inset -6px -6px 14px rgba(255, 255, 255, 0.95),
                                                    0 2px 8px rgba(0,0,0,0.02)
                                                `
                                            }}
                                        >
                                            {/* Feature Title */}
                                            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-2 font-display">
                                                {item.title}
                                            </h3>

                                            {/* Feature Description */}
                                            <p className="text-[10px] sm:text-[11.5px] text-slate-500 leading-relaxed font-normal max-w-[210px] line-clamp-3 mb-3">
                                                {item.desc}
                                            </p>

                                            {/* Minimalist Tech Gradient Icon at bottom center */}
                                            <div 
                                                className="flex items-center justify-center transition-transform duration-300 group-hover:scale-125 neu-icon-pulse"
                                                style={{ color: item.startColor }}
                                            >
                                                <item.icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2]" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS — CURVED WAVE INFOGRAPHIC STYLE */}
                <section id="how-it-works" className="min-h-[calc(100vh-5rem)] flex flex-col justify-center py-8 sm:py-12 bg-[#F0F2F5] relative scroll-mt-20 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col justify-center">
                        {/* Section Header */}
                        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 scroll-animate">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 mb-2 sm:mb-3 font-display pb-1 tracking-tight">
                                {t("Jinsi Inavyofanya Kazi")}
                            </h2>
                            <p className="text-base sm:text-lg text-slate-500 font-medium">
                                {t("Hatua tano tu zinazokutenganisha wewe na usimamizi bora wa tukio lako kidigitali.")}
                            </p>
                        </div>

                        {/* Infographic Wave & Steps Container */}
                        <div className="relative w-full py-6">
                            <style dangerouslySetInnerHTML={{__html: `
                                @keyframes ribbonDrawStep0 {
                                    0% { stroke-dashoffset: 480; }
                                    100% { stroke-dashoffset: 0; }
                                }
                                @keyframes ribbonDrawStep1 {
                                    0% { stroke-dashoffset: 320; }
                                    100% { stroke-dashoffset: 0; }
                                }
                                @keyframes ribbonDrawStep2 {
                                    0% { stroke-dashoffset: 320; }
                                    100% { stroke-dashoffset: 0; }
                                }
                                @keyframes ribbonDrawStep3 {
                                    0% { stroke-dashoffset: 320; }
                                    100% { stroke-dashoffset: 0; }
                                }
                                @keyframes ribbonDrawStep4 {
                                    0% { stroke-dashoffset: 300; }
                                    100% { stroke-dashoffset: 0; }
                                }
                                @keyframes arrowHeadPop {
                                    0% { transform: scale(0) rotate(-15deg); opacity: 0; }
                                    60% { transform: scale(1.2) rotate(3deg); opacity: 1; }
                                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                                }
                                .is-visible .ribbon-anim-0 {
                                    stroke-dasharray: 480;
                                    animation: ribbonDrawStep0 0.85s cubic-bezier(0.25, 1, 0.5, 1) forwards 0.2s;
                                }
                                .is-visible .ribbon-anim-1 {
                                    stroke-dasharray: 320;
                                    animation: ribbonDrawStep1 0.75s cubic-bezier(0.25, 1, 0.5, 1) forwards 0.95s;
                                }
                                .is-visible .ribbon-anim-2 {
                                    stroke-dasharray: 320;
                                    animation: ribbonDrawStep2 0.75s cubic-bezier(0.25, 1, 0.5, 1) forwards 1.6s;
                                }
                                .is-visible .ribbon-anim-3 {
                                    stroke-dasharray: 320;
                                    animation: ribbonDrawStep3 0.75s cubic-bezier(0.25, 1, 0.5, 1) forwards 2.25s;
                                }
                                .is-visible .ribbon-anim-4 {
                                    stroke-dasharray: 300;
                                    animation: ribbonDrawStep4 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards 2.9s;
                                }
                                .is-visible .arrowhead-anim {
                                    transform-origin: 5px 8px;
                                    animation: arrowHeadPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 3.6s;
                                }
                            `}} />

                            {/* 5 Circular Discs & Labels Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-0 relative z-10 w-full items-start">
                                {[
                                    {
                                        stepNum: "01",
                                        title: t("Sajili Tukio Lako"),
                                        desc: t("Tengeneza akaunti na uchague muonekano wa kadi yako ya kidigitali katika mfumo."),
                                        icon: CalendarPlus,
                                    },
                                    {
                                        stepNum: "02",
                                        title: t("Fanya Malipo"),
                                        desc: t("Nunua kifurushi kufungua huduma zote muhimu na kuendelea na maandalizi."),
                                        icon: CreditCard,
                                    },
                                    {
                                        stepNum: "03",
                                        title: t("Tuma Mialiko"),
                                        desc: t("Weka majina ya wageni wako kisha watumie mialiko yao moja kwa moja kwa WhatsApp au SMS."),
                                        icon: Send,
                                    },
                                    {
                                        stepNum: "04",
                                        title: t("Scan QR Mlangoni"),
                                        desc: t("Siku ya tukio, scan QR code kwenye kadi zao mlangoni kuruhusu walioalikwa tu kuingia."),
                                        icon: QrCode,
                                    },
                                    {
                                        stepNum: "05",
                                        title: t("Pokea Majibu"),
                                        desc: t("Wageni watafungua kadi zao na kuthibitisha (RSVP) mtandaoni kama watahudhuria au la."),
                                        icon: UserCheck,
                                    }
                                ].map((step, idx) => {
                                    // Kardovo brand palette gradient: Emerald Green (#117534) -> Teal (#0D9488) -> Light Blue (#008EE8) -> Dark Blue (#1144A0) -> Deep Navy (#111E2E)
                                    const ribbonColors = ['#117534', '#0D9488', '#008EE8', '#1144A0', '#1E3A8A', '#111E2E'];
                                    const orbitPaths = [
                                        { solid: 'M 100 200 A 100 100 0 1 1 200 100', dashed: 'M 200 100 A 100 100 0 0 1 100 200', defaultOffset: 480 },
                                        { solid: 'M 0 100 A 100 100 0 0 0 200 100', dashed: 'M 0 100 A 100 100 0 0 1 200 100', defaultOffset: 320 },
                                        { solid: 'M 0 100 A 100 100 0 0 1 200 100', dashed: 'M 0 100 A 100 100 0 0 0 200 100', defaultOffset: 320 },
                                        { solid: 'M 0 100 A 100 100 0 0 0 200 100', dashed: 'M 0 100 A 100 100 0 0 1 200 100', defaultOffset: 320 },
                                        { solid: 'M 0 100 A 100 100 0 0 1 142 9', dashed: 'M 160 20 A 100 100 0 1 1 0 100', defaultOffset: 300 },
                                    ];
                                    const isLastStep = idx === orbitPaths.length - 1;
                                    const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500'];

                                    return (
                                    <div key={idx} className={`flex flex-col items-center text-center group relative scroll-animate ${delays[idx]}`}>
                                        {/* Square orbit area: orbit radius = half column width, so neighbouring orbits touch */}
                                        <div className="relative w-full flex items-center justify-center mb-6 lg:mb-4 lg:aspect-square">
                                            <svg
                                                className="hidden lg:block absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0"
                                                viewBox="0 0 200 200"
                                                fill="none"
                                            >
                                                <defs>
                                                    <linearGradient id={`howItWorksRibbon-${idx}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="0">
                                                        <stop offset="0%" stopColor={ribbonColors[idx]} />
                                                        <stop offset="100%" stopColor={ribbonColors[idx + 1]} />
                                                    </linearGradient>
                                                    {isLastStep && (
                                                        <marker id="howItWorksArrow" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" refX="5" refY="8" orient="auto">
                                                            <polygon points="0 0, 16 8, 0 16" fill={ribbonColors[idx + 1]} className="arrowhead-anim opacity-0" />
                                                        </marker>
                                                    )}
                                                </defs>
                                                <path d={orbitPaths[idx].dashed} stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="5 5" className="opacity-60 transition-opacity duration-700" />
                                                <path
                                                    d={orbitPaths[idx].solid}
                                                    stroke={`url(#howItWorksRibbon-${idx})`}
                                                    strokeWidth="3.5"
                                                    strokeLinecap={isLastStep ? 'butt' : 'round'}
                                                    className={`ribbon-anim-${idx}`}
                                                    style={{ strokeDashoffset: orbitPaths[idx].defaultOffset }}
                                                    markerEnd={isLastStep ? 'url(#howItWorksArrow)' : undefined}
                                                />
                                            </svg>

                                            {/* Circular Disc */}
                                            <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-[62%] lg:h-auto lg:aspect-square rounded-full bg-white shadow-[0_18px_40px_rgba(0,0,0,0.10),0_4px_12px_rgba(0,0,0,0.04)] flex items-center justify-center transition-all duration-500 hover:scale-105 group-hover:shadow-[0_22px_45px_rgba(0,0,0,0.14)] relative z-10">
                                                <step.icon className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 text-slate-800 stroke-[1.6] group-hover:scale-110 transition-transform duration-300" />
                                            </div>
                                        </div>

                                        {/* Text Section Below */}
                                        <div className="px-2 max-w-[240px]">
                                            {/* Step Number in Kardovo Brand Color */}
                                            <span 
                                                className="block text-sm sm:text-base font-black uppercase font-mono tracking-wider mb-1.5 transition-transform duration-300 group-hover:-translate-y-0.5"
                                                style={{ color: ribbonColors[idx] }}
                                            >
                                                {step.stepNum}
                                            </span>

                                            {/* Title */}
                                            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-2">
                                                {step.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* PRICING */}
                <section id="payment" className="min-h-[calc(100vh-5rem)] flex flex-col justify-center py-6 sm:py-8 bg-[#F0F2F5] relative scroll-mt-20">
                    <div className="max-w-7xl mx-auto px-6 w-full">
                        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 scroll-animate">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 mb-2 sm:mb-3 font-display pb-1">{t("Bei Zetu ni Nafuu")}</h2>
                            <p className="text-base sm:text-lg text-slate-500">{t("Chagua kifurushi kinachoendana na mahitaji ya ukubwa wa tukio lako.")}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
                            {/* Basic */}
                            <div className="bg-white rounded-[2rem] p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow flex flex-col h-full">
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Basic</h4>
                                <div className="mb-6 flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-900">1,000</span>
                                    <span className="text-slate-500 font-semibold">{t("Tsh/kadi")}</span>
                                </div>
                                <ul className="space-y-4 text-sm text-slate-600 font-medium mb-8 ">
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-kardovo-blue-light flex-shrink-0" /> {t("Kadi za kidigitali zenye QR")}</li>
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-kardovo-blue-light flex-shrink-0" /> {t("Kutuma WhatsApp & SMS")}</li>
                                    <li className="flex items-start gap-3 text-slate-500 text-xs mt-2 bg-slate-50 p-3 rounded-xl"><span className="font-bold text-slate-700">{t("Kumbuka:")}</span> {t("Utalipia Tsh 35,000 ya Scanner siku ya tukio au upewe App bure ujiscanie.")}</li>
                                </ul>
                                <button onClick={() => openAuthModal('register')} className="block w-full mt-auto py-3.5 text-center rounded-xl bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 transition-colors cursor-pointer">
                                    {t("Chagua Kifurushi")}
                                </button>
                            </div>

                            {/* Standard (Featured) */}
                            <div className="bg-[#0B2545] rounded-[2.5rem] p-8 border border-[#173860] shadow-2xl scroll-animate transform lg:-translate-y-4 relative z-10 text-white flex flex-col h-full">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg border border-sky-400/40">
                                    {t("Pendekezo")}
                                </div>
                                <h4 className="text-sm font-black text-blue-300 uppercase tracking-widest mb-2">Standard</h4>
                                <div className="mb-6 flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white">1,500</span>
                                    <span className="text-blue-200 font-medium">{t("Tsh/kadi")}</span>
                                </div>
                                <ul className="space-y-4 text-sm text-blue-100 font-medium mb-8 ">
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" /> {t("Vipengele vyote vya Basic")}</li>
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" /> {t("Simu kuhakiki kadi kufika")}</li>
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" /> {t("Check-in scanner siku ya tukio (Min. kadi 200)")}</li>
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" /> {t("Ujumbe wa shukrani baadaye")}</li>
                                </ul>
                                <button onClick={() => openAuthModal('register')} className="block w-full mt-auto py-4 text-center rounded-xl bg-white text-[#0B2545] font-black hover:bg-slate-50 transition-colors shadow-lg cursor-pointer">
                                    {t("Chagua Kifurushi")}
                                </button>
                            </div>

                            {/* Premium */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow flex flex-col h-full">
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Premium</h4>
                                <div className="mb-6 flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-900">2,000</span>
                                    <span className="text-slate-500 font-semibold">{t("Tsh/kadi")}</span>
                                </div>
                                <ul className="space-y-4 text-sm text-slate-600 font-medium mb-8 ">
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-kardovo-blue-light flex-shrink-0" /> {t("Vipengele vyote vya Standard")}</li>
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-kardovo-blue-light flex-shrink-0" /> {t("Simu za uhakiki kwa wageni")}</li>
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-kardovo-blue-light flex-shrink-0" /> {t("Ujumbe kukumbusha michango")}</li>
                                </ul>
                                <button onClick={() => openAuthModal('register')} className="block w-full mt-auto py-3.5 text-center rounded-xl bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 transition-colors cursor-pointer">
                                    {t("Chagua Kifurushi")}
                                </button>
                            </div>

                            {/* Executive */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow flex flex-col h-full">
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Executive</h4>
                                <div className="mb-6 flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-900">2,500</span>
                                    <span className="text-slate-500 font-semibold">{t("Tsh/kadi")}</span>
                                </div>
                                <ul className="space-y-4 text-sm text-slate-600 font-medium mb-4">
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-kardovo-blue-light flex-shrink-0" /> {t("Vipengele vyote vya Premium")}</li>
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-kardovo-blue-light flex-shrink-0" /> {t("Minimum order: Kadi 200")}</li>
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-kardovo-blue-light flex-shrink-0" /> {t("Tovuti (Web Page) maalum kwa ajili ya tukio lako lote.")}</li>
                                </ul>
                                <a 
                                    href="/kj/A8L0001" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block bg-slate-50 hover:bg-slate-100/80 rounded-xl p-3 border border-slate-100 mb-4 text-center transition-colors cursor-pointer group"
                                >
                                    <p className="text-slate-500 text-sm font-medium mb-1">{t("Mfano:")}</p>
                                    <p className="text-[#0B2545] text-sm font-bold group-hover:text-emerald-700 transition-colors">
                                        kardovo.co.tz/kj/A8L0001
                                    </p>
                                </a>
                                <button onClick={() => openAuthModal('register')} className="block w-full mt-auto py-3.5 text-center rounded-xl bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 transition-colors cursor-pointer">
                                    {t("Chagua Kifurushi")}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Accepted Payments Section (Continuous Moving Faded Marquee) ── */}
                <section className="pt-4 sm:pt-6 pb-12 sm:pb-16 bg-[#F0F2F5] overflow-hidden">
                    <style dangerouslySetInnerHTML={{ __html: `
                        @keyframes paymentMarquee {
                            0% { transform: translate3d(0, 0, 0); }
                            100% { transform: translate3d(-50%, 0, 0); }
                        }
                        .payment-marquee-track {
                            animation: paymentMarquee 30s linear infinite;
                            will-change: transform;
                        }
                        @media (prefers-reduced-motion: reduce) {
                            .payment-marquee-track {
                                animation: none;
                                flex-wrap: wrap;
                                justify-content: center;
                            }
                        }
                    `}} />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-4 sm:mb-5 scroll-animate">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#154F7C] font-display tracking-tight">
                                {t("Accepted Payment Methods")}
                            </h3>
                        </div>

                        {/* Continuous 1-Row Moving Strip with Soft Fade & Edge Mask */}
                        <div className="relative w-full overflow-hidden py-3">
                            {/* Left & Right Seamless Edge Fade Gradients */}
                            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#F0F2F5] to-transparent z-10" />
                            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#F0F2F5] to-transparent z-10" />

                            <div className="flex w-max payment-marquee-track">
                                {[
                                    { label: 'm-pesa', sub: 'Vodacom', labelColor: '#E60000', subColor: '#64748b' },
                                    { label: 'Mixx', sub: 'by Yas', labelColor: '#1a237e', subColor: '#d97706', italic: true },
                                    { label: 'airtel', sub: 'Money', labelColor: '#E8001D', subColor: '#E8001D' },
                                    { label: 'halo', sub: 'Pesa', labelColor: '#F97316', subColor: '#64748b' },
                                    { label: 'Azam', sub: 'Pesa', labelColor: '#16a34a', subColor: '#64748b' },
                                    { label: 'VISA', sub: 'Debit / Credit', labelColor: '#1A1F71', subColor: '#64748b' },
                                    { label: 'Mastercard', sub: 'Debit / Credit', labelColor: '#EB001B', subColor: '#64748b' },
                                    { label: 'Amex', sub: 'American Exp.', labelColor: '#007BC1', subColor: '#64748b' },
                                    { label: 'UnionPay', sub: 'Union Pay', labelColor: '#D40000', subColor: '#64748b' },
                                    { label: 'Bank Transfer', sub: 'CRDB & NMB', labelColor: '#1a3a5c', subColor: '#64748b' },
                                    { label: 'QR Code', sub: 'Scan to pay', labelColor: '#1a1a2e', subColor: '#64748b' },
                                    { label: 'Lipia Link', sub: 'AzamPay Link', labelColor: '#16a34a', subColor: '#64748b' },
                                    // Duplicate 12 items for seamless infinite loop
                                    { label: 'm-pesa', sub: 'Vodacom', labelColor: '#E60000', subColor: '#64748b' },
                                    { label: 'Mixx', sub: 'by Yas', labelColor: '#1a237e', subColor: '#d97706', italic: true },
                                    { label: 'airtel', sub: 'Money', labelColor: '#E8001D', subColor: '#E8001D' },
                                    { label: 'halo', sub: 'Pesa', labelColor: '#F97316', subColor: '#64748b' },
                                    { label: 'Azam', sub: 'Pesa', labelColor: '#16a34a', subColor: '#64748b' },
                                    { label: 'VISA', sub: 'Debit / Credit', labelColor: '#1A1F71', subColor: '#64748b' },
                                    { label: 'Mastercard', sub: 'Debit / Credit', labelColor: '#EB001B', subColor: '#64748b' },
                                    { label: 'Amex', sub: 'American Exp.', labelColor: '#007BC1', subColor: '#64748b' },
                                    { label: 'UnionPay', sub: 'Union Pay', labelColor: '#D40000', subColor: '#64748b' },
                                    { label: 'Bank Transfer', sub: 'CRDB & NMB', labelColor: '#1a3a5c', subColor: '#64748b' },
                                    { label: 'QR Code', sub: 'Scan to pay', labelColor: '#1a1a2e', subColor: '#64748b' },
                                    { label: 'Lipia Link', sub: 'AzamPay Link', labelColor: '#16a34a', subColor: '#64748b' },
                                ].map((p, i) => (
                                    <div 
                                        key={i} 
                                        className="flex flex-col items-center justify-center text-center opacity-65 select-none px-6 sm:px-8 shrink-0"
                                    >
                                        <span 
                                            className="font-black text-sm sm:text-base leading-none tracking-tight whitespace-nowrap" 
                                            style={{ color: p.labelColor, fontStyle: p.italic ? 'italic' : 'normal' }}
                                        >
                                            {p.label}
                                        </span>
                                        <span 
                                            className="text-[9px] sm:text-[10px] font-extrabold leading-tight uppercase tracking-wider mt-1 text-slate-500 whitespace-nowrap" 
                                            style={{ color: p.subColor }}
                                        >
                                            {p.sub}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p className="text-center text-[11px] text-slate-400 mt-6 sm:mt-8 flex items-center justify-center gap-1.5 scroll-animate delay-200">
                            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            {t("All payments are processed securely through")} <strong className="text-slate-600 ml-1">AzamPay</strong> · 256-bit SSL Encryption
                        </p>
                    </div>
                </section>

                <FAQSection t={t} />
            </main>

            {/* Official Kardovo Footer */}
            <KardovoFooter lang={lang} onSectionClick={scrollToSection} />

            {/* Translucent Sign In / Sign Up Modal */}
            <Modal show={showLoginModal} onClose={() => setShowLoginModal(false)} maxWidth="lg" closeable={true} translucent={true}>
                <div className="relative">
                    <button 
                        onClick={() => setShowLoginModal(false)}
                        className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer border border-slate-200/80 shadow-2xs"
                        aria-label="Close modal"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
                        <Login asModal={true} initialMode={authModalMode} />
                    </div>
                </div>
            </Modal>

            {/* Contact Us Modal - Variety of Options (WhatsApp, Phone, Email, Socials) */}
            <Modal show={showContactModal} onClose={() => setShowContactModal(false)} maxWidth="md" closeable={true} translucent={true}>
                <div className="relative p-6 sm:p-8 bg-white dark:bg-[#0B2545] rounded-3xl text-slate-800 dark:text-white shadow-2xl">
                    {/* Close Button */}
                    <button 
                        type="button"
                        onClick={() => setShowContactModal(false)}
                        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer border border-slate-200/80 dark:border-white/15 shadow-2xs"
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Modal Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-100 dark:bg-[#154F7C]/40 text-[#154F7C] dark:text-sky-300 mb-3.5 shadow-sm border border-sky-200/60 dark:border-sky-400/20">
                            <MessageCircle className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">
                            {lang === 'sw' ? 'Wasiliana Nasi' : 'Contact Us'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300/90 mt-1 max-w-sm mx-auto">
                            {lang === 'sw' 
                                ? 'Tuko hapa kukusaidia saa 24/7 kuhusu tiketi za matukio, mialiko ya kidigitali na malipo.'
                                : 'We are here 24/7 to assist you with event tickets, invitations, check-ins, and payments.'}
                        </p>
                    </div>

                    {/* Variety of Contact Options */}
                    <div className="space-y-3">
                        {/* 1. WhatsApp Option (Fastest response) */}
                        <a
                            href="https://wa.me/255737672987?text=Habari%20Kardovo,%20nahitaji%20msaada%20kuhusu%20huduma%20zenu."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-4 rounded-2xl bg-emerald-50/70 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-500/30 transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                    <WhatsAppIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                                            {lang === 'sw' ? 'Msaada kupitia WhatsApp' : 'Chat on WhatsApp'}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-300">
                                            {lang === 'sw' ? 'Haraka Zaidi' : 'Fastest'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-300 font-mono mt-0.5">+255 737 672 987</p>
                                </div>
                            </div>
                            <div className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </a>

                        {/* 2. Direct Phone Call */}
                        <a
                            href="tel:+255737672987"
                            className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200/80 dark:border-white/10 transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {lang === 'sw' ? 'Piga Simu Moja kwa Moja' : 'Call Support Directly'}
                                    </span>
                                    <p className="text-xs text-slate-500 dark:text-slate-300 font-mono mt-0.5">+255 737 672 987</p>
                                </div>
                            </div>
                            <div className="text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </a>

                        {/* 3. Official Email */}
                        <a
                            href="mailto:support@kardovo.com?subject=Kardovo%20Inquiry%20/%20Support"
                            className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200/80 dark:border-white/10 transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-[#154F7C] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {lang === 'sw' ? 'Tuma Barua Pepe (Email)' : 'Official Email Support'}
                                    </span>
                                    <p className="text-xs text-slate-500 dark:text-slate-300 font-mono mt-0.5">support@kardovo.com</p>
                                </div>
                            </div>
                            <div className="text-slate-600 dark:text-slate-400 group-hover:translate-x-1 transition-transform">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </a>
                    </div>

                    {/* Social Media Follow Channels */}
                    <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold">{lang === 'sw' ? 'Mitandao ya Kijamii:' : 'Follow Us On:'}</span>
                        <div className="flex items-center gap-2.5">
                            <a
                                href="https://instagram.com/kardovo"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Instagram"
                                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-pink-50 hover:text-pink-600 dark:bg-white/10 dark:hover:bg-pink-500/20 dark:hover:text-pink-300 flex items-center justify-center text-slate-600 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
                            >
                                <InstagramIcon className="w-4 h-4" />
                            </a>
                            <a
                                href="https://facebook.com/kardovo"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Facebook"
                                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-white/10 dark:hover:bg-blue-500/20 dark:hover:text-blue-300 flex items-center justify-center text-slate-600 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
                            >
                                <FacebookIcon className="w-4 h-4" />
                            </a>
                            <a
                                href="https://wa.me/255737672987"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="WhatsApp"
                                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-white/10 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-300 flex items-center justify-center text-slate-600 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
                            >
                                <WhatsAppIcon className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </Modal>
        
            {/* S-Curve Paper Planes */}
            <div className="absolute top-0 left-0 text-blue-500/70 opacity-0" style={{ animation: 'plane-s-curve-1 25s ease-in-out infinite both' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg">
                    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                </svg>
            </div>
            <div className="absolute top-0 left-0 text-emerald-500/50 opacity-0" style={{ animation: 'plane-s-curve-2 30s ease-in-out infinite 10s both' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
                    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                </svg>
            </div>
            <CookieConsentBanner />
        </div>
    );
}
