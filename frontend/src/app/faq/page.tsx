'use client';

import React from 'react';

const FAQ = () => {
  const faqs = [
    {
      question: 'How does Woolies Watcher work?',
      answer:
        'The site queries product data from a third-party API that updates daily to reflect price changes. This allows me to send email notifications at the start of each day, keeping you informed if your favorite items are discounted or marked up.',
    },
    {
      question:
        "I've been subscribed for a few days but haven't seen any price updates yet?",
      answer:
        'Based on my data, price updates typically occur in bursts, often on Thursday or Friday mornings. Stay tuned!',
    },
    {
      question: "Can't the Woolworths app already do this better?",
      answer:
        "It absolutely can! This is currently a side project with a broader goal: to integrate data from Coles as well. My ultimate aim is to help consumers make informed decisions about where to shop based on prices. If you have any suggestions, I'd love to hear them!",
    },
  ];

  return (
    <section className="w-full bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mx-auto bg-card rounded-xl shadow-xl p-8">
          <h1 className="text-3xl md:text-5xl font-extrabold text-primary mb-16 text-center">
            Frequently Asked Questions
          </h1>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-muted pb-4">
                <h2 className="text-lg md:text-2xl font-bold text-foreground mb-4">
                  {faq.question}
                </h2>
                <p className="text-lg text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
