import React from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function Contact() {
  return (
    <MainLayout>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Have questions about our service? We're here to help you power up.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
                  <Mail className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Email Us</h3>
                  <p className="text-slate-600 dark:text-slate-400">support@sparkev.com</p>
                  <p className="text-slate-600 dark:text-slate-400">info@sparkev.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
                  <Phone className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Call Us</h3>
                  <p className="text-slate-600 dark:text-slate-400">+91 1800-SPARK-EV</p>
                  <p className="text-slate-600 dark:text-slate-400">Mon-Sun, 24/7 Support</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
                  <MapPin className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Visit Us</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    123, Green Tech Park,<br />
                    Sector 44, Gurugram,<br />
                    Haryana 122003
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                      <Input placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                      <Input type="email" placeholder="john@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
                    <Input placeholder="How can we help?" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                    <textarea 
                      className="w-full min-h-[150px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
