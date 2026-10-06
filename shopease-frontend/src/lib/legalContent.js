import { COMPANY, COMPANY_ADDRESS, SUPPORT_EMAIL } from './legalConfig';

/**
 * Each document is a list of sections: { id, title, body } where body is an array of
 * paragraphs (strings) or { list: [...] } blocks.
 * The text describes how this app actually works: Paystack payments, vendor-shipped orders that the
 * customer confirms on arrival, unpaid orders cancelled after about 2 hours, manual refunds.
 */

export const TERMS = [
  {
    id: 'about',
    title: 'About ShopEase and these terms',
    body: [
      `ShopEase is an online marketplace run by ${COMPANY} ("we", "us"). It connects independent vendors, who list and sell products, with customers who buy them. These Terms of Service apply whenever you browse, create an account or place an order.`,
      'By creating an account or placing an order you agree to these terms and to our Privacy Policy. If you do not agree, please do not use ShopEase. You must be at least 18 years old, or use ShopEase with the involvement of a parent or guardian.',
      'Each product is sold by the vendor named on its page. We provide the platform, take payment and help resolve problems, but the vendor is responsible for the product and for sending it to you.',
    ],
  },
  {
    id: 'accounts',
    title: 'Your account',
    body: [
      'Give us accurate information and keep it up to date. You are responsible for everything done through your account, so keep your password private and use "Forgot password?" if you think someone else knows it.',
      'You may have one account per email address. Do not share your account or create accounts to get around a suspension.',
    ],
  },
  {
    id: 'orders',
    title: 'Buying on ShopEase',
    body: [
      'Prices are shown in Nigerian naira (NGN). The total you pay, including everything you are charged for the order, is shown at checkout before you pay.',
      'When you place an order, we reserve the items for you, but the order is only confirmed when your payment has been verified. Orders that are not paid are cancelled automatically after about 2 hours and the items go back on sale.',
      'One order can contain items from several vendors. Each vendor prepares and ships its own items, so parcels may arrive on different days. Delivery times and delivery arrangements are set by the vendor.',
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    body: [
      'Payments are processed by Paystack. You pay on Paystack\'s secure page using the methods it offers (for example card, bank transfer or USSD). We never see or store your full card details. We keep the payment reference, amount and status so we can match the payment to your order.',
      'If a payment fails or is not completed, your order stays unpaid and you can try again from your order page until the order expires.',
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery and confirming arrival',
    body: [
      'After you pay, the vendor prepares your order and marks it as shipped. You will see each step on your order page and in your notifications.',
      'When your items arrive, please open the order and tap "I received my order". This tells the vendor the delivery is complete and unlocks reviews. If something is wrong with the delivery, contact us before you confirm.',
    ],
  },
  {
    id: 'refunds',
    title: 'Cancellations, returns and refunds',
    body: [
      { list: [
        'You can cancel an order yourself while it is still unpaid.',
        'A vendor may cancel a paid order before it ships (for example when an item is out of stock). If that happens, you will be refunded in full to the original payment method.',
        'If an item arrives damaged, faulty or not as described, contact us within 7 days of receiving it and we will work with the vendor on a replacement, repair or refund.',
        'Refunds are processed by us through Paystack. Depending on your bank, they can take several business days to show in your account.',
      ] },
      'Nothing in these terms limits any rights you have under Nigerian consumer protection law.',
    ],
  },
  {
    id: 'reviews',
    title: 'Reviews and content',
    body: [
      'Only customers whose order has been paid can review a product, and each product can be reviewed once. Reviews must be honest, based on your own experience and must not contain abuse, personal information, advertising or anything unlawful.',
      'By posting a review you allow us to display it on ShopEase. We may remove content that breaks these terms.',
    ],
  },
  {
    id: 'use',
    title: 'Acceptable use',
    body: [
      'Do not use ShopEase to commit fraud, to sell or buy unlawful goods, to harass anyone, to collect other people\'s data, or to disrupt or probe the security of the service (including by bypassing limits we put in place). We may block activity that looks abusive.',
    ],
  },
  {
    id: 'suspension',
    title: 'Suspension and closing accounts',
    body: [
      'We may suspend or close an account, or hide a vendor\'s store, if these terms are broken, if we suspect fraud, or if the law requires it. You can ask us to close your account at any time by emailing us.',
    ],
  },
  {
    id: 'liability',
    title: 'Our responsibility',
    body: [
      'We work to keep ShopEase running and accurate, but we provide it "as is" and cannot promise it will always be available or error free. Vendors, not us, are responsible for the products they list and sell.',
      'To the extent the law allows, our total liability to you for any claim connected with an order is limited to the amount you paid for that order. We do not exclude liability that cannot legally be excluded, such as liability for fraud or for death or personal injury caused by negligence.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: [
      'We may update these terms from time to time. The date at the top of this page shows when they last changed. If you keep using ShopEase after a change, you accept the new terms. For significant changes we will tell you by email or in the app.',
    ],
  },
  {
    id: 'law',
    title: 'Governing law and disputes',
    body: [
      'These terms are governed by the laws of the Federal Republic of Nigeria, and the Nigerian courts have jurisdiction, unless mandatory law says otherwise. If you have a complaint, please contact us first so we can try to resolve it.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact us',
    body: [
      `Questions about these terms? Email ${SUPPORT_EMAIL}.${COMPANY_ADDRESS ? ` Our address: ${COMPANY_ADDRESS}.` : ''}`,
    ],
  },
];

export const PRIVACY = [
  {
    id: 'who',
    title: 'Who we are',
    body: [
      `${COMPANY} runs ShopEase and is the "controller" of your personal data, which means we decide how it is used. This policy explains what we collect, why, and what your rights are under Nigerian data protection law, including the Nigeria Data Protection Act 2023.`,
      `Contact: ${SUPPORT_EMAIL}${COMPANY_ADDRESS ? `, ${COMPANY_ADDRESS}` : ''}.`,
    ],
  },
  {
    id: 'collect',
    title: 'What we collect',
    body: [
      { list: [
        'Account details: your name, email address, phone number (optional) and a password, which we store only in scrambled (hashed) form.',
        'Orders and delivery: the items you buy, order totals and status, your delivery address and the phone number you give at checkout.',
        'Payments: the Paystack payment reference, amount and status. Card and bank details are entered on Paystack and are never stored by us.',
        'Vendors: store name, description, logo link, product listings and orders for your products.',
        'Things you create: reviews, wishlist items, your cart and the notifications we send you.',
        'Technical data: your IP address and basic request information, used to keep the service secure and to limit abuse, and standard server logs.',
      ] },
    ],
  },
  {
    id: 'use',
    title: 'Why we use your data',
    body: [
      { list: [
        'To provide ShopEase: create your account, process and deliver orders, take payment and send order updates (this is necessary to perform our contract with you).',
        'To keep ShopEase safe: prevent fraud and abuse, secure accounts and fix problems (our legitimate interest).',
        'To meet legal duties such as tax, accounting and responding to lawful requests.',
        'To send service messages such as order updates and password-reset emails. We do not send marketing emails.',
      ] },
    ],
  },
  {
    id: 'share',
    title: 'Who we share it with',
    body: [
      { list: [
        'Vendors: when you buy from a vendor, they receive your name, phone number, delivery address and the items ordered, so they can deliver. Vendors must use this only to fulfil your order.',
        'Paystack, which processes payments.',
        'Our email provider, which delivers emails such as order updates and password resets.',
        'Cloud hosting providers that run our website, servers and database.',
        'Authorities or advisers, where the law requires it or to protect our rights.',
      ] },
      'We do not sell your personal data. Some of these providers may process data outside Nigeria; where that happens we take steps to make sure your data stays protected.',
    ],
  },
  {
    id: 'storage',
    title: 'Cookies and browser storage',
    body: [
      'We use your browser\'s local storage, not advertising cookies. It keeps you signed in and remembers your guest cart. These are essential for the site to work. We do not use advertising or analytics trackers.',
      'Our pages load fonts from Google Fonts, so your browser contacts Google\'s servers when a page loads.',
    ],
  },
  {
    id: 'retention',
    title: 'How long we keep data',
    body: [
      'We keep your account data while your account is open. Order and payment records are kept for as long as the law requires for tax, accounting and dispute purposes. Password-reset links expire after 30 minutes and are deleted soon after. When data is no longer needed, we delete or anonymise it.',
    ],
  },
  {
    id: 'security',
    title: 'Security',
    body: [
      'Connections to ShopEase are encrypted (HTTPS), passwords are hashed, access to data is limited by role, and we limit repeated login attempts. No system is perfectly secure, so please use a strong, unique password. If you find a security problem, tell us at the address below.',
    ],
  },
  {
    id: 'rights',
    title: 'Your rights',
    body: [
      'You can ask us to give you a copy of your data, correct it, delete it, restrict or object to how we use it, and to move it to another service. Where we rely on your consent, you can withdraw it at any time. To use any of these rights, email us; we may ask you to confirm your identity first.',
      'If you are unhappy with how we handle your data, you can complain to us, and you also have the right to complain to the Nigeria Data Protection Commission.',
    ],
  },
  {
    id: 'children',
    title: 'Children',
    body: ['ShopEase is not meant for anyone under 18, and we do not knowingly collect data from children.'],
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: ['We will update this page when our practices change and show the date at the top. For significant changes we will let you know by email or in the app.'],
  },
  {
    id: 'contact',
    title: 'Contact us',
    body: [`Privacy questions or requests: ${SUPPORT_EMAIL}.`],
  },
];

export const VENDORS = [
  {
    id: 'eligibility',
    title: 'Who can sell',
    body: [
      'You must be at least 18, able to enter into a contract, and legally allowed to sell the goods you list. Give accurate store and contact details. Each account may run one store. These Vendor Terms apply together with the Terms of Service and Privacy Policy.',
    ],
  },
  {
    id: 'listings',
    title: 'Your listings',
    body: [
      { list: [
        'Describe products honestly and accurately, with genuine photos, correct prices in naira and correct stock levels.',
        'Do not list unlawful, counterfeit, stolen, dangerous or otherwise prohibited items, or items you do not have the right to sell.',
        'Do not create fake orders or reviews, or pay for reviews, to improve your ratings.',
      ] },
      'We may remove listings that break these rules.',
    ],
  },
  {
    id: 'fulfilment',
    title: 'Orders and fulfilment',
    body: [
      { list: [
        'Start work on an order only once it shows as paid. Mark it as processing when you begin preparing it, and as shipped when you hand it to the courier or deliver it.',
        'Ship promptly and pack items so they arrive safely. Keep proof of dispatch.',
        'The customer confirms arrival in the app. If a customer does not confirm, the order stays "shipped"; contact support if you need help closing it.',
        'Orders can contain items from several vendors. Only fulfil your own items.',
      ] },
    ],
  },
  {
    id: 'stock',
    title: 'Stock',
    body: [
      'Keep stock accurate. Items are held for customers while their order is unpaid and are released if the order is cancelled or expires. Repeatedly cancelling paid orders because of poor stock control may lead to suspension.',
    ],
  },
  {
    id: 'payouts',
    title: 'Fees and payouts',
    body: [
      'At the time of writing, ShopEase does not charge vendors a listing fee or commission. Customer payments are collected by us through Paystack. We pay vendors for completed orders on the schedule and by the method agreed with each vendor in writing. Payouts may be held for orders that are disputed or under review.',
      'We may introduce fees in future; we will give reasonable advance notice before they apply to you.',
    ],
  },
  {
    id: 'refunds',
    title: 'Cancellations, returns and refunds',
    body: [
      'You must honour the cancellation, return and refund rules in the Terms of Service. If a paid order is cancelled, or a return is approved, the customer is refunded and the amount can be deducted from your payouts.',
    ],
  },
  {
    id: 'data',
    title: 'Customer data',
    body: [
      'Use customers\' names, phone numbers and addresses only to fulfil their orders. Keep them confidential, do not market to customers or share their data, and follow the Nigeria Data Protection Act.',
    ],
  },
  {
    id: 'suspension',
    title: 'Suspension and closing your store',
    body: [
      'We may suspend a store for breaking these terms, fraud, repeated complaints or legal reasons. While suspended, your products are hidden and you cannot log in. Pending orders will be handled case by case. You can ask to close your store at any time, after completing your open orders.',
    ],
  },
  {
    id: 'responsibility',
    title: 'Responsibility',
    body: [
      'You are responsible for the products you sell, including their quality, legality and delivery. You agree to cover reasonable losses we suffer because of your breach of these terms or the law.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact us',
    body: [`Questions about selling on ShopEase: ${SUPPORT_EMAIL}.`],
  },
];

export const HELP = [
  { id: 'order', title: 'How do I place an order?', body: ['Add products to your cart, open the cart, sign in or create a customer account, then go to checkout, enter your delivery address and pay with Paystack.'] },
  { id: 'pay', title: 'How can I pay?', body: ['Payment happens on Paystack\'s secure page, using the options it offers, such as card, bank transfer or USSD. Your order becomes "Paid" as soon as the payment is verified.'] },
  { id: 'expired', title: 'Why was my order cancelled automatically?', body: ['Unpaid orders are cancelled after about 2 hours so items are not held forever. Just place the order again.'] },
  { id: 'track', title: 'How do I track my order?', body: ['Open Account → Order history and tap "Track order". You also get a notification, shown on the bell icon, at every step: paid, processing, shipped.'] },
  { id: 'arrived', title: 'My order arrived. What now?', body: ['Open the order and tap "I received my order". This tells the vendor the delivery is done and lets you review your products.'] },
  { id: 'cancel', title: 'Can I cancel an order?', body: ['You can cancel while the order is unpaid. Once it is paid, contact support; the vendor can still cancel it before it ships, and you will be refunded.'] },
  { id: 'refund', title: 'How do I get a refund?', body: [`If a paid order is cancelled, or an item arrives damaged or not as described, email ${SUPPORT_EMAIL} with your order number. Refunds go back to the original payment method and can take several business days.`] },
  { id: 'password', title: 'I forgot my password', body: ['On the sign-in page tap "Forgot password?", enter your email and follow the link we send you. The link works for 30 minutes.'] },
  { id: 'sell', title: 'How do I sell on ShopEase?', body: ['Create an account and choose "I want to sell", set up your store, then add your products. Read the Vendor Terms first.'] },
  { id: 'vendor-buy', title: 'Why can\'t I buy with my vendor account?', body: ['Vendor accounts are for selling only. Create a separate customer account, with a different email, to shop.'] },
  { id: 'support', title: 'How do I contact support?', body: [`Email ${SUPPORT_EMAIL} and include your order number if you have one.`] },
];
