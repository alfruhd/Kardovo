import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    CheckCircle2, Sparkles, Smartphone, QrCode, MessageCircle, 
    Users, BarChart3, Clock, ShieldCheck, ChevronLeft, ChevronRight, HandCoins, ChartPie, Globe,
    Send, Play, ArrowRight, Moon, Sun, ExternalLink, Ticket,
    Calendar, MapPin, Tag, Layers, Check, Zap, Building2, Plane, PartyPopper, Trophy, Plus, Briefcase, Crown, Gem, Heart, Eye,
    Download, Share2, CreditCard, ScanLine, CalendarPlus, UserCheck,
    Search, ClipboardCheck, BookOpen, BarChart2, Target
} from "lucide-react";
import Login from './Auth/Login';
import Modal from '@/Components/Modal';
import KardovoLogo from '@/Components/KardovoLogo';

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
        "en": "Digital Invitations & Official Ticketing Platform",
        "sw": "Kadi za Kidigitali & Mfumo Rasmi wa Tiketi Tanzania"
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
        "en": "Attendance Certainty",
        "sw": "Uhakika wa Kufika"
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
        <section id="faq" className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center py-12 sm:py-16 bg-white border-t border-slate-100 scroll-mt-14">
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
        document.body.classList.add('bg-[#8ABEE0]');
        return () => {
            document.body.classList.remove('bg-[#8ABEE0]');
        };
    }, []);

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('register');

    const openAuthModal = (mode) => {
        setAuthModalMode(mode);
        setShowLoginModal(true);
    };
    const [activeSection, setActiveSection] = React.useState('');

    // ── TOP NAVBAR TRANSPARENT ON TOP SECTION, SOLID NAVY ON TICKETING & BELOW ──
    const [isScrolled, setIsScrolled] = useState(false);
    const ticketCategories = [
        {
            key: 'events',
            img: '/images/categories/events.jpg',
            icon: Ticket,
            labelEn: 'Concerts & Festivals',
            labelSw: 'Matamasha ya Muziki',
            tagEn: 'Live Shows',
            tagSw: 'Muziki Moja kwa Moja',
        },
        {
            key: 'nightlife',
            img: '/images/categories/nightlife.jpg',
            icon: PartyPopper,
            labelEn: 'Nightlife & DJ Parties',
            labelSw: 'Maisha ya Usiku & Vilabu',
            tagEn: 'Clubs & Lounges',
            tagSw: 'Vilabu & Burudani',
        },
        {
            key: 'sports',
            img: '/images/categories/sports.jpg',
            position: 'center 20%',
            icon: Trophy,
            labelEn: 'Sports & Marathons',
            labelSw: 'Michezo & Marathoni',
            tagEn: 'Matches & Races',
            tagSw: 'Mechi & Mashindano',
        },
        {
            key: 'hotels',
            img: '/images/categories/hotels.jpg',
            icon: Building2,
            labelEn: 'Resorts & Stays',
            labelSw: 'Hoteli & Malazi',
            tagEn: 'Beach & Safari Lodges',
            tagSw: 'Loji & Fukwe za Kifahari',
        },
        {
            key: 'fashion',
            img: '/images/categories/fashion.jpg',
            position: 'center 28%',
            icon: Crown,
            labelEn: 'Fashion & Runway Shows',
            labelSw: 'Mitindo & Maonyesho',
            tagEn: 'Runway & Galas',
            tagSw: 'Mitindo & Gala',
        },
        {
            key: 'corporate',
            img: '/images/categories/corporate.jpg',
            position: 'center 40%',
            icon: Briefcase,
            labelEn: 'Corporate Events & Summits',
            labelSw: 'Matukio ya Kibiashara & Kongamano',
            tagEn: 'Summits & Galas',
            tagSw: 'Mikutano & Gala za Kampuni',
        },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const ticketingEl = document.getElementById('ticketing-services');
            if (ticketingEl) {
                const navHeight = 56; // h-14 navbar
                const rect = ticketingEl.getBoundingClientRect();
                // When top of ticketing section reaches the navbar bottom, switch to solid navy
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

        const navHeight = 56; // h-14 sticky header
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
        const sections = ['ticketing-services', 'invitations', 'how-it-works', 'payment', 'faq'];
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    let current = '';
                    const navHeight = 56;
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
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-[#16A34A] selection:text-white relative">
            
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

                /* Hero Asymmetric Cards Cascading Entrance - Silky Smooth */
                @keyframes heroCardFadeIn1 {
                    0% { opacity: 0; transform: translateY(32px) rotate(-6deg) scale(0.95); }
                    100% { opacity: 1; transform: translateY(0) rotate(-3deg) scale(1); }
                }
                @keyframes heroCardFadeIn2 {
                    0% { opacity: 0; transform: translateY(32px) rotate(6deg) scale(0.95); }
                    100% { opacity: 1; transform: translateY(0) rotate(3deg) scale(1); }
                }
                @keyframes heroCardFadeIn3 {
                    0% { opacity: 0; transform: translateY(36px) scale(0.94); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
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

            {/* Top Navigation Bar (Glassmorphic like Create Invitation button, crisp white line, zero text shadow) */}
            <header 
                className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
                    isScrolled 
                        ? "bg-[#0B2545]/95 backdrop-blur-md border-b border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.25)]" 
                        : "bg-white/[0.1] backdrop-blur-xl border-b border-white/25 shadow-lg"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4 text-white">
                    {/* Brand Logo */}
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer focus:outline-none flex items-center shrink-0">
                        <KardovoLogo 
                            light={true} 
                            showText={true} 
                            textClassName="text-white text-base font-black tracking-widest" 
                            imgClassName="h-7 w-7" 
                        />
                    </button>
                    
                    {/* Navigation Pills (Crisp Clean White without shadows) */}
                    <nav className="hidden lg:flex items-center gap-1.5 shrink-0 text-xs font-bold text-white">
                        {/* 1. Sell & Buy Tickets (Before Invitations & RSVP) */}
                        <a 
                            href="#ticketing-services" 
                            onClick={(e) => scrollToSection(e, 'ticketing-services')}
                            className={`px-3 py-1.5 rounded-xl transition cursor-pointer hover:bg-white/15 hover:text-white ${activeSection === 'ticketing-services' ? 'bg-white/20 text-white' : ''}`}
                        >
                            {lang === 'sw' ? 'Tiketi za Matukio' : 'Sell & Buy Tickets'}
                        </a>

                        {/* 2. Invitations & RSVP */}
                        <a 
                            href="#invitations" 
                            onClick={(e) => scrollToSection(e, 'invitations')}
                            className={`px-3 py-1.5 rounded-xl transition cursor-pointer hover:bg-white/15 hover:text-white ${activeSection === 'invitations' ? 'bg-white/20 text-white' : ''}`}
                        >
                            {t('Mialiko & RSVP')}
                        </a>

                        {/* 3. How It Works, Payment, FAQ */}
                        {[
                            { id: 'how-it-works', label: t('How It Works') },
                            { id: 'payment', label: t('Payment') },
                            { id: 'faq', label: t('FAQ') }
                        ].map(link => (
                            <a 
                                key={link.id}
                                href={`#${link.id}`} 
                                onClick={(e) => scrollToSection(e, link.id)}
                                className={`px-3 py-1.5 rounded-xl transition cursor-pointer hover:bg-white/15 hover:text-white ${activeSection === link.id ? 'bg-white/20 text-white' : ''}`}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Right-Side Controls: Language Toggle & Auth */}
                    <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold shrink-0 text-white">
                        {/* Language Toggle: Icon and text only, no shape */}
                        <button 
                            type="button"
                            onClick={() => setLang(lang === 'en' ? 'sw' : 'en')} 
                            className="flex items-center gap-1.5 px-2 py-1.5 text-white/90 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
                            title={lang === 'en' ? 'Badili lugha kuwa Kiswahili' : 'Switch language to English'}
                        >
                            <Globe className="w-4 h-4 text-sky-300" />
                            <span>{lang === 'en' ? 'SWA' : 'ENG'}</span>
                        </button>
                        
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] text-white text-xs font-bold transition shadow-xs"
                            >
                                <span>{t("Go to Dashboard")}</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openAuthModal('login')}
                                    className="px-3.5 py-1.5 rounded-xl font-bold transition text-xs cursor-pointer bg-white/[0.1] hover:bg-white/[0.18] text-white backdrop-blur-md border border-white/25"
                                >
                                    {t("Log In")}
                                </button>
                                <button
                                    onClick={() => openAuthModal('register')}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                                >
                                    <span>{t("Start Now")}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section (Fills Initial Viewport with Anchored Metrics - Zero White Space) */}
                {/* Hero Section (Clean, Minimalist, High-Tech Event & Invitation Canvas) */}
                {/* Hero Section — Modern Asymmetric Two-Column Conference/Event Layout */}
                <section id="hero" className="min-h-screen min-h-[100dvh] pt-14 bg-[#8ABEE0] text-white relative overflow-hidden flex flex-col justify-between select-none">
                    {/* Full Hero Background Image with subtle gentle overlay and smooth reveal transition */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#8ABEE0] hero-backdrop-reveal">
                        <img
                            src="/images/hero-art.jpg"
                            alt="Digital event passes, invitations and ticketing background"
                            className="w-full h-full object-cover object-center"
                        />
                        {/* Subtle gentle overlay to elevate text clarity while keeping the 3D art vivid */}
                        <div className="absolute inset-0 bg-[#0B2545]/20 dark:bg-[#07111E]/30" />

                        {/* Aesthetic Floating Geometric & Glass Elements matching the background artwork */}
                        <div className="hero-float-1 absolute top-[20%] left-[22%] w-28 h-28 sm:w-44 sm:h-44 rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-md shadow-xl pointer-events-none" />
                        <div className="hero-float-2 absolute bottom-[26%] left-[6%] w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-sky-300/30 via-sky-400/20 to-blue-600/20 border border-white/20 backdrop-blur-sm pointer-events-none" />
                        <div className="hero-float-3 absolute top-[14%] right-[10%] w-32 h-32 sm:w-48 sm:h-48 rounded-full border-2 border-sky-300/20 bg-sky-400/[0.03] backdrop-blur-xs pointer-events-none" />
                        
                        {/* Additional Floating Moving Circles for Richer Atmosphere */}
                        <div className="hero-float-4 absolute top-[8%] left-[10%] w-20 h-20 sm:w-28 sm:h-28 rounded-full border border-emerald-400/30 bg-emerald-400/[0.05] backdrop-blur-sm shadow-lg pointer-events-none" />
                        <div className="hero-float-5 absolute top-[38%] left-[2%] w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-cyan-400/25 to-blue-500/15 border border-cyan-300/30 backdrop-blur-xs pointer-events-none" />
                        <div className="hero-float-6 absolute bottom-[18%] left-[30%] w-20 h-20 sm:w-32 sm:h-32 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-md shadow-lg pointer-events-none" />
                        <div className="hero-float-1 absolute top-[5%] right-[28%] w-14 h-14 sm:w-20 sm:h-20 rounded-full border border-sky-200/25 bg-sky-300/[0.06] backdrop-blur-xs pointer-events-none" />
                        <div className="hero-float-2 absolute bottom-[12%] right-[5%] w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-indigo-500/20 via-sky-500/15 to-transparent border border-white/20 backdrop-blur-sm shadow-xl pointer-events-none" />
                        <div className="hero-float-4 absolute top-[45%] right-[22%] w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-emerald-300/25 bg-emerald-400/[0.08] backdrop-blur-xs pointer-events-none" />
                        <div className="hero-float-5 absolute bottom-[35%] right-[38%] w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-sky-400/20 border border-sky-300/40 pointer-events-none shadow-md" />

                        {/* Modern Decorative Dot Matrix Grids (from reference layout) */}
                        <div className="absolute top-20 left-8 sm:left-14 w-28 h-28 grid grid-cols-6 gap-2 opacity-25 pointer-events-none">
                            {Array.from({ length: 36 }).map((_, i) => (
                                <span key={i} className="w-1 h-1 rounded-full bg-white/70" />
                            ))}
                        </div>
                        <div className="absolute bottom-28 right-8 sm:right-14 w-28 h-28 grid grid-cols-6 gap-2 opacity-20 pointer-events-none">
                            {Array.from({ length: 36 }).map((_, i) => (
                                <span key={i} className="w-1 h-1 rounded-full bg-white/70" />
                            ))}
                        </div>
                    </div>

                    {/* Main Two-Column Hero Content */}
                    <div className="flex-1 flex items-center relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center w-full">
                            
                            {/* Left Column: Bold Headline, Subtitle, and Pill CTAs */}
                            <div className="lg:col-span-7 flex flex-col items-start text-left pt-2 lg:pt-0">
                                {/* Main Headline */}
                                <h1 className="animate-hero-headline text-3xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black font-display tracking-tight text-white leading-[1.08] mb-5 max-w-2xl">
                                    {lang === 'sw' ? (
                                        <>
                                            <span>Mialiko ya Kidigitali</span>
                                            <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-300">
                                                & Tiketi za Matukio
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Digital Invitations</span>
                                            <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-300">
                                                & Event Ticketing
                                            </span>
                                        </>
                                    )}
                                </h1>

                                {/* Subtitle copy */}
                                <p className="text-sm sm:text-base md:text-lg text-slate-300/90 font-medium leading-relaxed max-w-xl mb-7 sm:mb-8">
                                    {lang === 'sw' 
                                        ? 'Mfumo thabiti wa kununua na kuuza tiketi za matukio mtandaoni, kutuma mialiko ya kidigitali yenye majibu (RSVP), na kurahisisha uingiaji wa wageni mlangoni.'
                                        : 'A modern, unified platform to buy and sell event tickets online, send elegant digital invitations with real-time RSVPs, and streamline door access.'
                                    }
                                </p>

                                {/* Action Buttons matching layout aesthetic */}
                                <div className="animate-hero-cta flex flex-wrap items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
                                    <Link
                                        href={route('tickets.marketplace')}
                                        className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.98] text-white text-sm sm:text-base font-bold shadow-xl shadow-emerald-950/50 hover:shadow-emerald-900/60 transition-all duration-300 cursor-pointer"
                                    >
                                        <Ticket className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                                        <span>{lang === 'sw' ? 'Kununua Tiketi' : 'Browse Tickets'}</span>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => openAuthModal('register')}
                                        className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/[0.1] hover:bg-white/[0.18] active:scale-[0.98] border border-white/25 hover:border-white/40 text-white text-sm sm:text-base font-bold backdrop-blur-xl transition-all duration-300 cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4 text-emerald-400 group-hover:rotate-90 transition-transform duration-300" />
                                        <span>{lang === 'sw' ? 'Tengeneza Mwaliko' : 'Create Invitation'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Right Column: Cascading 3 Asymmetrical Rounded Image Cards (Spacious Breathing Room) */}
                            <div className="lg:col-span-5 relative flex justify-center lg:justify-end items-center mt-6 lg:mt-0">
                                <div className="relative w-full max-w-[390px] sm:max-w-[460px] lg:max-w-[500px] h-[380px] sm:h-[440px] lg:h-[470px]">
                                    
                                    {/* Back Card 1 (Top Left): Live Event Crowd & Presentation */}
                                    <div className="hero-card-anim-1 absolute top-0 left-0 w-[50%] sm:w-[52%] h-[50%] sm:h-[52%] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 transform -rotate-3 hover:rotate-0 transition-transform duration-500 z-10 group">
                                        <img 
                                            src="/images/categories/events.jpg" 
                                            alt="Events and Conferences" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                    </div>

                                    {/* Card 2 (Top Right): Safari & Adventure Showcase */}
                                    <div className="hero-card-anim-2 absolute top-2 right-0 w-[48%] sm:w-[50%] h-[52%] sm:h-[54%] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 transform rotate-3 hover:rotate-0 transition-transform duration-500 z-20 group">
                                        <img 
                                            src="/images/hero_safari_adventure.jpg" 
                                            alt="Serengeti Sunset Safari Adventure" 
                                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                    </div>

                                    {/* Front Card 3 (Center Lower Front): Fashion & Runway Shows */}
                                    <div className="hero-card-anim-3 absolute bottom-0 left-[16%] sm:left-[18%] w-[66%] sm:w-[68%] h-[58%] sm:h-[60%] rounded-3xl overflow-hidden shadow-2xl shadow-black/70 transform hover:scale-[1.02] transition-transform duration-500 z-30 group">
                                        <img 
                                            src="/images/categories/fashion.jpg" 
                                            alt="Fashion and Runway Shows" 
                                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Floating Stats Pill Card (Clean Frosted Translucent Glass Aesthetic) */}
                    <div className="w-full relative z-20 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8 hero-stats-anim">
                        <div className="max-w-5xl mx-auto bg-white/[0.12] dark:bg-white/[0.08] backdrop-blur-2xl rounded-[2.25rem] border border-white/25 shadow-2xl shadow-black/40 px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
                            
                            {/* 4 Key Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full divide-x divide-white/15">
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
                                href="#ticketing-services"
                                onClick={(e) => scrollToSection(e, 'ticketing-services')}
                                title="Scroll down"
                                className="hidden sm:flex w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30 border border-white/25 transition-all cursor-pointer"
                            >
                                <ArrowRight className="w-4 h-4 rotate-90" />
                            </a>
                        </div>
                    </div>
                </section>

                {/* Ticketing Services Section — 6 Large Aesthetic Category Grid Boxes */}
                <section id="ticketing-services" className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center py-7 sm:py-8 lg:py-9 bg-[#F8FAFC] dark:bg-[#07111E] relative scroll-mt-14 border-b border-slate-200/60 dark:border-white/10 overflow-hidden">
                    {/* Ambient glows for aesthetic depth */}
                    <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[32rem] h-[32rem] bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-1/3 right-1/4 w-[32rem] h-[32rem] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 flex flex-col">
                        {/* Section Header - Single Row Title and Short Subtitle */}
                        <div className="text-center max-w-4xl mx-auto mb-6 sm:mb-8 scroll-animate">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 mb-1.5 font-display pb-0.5 tracking-tight sm:whitespace-nowrap">
                                {lang === 'sw' ? 'Kuuza & Kununua Tiketi Mtandaoni' : 'Sell & Buy Event Tickets Online'}
                            </h2>
                            <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium sm:whitespace-nowrap">
                                {lang === 'sw' 
                                    ? 'Tiketi za kidigitali zenye malipo ya haraka ya simu kote Tanzania.'
                                    : 'Instant digital tickets with seamless mobile money checkout across Tanzania.'
                                }
                            </p>
                        </div>

                        {/* 6 Aesthetic Category Grid Boxes — Perfectly proportioned with breathing room */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7 max-w-6xl mx-auto w-full">
                            {ticketCategories.map((item, idx) => {
                                const CatIcon = item.icon || Ticket;
                                const isInternalCategory = ['events', 'hotels', 'nightlife', 'sports', 'fashion', 'corporate'].includes(item.key);
                                const targetUrl = isInternalCategory 
                                    ? route('tickets.marketplace', { category: item.key }) 
                                    : route('tickets.marketplace', { search: item.key });

                                return (
                                    <Link
                                        key={item.key}
                                        href={targetUrl}
                                        style={{ animationDelay: `${(idx % 3) * 120 + Math.floor(idx / 3) * 180}ms` }}
                                        className="group relative h-40 sm:h-48 md:h-52 lg:h-56 rounded-2xl sm:rounded-3xl overflow-hidden shadow-md shadow-slate-900/10 dark:shadow-black/40 border border-slate-200/50 dark:border-white/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500/40 block focus:outline-none scroll-animate ticket-category-card"
                                    >
                                        {/* Background Photo with Smooth Hover Scale */}
                                        <img
                                            src={item.img}
                                            alt={lang === 'sw' ? item.labelSw : item.labelEn}
                                            loading="lazy"
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            style={{ objectPosition: item.position || 'center' }}
                                        />

                                        {/* Cinematic Contrast Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#07111E]/95 via-[#07111E]/40 to-black/10 transition-opacity duration-300 group-hover:from-[#07111E]/90 group-hover:via-[#07111E]/30" />

                                        {/* Bottom Information & Interactive Arrow Button */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10 flex items-end justify-between gap-3">
                                            <div className="space-y-0.5">
                                                <h3 className="text-lg sm:text-xl font-black text-white font-display tracking-tight leading-snug drop-shadow-md group-hover:text-emerald-300 transition-colors">
                                                    {lang === 'sw' ? item.labelSw : item.labelEn}
                                                </h3>
                                                <p className="text-[11px] sm:text-xs text-slate-300 font-medium line-clamp-1 opacity-90">
                                                    {lang === 'sw' ? 'Gundua na kata tiketi sasa' : 'Explore & book passes'}
                                                </p>
                                            </div>

                                            {/* Action Icon Button */}
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-[#16A34A] group-hover:border-[#16A34A] group-hover:scale-110 shadow-md">
                                                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Features & Invitations Section — Neumorphic Infographic Circles Style */}
                <section id="invitations" className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center py-12 sm:py-20 bg-[#F0F2F5] dark:bg-[#07111E] relative scroll-mt-14 border-b border-slate-200/80 dark:border-white/10 overflow-hidden">
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
                            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium">
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
                                            className="absolute inset-0 rounded-full bg-[#F0F2F5] dark:bg-[#0c1626] transition-all duration-300"
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
                                                    className="dark:stroke-slate-700/60"
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
                                            className="relative z-10 w-[80%] h-[80%] rounded-full bg-[#F0F2F5] dark:bg-[#0c1626] flex flex-col items-center justify-center text-center p-6 sm:p-7 transition-all duration-300"
                                            style={{
                                                boxShadow: `
                                                    inset 6px 6px 14px rgba(166, 178, 196, 0.4),
                                                    inset -6px -6px 14px rgba(255, 255, 255, 0.95),
                                                    0 2px 8px rgba(0,0,0,0.02)
                                                `
                                            }}
                                        >
                                            {/* Feature Title */}
                                            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug mb-2 font-display">
                                                {item.title}
                                            </h3>

                                            {/* Feature Description */}
                                            <p className="text-[10px] sm:text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal max-w-[210px] line-clamp-3 mb-3">
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
                <section id="how-it-works" className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center py-8 sm:py-12 bg-[#FBFBFC] dark:bg-[#07111E] relative scroll-mt-14 border-t border-slate-200/60 dark:border-white/10 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col justify-center">
                        {/* Section Header */}
                        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 scroll-animate">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 mb-2 sm:mb-3 font-display pb-1 tracking-tight">
                                {t("Jinsi Inavyofanya Kazi")}
                            </h2>
                            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium">
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
                                                <path d={orbitPaths[idx].dashed} stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="5 5" className="opacity-60 dark:opacity-40 transition-opacity duration-700" />
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
                                            <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-[62%] lg:h-auto lg:aspect-square rounded-full bg-white dark:bg-[#0c1626] shadow-[0_18px_40px_rgba(0,0,0,0.10),0_4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.45)] flex items-center justify-center transition-all duration-500 hover:scale-105 group-hover:shadow-[0_22px_45px_rgba(0,0,0,0.14)] relative z-10">
                                                <step.icon className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 text-slate-800 dark:text-slate-100 stroke-[1.6] group-hover:scale-110 transition-transform duration-300" />
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
                                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug mb-2">
                                                {step.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
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
                <section id="payment" className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center py-6 sm:py-8 bg-[#F8FAFC] relative scroll-mt-14 border-t border-slate-100">
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
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#16A34A] text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg border border-[#16A34A]">
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

                {/* ── Accepted Payments Section ── */}
                <section className="py-16 bg-white border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-10 scroll-animate">
                            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 mb-4 font-display pb-1">{t("Accepted Payment Methods")}</h2>
                            <p className="text-lg text-slate-500">{t("Pay securely using any of the methods below, powered by AzamPay")}</p>
                        </div>

                        {/* Mobile Money */}
                        <div className="mb-8 scroll-animate delay-100">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">{t("Mobile Money")}</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-3xl mx-auto">
                                {[
                                    { label: 'm-pesa',  sub: 'Vodacom',  labelColor: '#E60000', subColor: '#64748b' },
                                    { label: 'Mixx',    sub: 'by Yas',   labelColor: '#1a237e', subColor: '#f59e0b', italic: true },
                                    { label: 'airtel',  sub: 'Money',    labelColor: '#E8001D', subColor: '#E8001D' },
                                    { label: 'halo',    sub: 'Pesa',     labelColor: '#F97316', subColor: '#64748b' },
                                    { label: 'Azam',    sub: 'Pesa',     labelColor: '#16a34a', subColor: '#64748b' },
                                ].map((p, i) => (
                                    <div key={i} className="h-20 rounded-2xl border-2 border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center gap-0.5">
                                        <span className="font-black text-base leading-none tracking-tight" style={{ color: p.labelColor, fontStyle: p.italic ? 'italic' : 'normal' }}>{p.label}</span>
                                        <span className="text-[11px] font-bold leading-none tracking-widest uppercase" style={{ color: p.subColor }}>{p.sub}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cards */}
                        <div className="mb-8 scroll-animate delay-200">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">{t("Card Payments")}</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                                {[
                                    { label: 'VISA',       sub: 'Debit / Credit',   labelColor: '#1A1F71' },
                                    { label: 'Mastercard', sub: 'Debit / Credit',   labelColor: '#EB001B' },
                                    { label: 'Amex',       sub: 'American Express', labelColor: '#007BC1' },
                                    { label: 'UnionPay',   sub: 'Union Pay',        labelColor: '#D40000' },
                                ].map((p, i) => (
                                    <div key={i} className="h-20 rounded-2xl border-2 border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center gap-0.5">
                                        <span className="font-black text-base leading-none tracking-tight" style={{ color: p.labelColor }}>{p.label}</span>
                                        <span className="text-[10px] font-semibold leading-none text-slate-400 uppercase tracking-wider">{p.sub}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bank & QR */}
                        <div className="scroll-animate delay-300">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">{t("Bank & Alternative")}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
                                {[
                                    { label: 'Bank Transfer', sub: 'CRDB, NMB & more',    labelColor: '#1a3a5c' },
                                    { label: 'QR Code',       sub: 'Scan to pay instantly', labelColor: '#1a1a2e' },
                                    { label: 'Lipia Link',    sub: 'AzamPay invoice link',  labelColor: '#16a34a' },
                                ].map((p, i) => (
                                    <div key={i} className="h-20 rounded-2xl border-2 border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center gap-0.5">
                                        <span className="font-black text-base leading-none tracking-tight" style={{ color: p.labelColor }}>{p.label}</span>
                                        <span className="text-[10px] font-semibold leading-none text-slate-400 text-center px-2">{p.sub}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p className="text-center text-[11px] text-slate-400 mt-8 flex items-center justify-center gap-1.5 scroll-animate delay-400">
                            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            {t("All payments are processed securely through")} <strong className="text-slate-600 ml-1">AzamPay</strong> · 256-bit SSL Encryption
                        </p>
                    </div>
                </section>

                <FAQSection t={t} />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-6 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
                    {/* Far Left: Logo */}
                    <div className="flex-1 flex justify-start opacity-90 hover:opacity-100 transition-opacity">
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer focus:outline-none">
                            <KardovoLogo showText={true} light={false} />
                        </button>
                    </div>
                    
                    {/* Center: Copyright */}
                    <div className="flex-1 flex justify-center text-slate-500 font-medium text-xs md:text-sm text-center">
                        &copy; {new Date().getFullYear()} Kardovo. {t("Haki zote zimehifadhiwa.")}
                    </div>
                    
                    {/* Far Right: Links */}
                    <div className="flex-1 flex justify-end gap-6 font-medium text-sm text-slate-500">
                        <Link href="/terms" className="hover:text-slate-800 transition-colors">{t("Vigezo na Masharti")}</Link>
                        <Link href="/privacy" className="hover:text-slate-800 transition-colors">{t("Sera ya Faragha")}</Link>
                    </div>
                </div>
            </footer>

            {/* Login Modal */}
            <Modal show={showLoginModal} onClose={() => setShowLoginModal(false)} maxWidth="xl" closeable={true}>
                <div className="relative">
                    <button 
                        onClick={() => setShowLoginModal(false)}
                        className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
                        <Login asModal={true} initialMode={authModalMode} />
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
        </div>
    );
}
