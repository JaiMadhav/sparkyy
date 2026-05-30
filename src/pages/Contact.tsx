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
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Contact Operations
            </h1>
            <p className="text-2xl text-slate-300 max-w-3xl mx-auto font-normal">
              Reach out for dispatch support, fleet partnerships, or infrastructure inquiries.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-900/30 p-3 rounded-xl">
                  <Mail className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xl mb-1">Support & Dispatch</h3>
                  <p className="text-slate-300 text-lg">support@sparkev.in</p>
                  <p className="text-slate-300 text-lg">dispatch@sparkev.in</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-emerald-900/30 p-3 rounded-xl">
                  <Phone className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xl mb-1">Commercial Fleet</h3>
                  <p className="text-slate-300 text-lg">fleets@sparkev.in</p>
                  <p className="text-slate-300 text-lg">Mon-Sat, 9AM - 6PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-emerald-900/30 p-3 rounded-xl">
                  <MapPin className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xl mb-1">Corporate Office</h3>
                  <p className="text-slate-300 text-lg leading-relaxed">
                    Okhla Industrial Estate,<br />
                    Phase III, New Delhi,<br />
                    110020
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-base font-semibold text-slate-300">Full Name</label>
                      <Input placeholder="Ravi Kumar" className="text-base py-6" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-base font-semibold text-slate-300">Work Email</label>
                      <Input type="email" placeholder="ravi@company.in" className="text-base py-6" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-base font-semibold text-slate-300">Topic</label>
                    <Input placeholder="Fleet partnership inquiry" className="text-base py-6" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-base font-semibold text-slate-300">Details</label>
                    <textarea 
                      className="w-full min-h-[150px] resize-none bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
                      placeholder="Please provide operational details or specific requirements..."
                    ></textarea>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 text-lg font-bold rounded-xl mt-4">
                    Submit Request
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
