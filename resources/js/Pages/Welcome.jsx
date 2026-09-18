import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    CheckCircle2, Sparkles, Smartphone, QrCode, MessageCircle, 
    Users, BarChart3, Clock, ShieldCheck, ChevronRight, HandCoins, ChartPie, Globe 
, Send, Play, ArrowRight, Moon, Sun } from "lucide-react";
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
    "Features": {
        "en": "Features",
        "sw": "Vipengele"
    },
    "How It Works": {
        "en": "How It Works",
        "sw": "Hatua Rahisi"
    },
    "Payment": {
        "en": "Payment",
        "sw": "Bei Zetu"
    },
    "FAQ": {
        "en": "FAQ",
        "sw": "Maswali (FAQ)"
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
        "en": "Digital Cards & Modern Management",
        "sw": "Kadi za Kidigitali na Usimamizi Kisasa"
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
            q: t("Je, natumaje mialiko kwa wageni wangu?"),
            a: t("Kardovo inakuwezesha kutuma mialiko ya kidigitali na QR Codes moja kwa moja kwa wageni wako kupitia WhatsApp au SMS kwa kubofya kitufe kimoja tu kutokea kwenye dashibodi yako.")
        },
        {
            q: t("Je, wageni wangu wanahitaji kupakua app yoyote?"),
            a: t("Hapana! Wageni wanapokea kiungo (link) kupitia WhatsApp au SMS ambacho kinawafungulia kadi yao ya mwaliko kwenye kivinjari cha simu zao, ambapo wanaweza kujibu (RSVP) mara moja.")
        },
        {
            q: t("QR Code scanner inafanyaje kazi mlangoni?"),
            a: t("Baada ya mgeni kuthibitisha (RSVP), anapata Pass yenye QR Code. Siku ya tukio, walinzi au wahudumu wako watatumia simu zao kuscan hizo QR Codes mlangoni ili kuruhusu wageni kuingia haraka bila msongamano.")
        },
        {
            q: t("Je, ninaweza kuona wangapi wamethibitisha kuhudhuria?"),
            a: t("Ndiyo, dashibodi yako inakupa ripoti ya moja kwa moja (live) inayoonyesha idadi ya wageni walioalikwa, waliothibitisha kuhudhuria (RSVP Attending), waliokataa, na wale ambao tayari wameingia ukumbini.")
        },
        {
            q: t("Kuna ukomo wa idadi ya wageni ninaoweza kualika?"),
            a: t("Vifurushi vyetu vimepangwa kuendana na ukubwa wa tukio lako. Kifurushi cha Premium kinakidhi hadi wageni 300, wakati Executive inaruhusu hadi wageni 1,000, na Corporate inashughulikia hadi wageni 5,000.")
        },
        {
            q: t("Je, ninaweza kufanya malipo kwa njia gani?"),
            a: t("Tunapokea malipo kupitia mitandao yote ya simu (M-Pesa, Mixx by Yas, Airtel Money, HaloPesa, AzamPesa) na kadi za benki (Visa, Mastercard, Amex) kwa usalama na uhakika kupitia AzamPay.")
        }
    ];

    return (
        <section id="faq" className="py-24 bg-white border-t border-slate-100">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16 scroll-animate delay-100">
                    <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 mb-4 font-display pb-1">{t("Maswali Yanayoulizwa Sana (FAQ)")}</h2>
                    <p className="text-slate-500 text-lg">{t("Pata majibu ya maswali muhimu kuhusu matumizi ya Kardovo.")}</p>
                </div>
                <div className="bg-slate-50 rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm scroll-animate delay-200">
                    {faqs.map((faq, idx) => (
                        <FAQItem key={idx} question={faq.q} answer={faq.a} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function Welcome({ auth }) {
    const [lang, setLang] = useState('sw');
    const t = (key) => translations[key] ? translations[key][lang] : key;
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('register');

    const openAuthModal = (mode) => {
        setAuthModalMode(mode);
        setShowLoginModal(true);
    };
    const [activeSection, setActiveSection] = React.useState('');

    React.useEffect(() => {
        const sections = ['features', 'how-it-works', 'payment', 'faq'];
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    let current = '';
                    sections.forEach(section => {
                        const el = document.getElementById(section);
                        if (el) {
                            const rect = el.getBoundingClientRect();
                            if (rect.top <= 300 && rect.bottom >= 300) {
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
                    // animObserver.unobserve(entry.target); // Un-comment to only animate once
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
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-emerald-500 selection:text-white scroll-smooth">
            
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
            `}} />
            <Head title={t("Kadi za Kidigitali na Usimamizi Kisasa")} />


            {/* Navigation Bar */}
            <header className="fixed top-0 w-full z-50 px-6 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-sm rounded-2xl px-5 py-3">
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer focus:outline-none hover:opacity-80 transition-opacity">
                        <KardovoLogo showText={true} textClassName="text-[#0B2545]" />
                    </button>
                    
                    <nav className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
                            {[
                                { id: 'features', label: t('Features') },
                                { id: 'how-it-works', label: t('How It Works') },
                                { id: 'payment', label: t('Payment') },
                                { id: 'faq', label: t('FAQ') }
                            ].map(link => (
                                <a 
                                    key={link.id}
                                    href={`#${link.id}`} 
                                    className={`relative flex flex-col items-center hover:text-[#16A34A] transition-colors duration-200 ${activeSection === link.id ? 'text-[#16A34A]' : ''}`}
                                >
                                    <span>{link.label}</span>
                                    <span className={`absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-[#16A34A] transition-opacity duration-300 ${activeSection === link.id ? 'opacity-100' : 'opacity-0'}`}></span>
                                </a>
                            ))}
                        </div>
                        
                        {/* Language Toggle */}
                        <button 
                            onClick={() => setLang(lang === 'en' ? 'sw' : 'en')} 
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-bold text-slate-600 shadow-sm mr-2"
                        >
                            <Globe className="w-4 h-4 text-blue-500" />
                            {lang === 'en' ? 'SWA' : 'ENG'}
                        </button>
                        
                        {auth?.user ? (

                            <Link
                                href={route('dashboard')}
                                className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] border border-[#16A34A] text-white font-bold text-sm shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 transition-all"
                            >
                                {t("Go to Dashboard")}
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => openAuthModal('login')}
                                    className="px-4 py-2.5 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => openAuthModal('register')}
                                    className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] border border-[#16A34A] text-white font-bold text-sm shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 transition-all cursor-pointer"
                                >
                                    {t("Start Now")}
                                </button>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative pt-20 pb-16 lg:pt-24 lg:pb-20 overflow-hidden bg-[#F8FAFC]">
                    {/* Interactive Monochrome Canvas Wave Background */}
                    <div className="absolute inset-0 opacity-[0.08] pointer-events-none overflow-hidden mix-blend-multiply">
                        {/* Left large node */}
                        <div className="absolute top-[20%] left-[15%] w-64 h-64 border border-slate-300 rounded-full animate-[pulse-node_8s_ease-in-out_infinite]" />
                        <div className="absolute top-[20%] left-[15%] w-96 h-96 border border-slate-200/50 rounded-full animate-[pulse-node_12s_ease-in-out_infinite_1s]" />
                        
                        {/* Right large node */}
                        <div className="absolute top-[60%] right-[10%] w-72 h-72 border border-slate-300 rounded-full animate-[pulse-node_10s_ease-in-out_infinite_2s]" />
                        <div className="absolute top-[60%] right-[10%] w-[28rem] h-[28rem] border border-slate-200/50 rounded-full animate-[pulse-node_15s_ease-in-out_infinite]" />
                        
                        {/* Center connecting node */}
                        <div className="absolute top-[40%] left-[50%] w-48 h-48 border border-slate-300 rounded-full animate-[pulse-node_9s_ease-in-out_infinite_0.5s]" />
                        
                        {/* Floating mini nodes */}
                        <div className="absolute top-[15%] right-[25%] w-4 h-4 bg-slate-400 rounded-full animate-[float-node-1_6s_ease-in-out_infinite]" />
                        <div className="absolute top-[70%] left-[25%] w-3 h-3 bg-slate-300 rounded-full animate-[float-node-2_7s_ease-in-out_infinite]" />
                        <div className="absolute top-[45%] right-[40%] w-5 h-5 bg-slate-400 rounded-full animate-[float-node-3_8s_ease-in-out_infinite]" />

                        {/* Connecting Data Lines */}
                        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            {/* Line from Left to Center */}
                            <path d="M 20vw 30vh Q 40vw 20vh 50vw 40vh" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-300 opacity-50" strokeDasharray="4 4" />
                            <path d="M 20vw 30vh Q 40vw 20vh 50vw 40vh" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400" strokeDasharray="100" strokeDashoffset="100" style={{ animation: 'data-flow 3s linear infinite' }} />
                            
                            {/* Line from Center to Right */}
                            <path d="M 50vw 40vh Q 70vw 60vh 85vw 50vh" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-300 opacity-50" strokeDasharray="4 4" />
                            <path d="M 50vw 40vh Q 70vw 60vh 85vw 50vh" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400" strokeDasharray="100" strokeDashoffset="100" style={{ animation: 'data-flow 4s linear infinite 1s' }} />
                            
                            {/* Line from Left to Bottom Right */}
                            <path d="M 20vw 30vh Q 40vw 70vh 85vw 50vh" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 opacity-50" />
                        </svg>
                    </div>

                    
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
                    
                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <div className="relative group perspective-1000">
                            {/* Tech Animations Behind Text */}
                            <TechBackground />
                            
                            {/* Floating Decorative Elements */}
                            
                            

                            {/* Floating QR Scanner Decor */}
                            <div className="absolute -bottom-10 -left-6 md:-bottom-12 md:-left-12 z-20 animate-[float-network_8s_ease-in-out_infinite_1s]">
                                <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-[0_20px_40px_rgba(11,37,69,0.2)] border border-blue-100 flex flex-col items-center gap-2 transform -rotate-12">
                                    <QrCode className="w-12 h-12 text-[#0B2545]" />
                                    <div className="text-[9px] font-black tracking-widest text-[#16A34A] uppercase">Approved</div>
                                </div>
                            </div>

                            {/* Central Content */}
                            <div className="relative z-10 flex flex-col items-center mt-0 md:mt-4 w-full max-w-5xl mx-auto text-center">
                                <div className="scroll-animate delay-100 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-sm text-[#0B2545] text-xs font-black tracking-widest uppercase mb-10 shadow-lg shadow-blue-900/10 transform hover:scale-105 transition-transform cursor-default border border-[#0B2545]/10">
                                    <Sparkles className="w-4 h-4 text-emerald-500" />
                                    {t("Kadi za Kidigitali na Usimamizi Kisasa")}
                                </div>
                                
                                <h1 className="scroll-animate delay-200 relative text-5xl md:text-6xl lg:text-[5rem] font-black text-[#0B2545] tracking-tight leading-[1.1] max-w-4xl mx-auto font-display mb-8 drop-shadow-sm">
                                    {t("Tuma Mialiko Yako Kidigitali")} <br className="hidden md:block" />
                                    <span className="inline-block mt-2">
                                        <span className="mr-3">{t("Kupitia")}</span>
                                        <span className="relative text-transparent bg-clip-text bg-gradient-to-br from-green-500 to-emerald-400">WhatsApp</span>
                                        <span className="text-[#0B2545] mx-3 font-medium">&</span>
                                        <span className="relative text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-cyan-500">SMS</span>.
                                    </span>
                                </h1>
                                
                                <p className="scroll-animate delay-300 text-lg md:text-xl text-[#0B2545] font-semibold leading-relaxed max-w-2xl mx-auto mb-12 drop-shadow-md">
                                    {t("Tengeneza kadi zenye muonekano wa kuvutia, pokea majibu (RSVP) moja kwa moja, na dhibiti uingiaji wa wageni mlangoni kwa kutumia QR Code scanner.")}
                                </p>
                                
                                <div className="scroll-animate delay-400 flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto mb-20">
                                    <button
                                        onClick={() => openAuthModal('register')}
                                        className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-base shadow-2xl hover:shadow-green-900/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 cursor-pointer"
                                    >
                                        <Send className="w-5 h-5 transition-transform" />
                                        <span>{t("Tengeneza Kadi Yako")}</span>
                                    </button>
                                    
                                    <a
                                        href="#demo"
                                        className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/90 hover:bg-white border-2 border-[#0B2545]/20 hover:border-[#0B2545]/40 text-[#0B2545] font-black text-base shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Smartphone className="w-5 h-5 text-[#16A34A]" />
                                        {t("Tuma Mfano")}
                                    </a>
                                </div>
                                
                                {/* Dashboard Mockup */}
                                <div className="scroll-animate-mockup delay-300 w-full max-w-5xl mx-auto relative z-20 mt-10 shadow-[0_30px_100px_-20px_rgba(11,37,69,0.3)] rounded-[1.5rem] group hover:scale-[1.02] transition-transform duration-500">
    {/* DESKTOP DASHBOARD MOCKUP */}
    <div className="bg-slate-50 rounded-[1.5rem] overflow-hidden border border-slate-100 aspect-[16/11] relative flex text-left font-sans text-sm shadow-inner">
        <div className="flex-1 flex overflow-hidden opacity-95 hover:opacity-100 transition-opacity">
            
            {/* Sidebar */}
            <div className="w-[20%] max-w-[220px] bg-[#0B2545] text-slate-200 p-4 flex flex-col border-r border-[#173860] relative z-20">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-1 mt-1">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm flex items-center justify-center font-black text-white text-[10px]">K</div>
                    <div className="font-black tracking-widest text-[13px] text-white">KARDOVO</div>
                </div>
                
                <div className="mb-6 text-[9px] text-slate-400 font-bold tracking-wide">Kardovo Events & Media Ltd</div>

                {/* Menu */}
                <div className="flex flex-col gap-1.5 flex-1 pr-2">
                    <div className="flex items-center gap-3 bg-[#16a34a] text-white px-3 py-2 rounded-lg font-bold text-[11px] shadow-sm cursor-pointer transition-colors border border-[#16a34a]">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        Dashboard
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors font-semibold text-[11px]">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> Calendar
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors font-semibold text-[11px]">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> Payment
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors font-semibold text-[11px]">

                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg> Card Templates
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors font-semibold text-[11px]">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> My Events
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors font-semibold text-[11px]">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> Messaging Hub
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors font-semibold text-[11px]">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg> Gate Scanner
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors font-semibold text-[11px]">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> Account Profile
                    </div>
                </div>

                {/* Quotas */}
                <div className="mt-auto bg-[#0B2545]/80 rounded-lg p-2.5 border border-[#173860] mb-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Active Quotas</span>
                        <span className="text-[7px] border border-emerald-500/50 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/10">LIVE</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-slate-300 mb-1.5 bg-[#0B2545]/50 px-2 py-1 rounded border border-white/5">
                        <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399]"></span> WhatsApp</div>
                        <span className="text-emerald-400 font-bold">663 left</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-slate-300 bg-[#0B2545]/50 px-2 py-1 rounded border border-white/5">
                        <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_#3b82f6]"></span> SMS</div>
                        <span className="text-blue-400 font-bold">114 left</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-[#F8FAFC] flex flex-col relative z-10 overflow-hidden">
                {/* Topbar */}
                <div className="bg-[#0B2545] h-[48px] px-4 flex items-center justify-between shadow-sm z-20 shrink-0 border-b border-[#173860]">
                    <div className="text-[11px] font-medium"><span className="text-emerald-400">Kardovo</span> <span className="text-slate-500 mx-1">/</span> <span className="text-white font-bold">Organizer Dashboard</span></div>
                    <div className="flex items-center gap-2.5">
                        <div className="bg-[#16a34a] hover:bg-emerald-500 cursor-pointer text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> Create Event
                        </div>
                        <div className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer flex items-center justify-center text-slate-300 transition-colors border border-white/10">
                            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer flex items-center justify-center text-slate-300 transition-colors border border-white/10">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Dashboard Content STATIC area */}
                <div className="p-4 flex-1 overflow-hidden flex flex-col justify-between">
                    {/* Welcome Card */}
                    <div className="bg-white rounded-[1rem] p-4 shadow-sm flex items-center gap-4 mb-4 border border-slate-100 min-h-[70px] shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                        </div>
                        <div className="flex flex-col justify-center">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Good evening, David</h2>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Select or create an event to get started</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-6 gap-3 mb-4 shrink-0">
                        <div className="bg-white p-3 rounded-[1rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Events</span>
                                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                            </div>
                            <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">3</div>
                            <div className="text-[9px] text-emerald-600 font-bold">3 active</div>
                        </div>
                        <div className="bg-white p-3 rounded-[1rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Guests</span>
                                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div>
                            </div>
                            <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">26</div>
                            <div className="text-[9px] text-emerald-600 font-bold">Invited guests</div>
                        </div>
                        <div className="bg-white p-3 rounded-[1rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Attending</span>
                                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                            </div>
                            <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">13</div>
                            <div className="text-[9px] text-emerald-600 font-bold">50% confirmed</div>
                        </div>
                        <div className="bg-white p-3 rounded-[1rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Checked In</span>
                                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                            </div>
                            <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">9</div>
                            <div className="text-[9px] text-emerald-600 font-bold">Gate entries</div>
                        </div>
                        <div className="bg-white p-3 rounded-[1rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Passes Sent</span>
                                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></div>
                            </div>
                            <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">167</div>
                            <div className="text-[9px] text-emerald-600 font-bold">Dispatched</div>
                        </div>
                        <div className="bg-white p-3 rounded-[1rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Quota</span>
                                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                            </div>
                            <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">777</div>
                            <div className="text-[9px] text-emerald-600 font-bold">145 sent</div>
                        </div>
                    </div>

                    {/* Lower Section Grid */}
                    <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
                        {/* Your Events - col-span-2 */}
                        <div className="col-span-2 bg-white rounded-[1rem] p-4 shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900">Your Events</h3>
                                        <p className="text-[10px] text-slate-500 font-medium">Active event campaigns and guest tallies.</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-700 border border-slate-200 cursor-pointer transition-colors">View All (3) &rarr;</div>
                            </div>
                            
                            <div className="flex flex-col gap-2 flex-1 justify-around">
                                {/* Event 1 */}
                                <div className="flex items-center justify-between gap-3 p-2 bg-white hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-center shrink-0 shadow-sm">
                                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Nov</div>
                                            <div className="text-lg font-black text-slate-900 leading-none">20</div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-[13px] font-black text-slate-900 truncate">Fintech East Africa Summit 2026</h4>
                                            <div className="flex flex-row items-center gap-2 mt-1 whitespace-nowrap">
                                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[9px] font-bold border border-emerald-100">Corporate Conference</span>
                                                <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 truncate"><svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Dar es Salaam Serena Hotel</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors shrink-0">Manage &rsaquo;</div>
                                </div>
                                {/* Event 2 */}
                                <div className="flex items-center justify-between gap-3 p-2 bg-white hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-center shrink-0 shadow-sm">
                                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Oct</div>
                                            <div className="text-lg font-black text-slate-900 leading-none">5</div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-[13px] font-black text-slate-900 truncate">CRDB Bank Annual Executive Summit 2026</h4>
                                            <div className="flex flex-row items-center gap-2 mt-1 whitespace-nowrap">
                                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[9px] font-bold border border-emerald-100">Corporate Gala</span>
                                                <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 truncate"><svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Julius Nyerere Convention Centre</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors shrink-0">Manage &rsaquo;</div>
                                </div>
                                {/* Event 3 */}
                                <div className="flex items-center justify-between gap-3 p-2 bg-white hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-center shrink-0 shadow-sm">
                                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Sept</div>
                                            <div className="text-lg font-black text-slate-900 leading-none">14</div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-[13px] font-black text-slate-900 truncate">Neema & Baraka &mdash; Wedding</h4>
                                            <div className="flex flex-row items-center gap-2 mt-1 whitespace-nowrap">
                                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[9px] font-bold border border-emerald-100">Wedding Reception</span>
                                                <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 truncate"><svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Kunduchi Beach Gardens</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors shrink-0">Manage &rsaquo;</div>
                                </div>
                            </div>
                        </div>

                        {/* RSVP Status - col-span-1 */}
                        <div className="col-span-1 bg-white rounded-[1rem] p-4 shadow-sm border border-slate-100 flex flex-col justify-between overflow-hidden">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900">RSVP Status</h3>
                                        <p className="text-[10px] text-slate-500 font-medium">Overall guest responses.</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#16A34A]"></span> Attending</span>
                                            <span className="text-[11px] font-black text-slate-900">13 <span className="text-slate-400 font-bold ml-1">(50%)</span></span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                            <div className="h-full bg-[#16A34A] rounded-full" style={{ width: '50%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending RSVP</span>
                                            <span className="text-[11px] font-black text-slate-900">7</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '27%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Declined</span>
                                            <span className="text-[11px] font-black text-slate-900">6</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                            <div className="h-full bg-slate-400 rounded-full" style={{ width: '23%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                                <div className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100 shadow-sm flex flex-col justify-center">
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Response Rate</p>
                                    <p className="text-sm font-black text-slate-800">73%</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100 shadow-sm flex flex-col justify-center">
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Check-In Rate</p>
                                    <p className="text-sm font-black text-slate-800">35%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    {/* MOBILE DASHBOARD MOCKUP OVERLAY */}
    <div className="scroll-animate-phone absolute -bottom-8 -right-4 md:-bottom-12 md:-right-8 w-48 md:w-64 hidden sm:block group-hover:-translate-y-4 transition-transform duration-700 delay-100 z-30">
        <div className="rounded-[2rem] md:rounded-[2.5rem] shadow-2xl hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] relative aspect-[9/19.5] bg-[#F4F6F9] hover:scale-[1.03] hover:-translate-y-3 hover:-rotate-1 transition-all duration-400 ease-out cursor-pointer">
            {/* Dynamic Island Notch */}
            <div className="absolute top-2 md:top-2.5 left-1/2 -translate-x-1/2 w-16 md:w-20 h-4 md:h-5 bg-black rounded-full z-20"></div>

            <div className="w-full h-full bg-[#F4F6F9] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden relative flex flex-col font-sans">
                {/* Mobile Header (no hamburger, #07192F color) */}
                <div className="bg-[#0B2545] px-4 md:px-5 py-3 md:py-3.5 flex items-center justify-between pt-7 md:pt-9 z-10 shadow-sm border-b border-[#173860]">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-black text-white text-[10px] md:text-[11px] shadow-sm">K</div>
                    </div>
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-white/10 text-slate-300 border border-white/20 flex items-center justify-center font-bold text-[9px] md:text-[10px]">D</div>
                </div>

                {/* Mobile Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col p-3 md:p-4 gap-3 md:gap-4 relative no-scrollbar">
                    
                    {/* Greeting Mobile */}
                    <div className="bg-white rounded-[1rem] p-3 text-center shadow-sm border border-slate-100 shrink-0 flex flex-col items-center justify-center min-h-[60px]">
                        <h4 className="font-black text-slate-900 text-[11px] md:text-sm">Good evening, David</h4>
                        <p className="text-slate-500 text-[9px] md:text-[10px] mt-0.5">Select or create an event</p>
                    </div>

                    {/* Quick Stats Grid Mobile */}
                    <div className="grid grid-cols-2 gap-2 md:gap-3 shrink-0">
                        <div className="bg-white rounded-[1rem] p-2 md:p-3 border border-slate-100 shadow-sm text-center flex flex-col justify-center">
                            <p className="text-[8px] md:text-[9px] text-slate-500 font-bold mb-0.5 uppercase tracking-wider">Events</p>
                            <p className="text-sm md:text-lg font-black text-slate-900">3</p>
                        </div>
                        <div className="bg-white rounded-[1rem] p-2 md:p-3 border border-slate-100 shadow-sm text-center flex flex-col justify-center">
                            <p className="text-[8px] md:text-[9px] text-slate-500 font-bold mb-0.5 uppercase tracking-wider">Guests</p>
                            <p className="text-sm md:text-lg font-black text-slate-900">26</p>
                        </div>
                        <div className="bg-white rounded-[1rem] p-2 md:p-3 border border-slate-100 shadow-sm text-center flex flex-col justify-center">
                            <p className="text-[8px] md:text-[9px] text-slate-500 font-bold mb-0.5 uppercase tracking-wider">Attending</p>
                            <p className="text-sm md:text-lg font-black text-emerald-600">13</p>
                        </div>
                        <div className="bg-white rounded-[1rem] p-2 md:p-3 border border-slate-100 shadow-sm text-center flex flex-col justify-center">
                            <p className="text-[8px] md:text-[9px] text-slate-500 font-bold mb-0.5 uppercase tracking-wider">Check-in</p>
                            <p className="text-sm md:text-lg font-black text-emerald-600">9</p>
                        </div>
                    </div>

                    {/* Your Events List Mobile - Structured Nicely */}
                    <div className="bg-white rounded-[1rem] border border-slate-100 flex-1 overflow-hidden flex flex-col shadow-sm">
                        <div className="px-3 py-2 border-b border-slate-50 font-bold text-[9px] md:text-xs text-slate-900">Your Events</div>
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {/* Mobile Event 1 */}
                            <div className="px-3 py-2.5 border-b border-slate-50 flex items-center gap-2.5">
                                <div className="bg-slate-50 border border-slate-100 rounded-lg text-center shrink-0 w-9 py-1 shadow-sm">
                                    <div className="text-[6px] md:text-[7px] font-bold text-slate-500 uppercase">Nov</div>
                                    <div className="text-[10px] md:text-xs font-black text-slate-900">20</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[9px] md:text-[11px] text-slate-900 truncate">Fintech East Africa Summit</p>
                                    <div className="flex items-center mt-1">
                                        <span className="text-[7px] md:text-[8px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-100">Corporate Conference</span>
                                    </div>
                                </div>
                            </div>
                            {/* Mobile Event 2 */}
                            <div className="px-3 py-2.5 flex items-center gap-2.5">
                                <div className="bg-slate-50 border border-slate-100 rounded-lg text-center shrink-0 w-9 py-1 shadow-sm">
                                    <div className="text-[6px] md:text-[7px] font-bold text-slate-500 uppercase">Oct</div>
                                    <div className="text-[10px] md:text-xs font-black text-slate-900">5</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[9px] md:text-[11px] text-slate-900 truncate">CRDB Bank Summit</p>
                                    <div className="flex items-center mt-1">
                                        <span className="text-[7px] md:text-[8px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-100">Corporate Gala</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Bottom Nav */}
                <div className="bg-white border-t border-slate-200 h-10 md:h-14 flex justify-around items-center px-3 pb-1 md:pb-2 shrink-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
                    <div className="flex flex-col items-center gap-1 text-emerald-600 cursor-pointer">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-slate-400 relative group cursor-pointer">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#16a34a] text-white flex items-center justify-center -mt-5 shadow-lg shadow-emerald-500/30 border-[3px] border-white group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Metrics */}
                <section className="py-10 border-y border-slate-200/60 bg-white/50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-200/50">
                            <div className="text-center px-4">
                                <h3 className="text-4xl font-black text-[#16A34A] tracking-tight drop-shadow-sm">
                                    <AnimatedCounter end={10} suffix="K+" />
                                </h3>
                                <p className="text-sm font-semibold text-slate-500 mt-2 uppercase tracking-wide">{t("Mialiko Iliyotumwa")}</p>
                            </div>
                            <div className="text-center px-4">
                                <h3 className="text-4xl font-black text-[#16A34A] tracking-tight drop-shadow-sm">
                                    <AnimatedCounter end={99.9} decimals={1} suffix="%" />
                                </h3>
                                <p className="text-sm font-semibold text-slate-500 mt-2 uppercase tracking-wide">{t("Uhakika wa Kufika")}</p>
                            </div>
                            <div className="text-center px-4">
                                <h3 className="text-4xl font-black text-[#16A34A] tracking-tight drop-shadow-sm">
                                    <AnimatedCounter end={24} suffix="/7" />
                                </h3>
                                <p className="text-sm font-semibold text-slate-500 mt-2 uppercase tracking-wide">{t("Huduma kwa Wateja")}</p>
                            </div>
                            <div className="text-center px-4">
                                <h3 className="text-4xl font-black text-[#16A34A] tracking-tight drop-shadow-sm">
                                    <AnimatedCounter end={0.2} decimals={1} suffix="s" />
                                </h3>
                                <p className="text-sm font-semibold text-slate-500 mt-2 uppercase tracking-wide">{t("Kuscan Mlangoni")}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 bg-white relative">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-2xl mx-auto mb-20 scroll-animate">
                            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 mb-4 font-display pb-1">{t("All-in-One Event Toolkit")}</h2>
                            <p className="text-lg text-slate-500">{t("Kila kitu unachokihitaji kurahisisha usimamizi wa sherehe yako kuanzia maandalizi hadi siku ya tukio yenyewe.")}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { icon: Smartphone, title: t("Kadi za Kidigitali"), desc: t("Tengeneza kadi zenye muonekano wa kisasa. Jumuisha namba ya kiti, ramani, na QR Code kwa ajili ya mlangoni.") },
                                { icon: MessageCircle, title: t("WhatsApp & SMS"), desc: t("Watumie wageni wako kadi zao moja kwa moja kwenye namba zao za simu kwa uharaka na uhakika mkubwa.") },
                                { icon: HandCoins, title: t("Usimamizi wa Michango"), desc: t("Dhibiti ahadi na michango kwa urahisi. Tuma jumbe za kukumbusha wageni kuhusu ahadi zao kiotomatiki.") },
                                { icon: Users, title: t("Majibu ya Wageni (RSVP)"), desc: t("Pata majibu ya uhakika (RSVP) moja kwa moja kwenye mfumo wakati wageni wanapothibitisha ushiriki wao.") },
                                { icon: QrCode, title: t("Kuscan QR Mlangoni"), desc: t("Ondoa kero ya watu wasioalikwa. Tumia simu kuscan QR Code mlangoni na kuhakiki taarifa za mgeni sekunde chache tu.") },
                                { icon: ChartPie, title: t("Ripoti za Moja kwa Moja"), desc: t("Fuatilia kwa ukaribu idadi ya mialiko iliyofika, majibu ya RSVP, na wageni waliokwisha ingia ukumbini.") }
                            ].map((feature, idx) => (
                                <div key={idx} className={`group p-8 rounded-[2rem] scroll-animate bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300`}>
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-kardovo-blue-dark shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-emerald-500 transition-transform duration-300">
                                        <feature.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                    <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section id="how-it-works" className="py-24 bg-white relative border-t border-slate-100">
                    <div className="absolute inset-0 bg-slate-50/50 pointer-events-none"></div>
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center max-w-2xl mx-auto mb-20 scroll-animate">
                            
                            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 mb-4 font-display pb-1">{t("Jinsi Inavyofanya Kazi")}</h2>
                            <p className="text-lg text-slate-500">{t("Hatua tano tu zinazokutenganisha wewe na usimamizi bora wa tukio lako kidigitali.")}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-6 relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-[2px] bg-slate-200 border-t-2 border-dashed border-slate-200"></div>
                            
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
                                    <div className="w-24 h-24 rounded-full shadow-xl shadow-slate-200/50 flex items-center justify-center text-3xl font-black text-white bg-[#0B2545] mb-8 relative z-10 border-4 border-slate-50 group-hover:scale-110 group-hover:bg-[#16A34A] transition-all duration-300">
                                        {step.num}
                                    </div>
                                    <h3 className="text-xl font-bold text-[#0B2545] mb-3">{step.title}</h3>
                                    <p className="text-slate-500 leading-relaxed text-sm md:text-base">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PRICING */}
                <section id="payment" className="py-24 bg-[#F8FAFC]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-2xl mx-auto mb-20 scroll-animate">
                            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 mb-4 font-display pb-1">{t("Bei Zetu ni Nafuu")}</h2>
                            <p className="text-lg text-slate-500">{t("Chagua kifurushi kinachoendana na mahitaji ya ukubwa wa tukio lako.")}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                            {/* Basic */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow flex flex-col h-full">
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
                                    Chagua Kifurushi
                                </button>
                            </div>

                            {/* Standard (Featured) */}
                            <div className="bg-[#0B2545] rounded-[2.5rem] p-8 border border-[#173860] shadow-2xl scroll-animate transform lg:-translate-y-4 relative z-10 text-white flex flex-col h-full">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#16A34A] text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg border border-[#16A34A]">
                                    Pendekezo
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
                                    Chagua Kifurushi
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
                                    Chagua Kifurushi
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
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 text-center">
                                    <p className="text-slate-500 text-sm font-medium">{t("Mfano:")}</p>
                                    <p className="text-[#0B2545] text-sm font-bold">kardovo.co.tz/kj/A8L0001</p>
                                </div>
                                <button onClick={() => openAuthModal('register')} className="block w-full mt-auto py-3.5 text-center rounded-xl bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 transition-colors cursor-pointer">
                                    Chagua Kifurushi
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
            <footer className="bg-[#0B2545] text-slate-300 py-6 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
                    {/* Far Left: Logo */}
                    <div className="flex-1 flex justify-start opacity-90 hover:opacity-100 transition-opacity">
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer focus:outline-none">
                            <KardovoLogo showText={true} light={true} />
                        </button>
                    </div>
                    
                    {/* Center: Copyright */}
                    <div className="flex-1 flex justify-center text-slate-500 font-medium text-xs md:text-sm text-center">
                        &copy; {new Date().getFullYear()} Kardovo. {t("Haki zote zimehifadhiwa.")}
                    </div>
                    
                    {/* Far Right: Links */}
                    <div className="flex-1 flex justify-end gap-6 font-medium text-sm text-slate-400">
                        <Link href="/terms" className="hover:text-white transition-colors">{t("Vigezo na Masharti")}</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">{t("Sera ya Faragha")}</Link>
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
