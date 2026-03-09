import React from "react";
import { MainLayout } from "@/layouts/MainLayout";

export default function PrivacyPolicy() {
  return (
    <MainLayout>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Privacy Policy</h1>
          <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-6">
            <p className="text-sm italic">Last Updated: March 2026</p>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. Introduction</h2>
            <p>
              SPARK EV Charging ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, such as when you create an account, request a charge, or contact support. This may include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name, email address, and phone number.</li>
              <li>Vehicle information (make, model, license plate).</li>
              <li>Location data (to deliver charging services).</li>
              <li>Payment information (processed securely by our payment partners).</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services.</li>
              <li>Process transactions and send related information.</li>
              <li>Send technical notices, updates, and security alerts.</li>
              <li>Respond to your comments and questions.</li>
              <li>Monitor and analyze trends, usage, and activities.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">4. Data Security</h2>
            <p>
              We implement reasonable administrative, technical, and physical measures to protect the information we collect. However, no security system is impenetrable, and we cannot guarantee the security of our systems 100%.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@sparkev.com.
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
