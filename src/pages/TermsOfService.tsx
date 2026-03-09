import React from "react";
import { MainLayout } from "@/layouts/MainLayout";

export default function TermsOfService() {
  return (
    <MainLayout>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Terms of Service</h1>
          <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-6">
            <p className="text-sm italic">Last Updated: March 2026</p>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the SPARK EV Charging mobile application or website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on SPARK EV Charging's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. Service Terms</h2>
            <p>
              SPARK EV Charging provides mobile electric vehicle charging services. We reserve the right to refuse service to anyone for any reason at any time. We are not responsible for any damage to your vehicle that occurs during the charging process, except in cases of gross negligence.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">4. Payment Terms</h2>
            <p>
              You agree to pay all fees and charges associated with your use of the service. All payments are non-refundable unless otherwise stated. We use third-party payment processors to handle all transactions securely.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">5. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">6. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at legal@sparkev.com.
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
