import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    CheckCircle2, Sparkles, Smartphone, QrCode, MessageCircle, 
    Users, BarChart3, Clock, ShieldCheck, ChevronRight, HandCoins, ChartPie, Globe,
    Send, Play, ArrowRight, Moon, Sun, ExternalLink, Ticket,
    Calendar, MapPin, Tag, Layers, Check, Zap, Building2, Plane, PartyPopper, Trophy, Plus
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
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('register');

    const openAuthModal = (mode) => {
        setAuthModalMode(mode);
        setShowLoginModal(true);
    };
    const [activeSection, setActiveSection] = React.useState('');

    // ── TOP NAVBAR STATIC WITH TRANSLUCENT SCROLL EFFECT ──
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
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
        const elementTop = rect.top + window.scrollY;

        window.scrollTo({
            top: Math.max(0, Math.round(elementTop - navHeight)),
            behavior: 'smooth'
        });

        if (window.history?.pushState) {
            window.history.pushState(null, '', `#${sectionId}`);
        }
        setActiveSection(sectionId);
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash) {
            const hash = window.location.hash.replace('#', '');
            if (['ticketing-services', 'invitations', 'how-it-works', 'payment', 'faq'].includes(hash)) {
                setTimeout(() => {
                    scrollToSection(null, hash);
                }, 300);
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
                
                @keyframes hero-fade-up {
                    0% {
                        opacity: 0;
                        transform: translateY(22px);
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
                    animation: hero-fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-hero-gradient {
                    background-size: 200% 200%;
                    animation: shimmer-gradient 6s ease-in-out infinite;
                }
                .animate-hero-subtitle {
                    animation: hero-fade-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.18s both;
                }
                .animate-hero-cta {
                    animation: hero-fade-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.32s both;
                }
            `}} />
            <Head title={t("Kadi za Kidigitali na Usimamizi Kisasa")} />

            {/* Top Navigation Bar (Compact & Solid Navy with Subtle Blur on Scroll) */}
            <header 
                className={`sticky top-0 z-50 text-white transition-all duration-300 ${
                    isScrolled 
                        ? "bg-[#0B2545]/95 backdrop-blur-md border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.25)]" 
                        : "bg-[#0B2545] border-b border-[#173860]"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
                    {/* Brand Logo */}
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer focus:outline-none flex items-center shrink-0">
                        <KardovoLogo light={true} showText={true} textClassName="text-white text-base font-black tracking-widest" imgClassName="h-7 w-7" />
                    </button>
                    
                    {/* Navigation Pills */}
                    <nav className="hidden lg:flex items-center gap-1.5 shrink-0 text-xs font-bold text-slate-300">
                        {/* 1. Sell & Buy Tickets (Before Invitations & RSVP) */}
                        <a 
                            href="#ticketing-services" 
                            onClick={(e) => scrollToSection(e, 'ticketing-services')}
                            className={`px-3 py-1.5 rounded-xl transition hover:text-white hover:bg-white/10 cursor-pointer ${activeSection === 'ticketing-services' ? 'text-white bg-white/15' : ''}`}
                        >
                            {lang === 'sw' ? 'Tiketi za Matukio' : 'Sell & Buy Tickets'}
                        </a>

                        {/* 2. Invitations & RSVP */}
                        <a 
                            href="#invitations" 
                            onClick={(e) => scrollToSection(e, 'invitations')}
                            className={`px-3 py-1.5 rounded-xl transition hover:text-white hover:bg-white/10 cursor-pointer ${activeSection === 'invitations' ? 'text-white bg-white/15' : ''}`}
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
                                className={`px-3 py-1.5 rounded-xl transition hover:text-white hover:bg-white/10 cursor-pointer ${activeSection === link.id ? 'text-white bg-white/15' : ''}`}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Right-Side Controls: Language Toggle & Auth */}
                    <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-300 shrink-0">
                        {/* Language Toggle matching landing page & tickets */}
                        <button 
                            type="button"
                            onClick={() => setLang(lang === 'en' ? 'sw' : 'en')} 
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/10 transition-colors text-xs font-bold text-slate-200 shadow-xs cursor-pointer mr-1"
                            title={lang === 'en' ? 'Badili lugha kuwa Kiswahili' : 'Switch language to English'}
                        >
                            <Globe className="w-3.5 h-3.5 text-[#008EE8]" />
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
                                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition text-xs cursor-pointer"
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
                <section id="hero" className="min-h-[calc(100vh-3.5rem+6px)] min-h-[calc(100dvh-3.5rem+6px)] bg-gradient-to-b from-[#0B2545] via-[#091D35] to-[#07111E] text-white relative overflow-hidden flex flex-col justify-between">
                    {/* Subtle Ambient Tech Mesh matching Ticket Marketplace */}
                    <div 
                        className="absolute inset-0 opacity-15 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#008EE8 1.5px, transparent 1.5px)',
                            backgroundSize: '24px 24px',
                        }}
                    />
                    <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-[#16A34A]/10 rounded-full blur-[140px] pointer-events-none" />
                    <div className="absolute bottom-10 left-1/4 w-[500px] h-[300px] bg-[#008EE8]/10 rounded-full blur-[140px] pointer-events-none" />

                    {/* Hero Content (Centered) */}
                    <div className="flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 relative z-10 py-10 sm:py-14">
                        <div className="max-w-5xl lg:max-w-6xl mx-auto flex flex-col items-center">
                            {/* Headline */}
                            <h1 className="animate-hero-headline text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black font-display tracking-tight text-white max-w-5xl mx-auto leading-[1.06] sm:leading-[1.03] mb-4 sm:mb-6 drop-shadow-sm">
                                {lang === 'sw' ? (
                                    <>
                                        <span>Mialiko ya Kidigitali</span>
                                        <br />
                                        <span className="animate-hero-gradient text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
                                            & Tiketi za Matukio
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span>Digital Invitations</span>
                                        <br />
                                        <span className="animate-hero-gradient text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
                                            & Event Ticketing
                                        </span>
                                    </>
                                )}
                            </h1>

                            {/* Subtitle */}
                            <p className="animate-hero-subtitle text-base sm:text-xl md:text-[1.25rem] text-slate-300/90 font-normal max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-10">
                                {lang === 'sw' 
                                    ? 'Tuma mialiko ya kisasa kupitia WhatsApp na SMS yenye QR Code mlangoni, au uza na ununue tiketi za matukio nchini Tanzania kwa mitandao yote ya simu.'
                                    : 'Send modern invitations via WhatsApp and SMS with door QR verification, or sell and book event tickets across Tanzania with mobile money.'
                                }
                            </p>

                            {/* Standout Aesthetic Buttons */}
                            <div className="animate-hero-cta flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                                <Link
                                    href={route('tickets.marketplace')}
                                    className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.98] text-white text-base font-bold shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                                >
                                    <Ticket className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                                    <span>{lang === 'sw' ? 'Kununua Tiketi' : 'Browse Tickets'}</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => openAuthModal('register')}
                                    className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.98] border border-white/20 hover:border-white/35 text-white text-base font-bold backdrop-blur-xl shadow-lg transition-all duration-300 cursor-pointer"
                                >
                                    <Plus className="w-5 h-5 text-emerald-400 group-hover:rotate-90 transition-transform duration-300" />
                                    <span>{lang === 'sw' ? 'Tengeneza Mwaliko' : 'Create Invitation'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Metrics Bar (Anchored at the bottom of the first screen - Perfectly fits viewport) */}
                    <div className="w-full border-t border-white/10 bg-black/25 backdrop-blur-md relative z-10 py-5 sm:py-6">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-x divide-white/10">
                                <div className="text-center px-4">
                                    <h3 className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight drop-shadow-sm">
                                        <AnimatedCounter end={10} suffix="K+" />
                                    </h3>
                                    <p className="text-[11px] sm:text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">{t("Mialiko Iliyotumwa")}</p>
                                </div>
                                <div className="text-center px-4">
                                    <h3 className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight drop-shadow-sm">
                                        <AnimatedCounter end={99.9} decimals={1} suffix="%" />
                                    </h3>
                                    <p className="text-[11px] sm:text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">{t("Uhakika wa Kufika")}</p>
                                </div>
                                <div className="text-center px-4">
                                    <h3 className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight drop-shadow-sm">
                                        <AnimatedCounter end={24} suffix="/7" />
                                    </h3>
                                    <p className="text-[11px] sm:text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">{t("Huduma kwa Wateja")}</p>
                                </div>
                                <div className="text-center px-4">
                                    <h3 className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight drop-shadow-sm">
                                        <AnimatedCounter end={0.2} decimals={1} suffix="s" />
                                    </h3>
                                    <p className="text-[11px] sm:text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">{t("Kuscan Mlangoni")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Ticketing Services Section */}
                <section id="ticketing-services" className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center py-6 sm:py-8 bg-white relative scroll-mt-14 border-b border-slate-100">
                    <div className="max-w-7xl mx-auto px-6 w-full">
                        {/* Section Header */}
                        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 scroll-animate">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 mb-2 sm:mb-3 font-display pb-1">
                                {lang === 'sw' ? 'Kuuza & Kununua Tiketi Mtandaoni' : 'Sell & Buy Event Tickets Online'}
                            </h2>
                            <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
                                {lang === 'sw' 
                                    ? 'Mfumo rahisi na wa uhakika wa tiketi kwa ajili ya matamasha, mikutano, ndege na matukio ya kijamii wenye malipo ya haraka ya simu.'
                                    : 'A simple, reliable ticketing platform for concerts, conferences, flights, and social events with seamless mobile checkout.'
                                }
                            </p>
                        </div>

                        {/* 3 Core Value Cards matching Features layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                            {/* Card 1 */}
                            <div className="group p-5 sm:p-6 rounded-2xl scroll-animate bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1.5 transition-all duration-300">
                                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 text-kardovo-blue-dark shadow-xs flex items-center justify-center mb-3.5 group-hover:scale-110 group-hover:text-emerald-500 transition-transform duration-300">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                    {lang === 'sw' ? 'Bila Kufungua Akaunti' : 'No Account Needed'}
                                </h3>
                                <p className="text-slate-500 leading-relaxed text-sm font-medium">
                                    {lang === 'sw'
                                        ? 'Weka tu jina na namba ya simu. Malipo yanakamilika chini ya dakika moja kwa kutumia M-Pesa, TigoPesa, Airtel Money au Kadi.'
                                        : 'Just enter your name and phone number. Checkout takes under a minute using M-Pesa, TigoPesa, Airtel Money, or Cards.'
                                    }
                                </p>
                            </div>

                            {/* Card 2 */}
                            <div className="group p-5 sm:p-6 rounded-2xl scroll-animate bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1.5 transition-all duration-300">
                                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 text-kardovo-blue-dark shadow-xs flex items-center justify-center mb-3.5 group-hover:scale-110 group-hover:text-emerald-500 transition-transform duration-300">
                                    <QrCode className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                    {lang === 'sw' ? 'Pass ya Papo Hapo, SMS & Email' : 'Instant Digital Pass, SMS & Email'}
                                </h3>
                                <p className="text-slate-500 leading-relaxed text-sm font-medium">
                                    {lang === 'sw'
                                        ? 'Baada ya malipo kukamilika, pasi yako ya kidigitali inaonekana papo hapo skrini ikiwa na QR code salama, huku ukipokea kiungo cha pasi kwa SMS na barua pepe ikiwa na vocha ya PDF.'
                                        : 'Once payment completes, your authentic digital pass displays immediately on screen with a dynamic QR code, and is delivered directly to your phone via SMS and email with an attached PDF voucher.'
                                    }
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="group p-5 sm:p-6 rounded-2xl scroll-animate bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1.5 transition-all duration-300">
                                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 text-kardovo-blue-dark shadow-xs flex items-center justify-center mb-3.5 group-hover:scale-110 group-hover:text-emerald-500 transition-transform duration-300">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                    {lang === 'sw' ? 'Udhibiti wa Waandaaji' : 'Organizer Control'}
                                </h3>
                                <p className="text-slate-500 leading-relaxed text-sm font-medium">
                                    {lang === 'sw'
                                        ? 'Panga madaraja ya VIP na Regular, fuatilia mauzo mubashara, dhibiti ukomo wa idadi (quotas), na hakiki tiketi getini kwa simu yoyote.'
                                        : 'Set up VIP and regular tiers, track live sales, manage quotas, and verify tickets at the gate using any smartphone.'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Clean Action Callout Banner */}
                        <div className="mt-6 sm:mt-8 p-5 sm:p-6 rounded-2xl scroll-animate bg-[#0B2545] text-white flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-xl">
                            <div className="text-center md:text-left space-y-1">
                                <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                                    {lang === 'sw' ? 'Unatafuta tiketi au unapanga kuuza zako?' : 'Looking for event tickets or planning to sell your own?'}
                                </h3>
                                <p className="text-sm text-slate-300">
                                    {lang === 'sw' ? 'Tazama tiketi zinazopatikana kote nchini Tanzania.' : 'Explore available tickets across Tanzania.'}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                                <Link
                                    href={route('tickets.marketplace')}
                                    className="px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] text-white text-sm font-bold shadow-xs transition"
                                >
                                    {lang === 'sw' ? 'Kununua Tiketi' : 'Browse Tickets'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features & Invitations Section */}
                <section id="invitations" className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center py-6 sm:py-8 bg-white relative scroll-mt-14 border-b border-slate-100">
                    <div className="max-w-7xl mx-auto px-6 w-full">
                        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 scroll-animate">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 mb-2 sm:mb-3 font-display pb-1">{t("All-in-One Event Toolkit")}</h2>
                            <p className="text-base sm:text-lg text-slate-500">{t("Kila kitu unachokihitaji kurahisisha usimamizi wa sherehe yako kuanzia maandalizi hadi siku ya tukio yenyewe.")}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                            {[
                                { icon: Smartphone, title: t("Kadi za Kidigitali"), desc: t("Tengeneza kadi zenye muonekano wa kisasa. Jumuisha namba ya kiti, ramani, na QR Code kwa ajili ya mlangoni.") },
                                { icon: MessageCircle, title: t("WhatsApp & SMS"), desc: t("Watumie wageni wako kadi zao moja kwa moja kwenye namba zao za simu kwa uharaka na uhakika mkubwa.") },
                                { icon: HandCoins, title: t("Usimamizi wa Michango"), desc: t("Dhibiti ahadi na michango kwa urahisi. Tuma jumbe za kukumbusha wageni kuhusu ahadi zao kiotomatiki.") },
                                { icon: Users, title: t("Majibu ya Wageni (RSVP)"), desc: t("Pata majibu ya uhakika (RSVP) moja kwa moja kwenye mfumo wakati wageni wanapothibitisha ushiriki wao.") },
                                { icon: QrCode, title: t("Kuscan QR Mlangoni"), desc: t("Ondoa kero ya watu wasioalikwa. Tumia simu kuscan QR Code mlangoni na kuhakiki taarifa za mgeni sekunde chache tu.") },
                                { icon: ChartPie, title: t("Ripoti za Moja kwa Moja"), desc: t("Fuatilia kwa ukaribu idadi ya mialiko iliyofika, majibu ya RSVP, na wageni waliokwisha ingia ukumbini.") }
                            ].map((feature, idx) => (
                                <div key={idx} className={`group p-4.5 sm:p-5 rounded-2xl scroll-animate bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1.5 transition-all duration-300`}>
                                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 text-kardovo-blue-dark shadow-xs flex items-center justify-center mb-3 group-hover:scale-110 group-hover:text-emerald-500 transition-transform duration-300">
                                        <feature.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">{feature.title}</h3>
                                    <p className="text-slate-500 leading-relaxed text-xs sm:text-sm font-medium">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section id="how-it-works" className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center py-12 sm:py-16 bg-white relative scroll-mt-14 border-t border-slate-100">
                    <div className="absolute inset-0 bg-slate-50/50 pointer-events-none"></div>
                    <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 scroll-animate">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 mb-3 font-display pb-1">{t("Jinsi Inavyofanya Kazi")}</h2>
                            <p className="text-base sm:text-lg text-slate-500">{t("Hatua tano tu zinazokutenganisha wewe na usimamizi bora wa tukio lako kidigitali.")}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6 relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-[2px] bg-slate-200 border-t-2 border-dashed border-slate-200"></div>
                            
                            {[
                                { 
                                    num: '1', 
                                    title: t('Sajili Tukio Lako'), 
                                    desc: t("Tengeneza akaunti na uchague muonekano wa kadi yako ya kidigitali katika mfumo.")
                                },
                                { 
                                    num: '2', 
                                    title: t("Fanya Malipo"), 
                                    desc: t("Nunua kifurushi kufungua huduma zote muhimu na kuendelea na maandalizi.")
                                },
                                { 
                                    num: '3', 
                                    title: t("Tuma Mialiko"), 
                                    desc: t("Weka majina ya wageni wako kisha watumie mialiko yao moja kwa moja kwa WhatsApp au SMS.")
                                },
                                { 
                                    num: '4', 
                                    title: t('Pokea Majibu'), 
                                    desc: t("Wageni watafungua kadi zao na kuthibitisha (RSVP) mtandaoni kama watahudhuria au la.")
                                },
                                { 
                                    num: '5', 
                                    title: t('Scan QR Mlangoni'), 
                                    desc: t("Siku ya tukio, scan QR code kwenye kadi zao mlangoni kuruhusu walioalikwa tu kuingia.")
                                }
                            ].map((step, idx) => (
                                <div key={idx} className={`relative flex flex-col items-center text-center group scroll-animate`}>
                                    <div className="w-20 h-20 rounded-full shadow-lg shadow-slate-200/50 flex items-center justify-center text-2xl font-black text-white bg-[#0B2545] mb-5 relative z-10 border-4 border-slate-50 group-hover:scale-110 group-hover:bg-[#16A34A] transition-all duration-300">
                                        {step.num}
                                    </div>
                                    <h3 className="text-lg font-bold text-[#0B2545] mb-2">{step.title}</h3>
                                    <p className="text-slate-500 leading-relaxed text-xs sm:text-sm font-medium">{step.desc}</p>
                                </div>
                            ))}
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
                                    <div key={i} className="h-20 rounded-2xl border-2 border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center gap-0.5 hover:border-emerald-300 hover:shadow-md transition-all">
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
                                    <div key={i} className="h-20 rounded-2xl border-2 border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center gap-0.5 hover:border-emerald-300 hover:shadow-md transition-all">
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
                                    <div key={i} className="h-20 rounded-2xl border-2 border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center gap-0.5 hover:border-emerald-300 hover:shadow-md transition-all">
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
