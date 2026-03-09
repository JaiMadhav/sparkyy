import React from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Pay as you Go",
      price: "₹200",
      description: "Base service fee per session",
      features: [
        "₹12/km dispatch fee",
        "₹20/kWh energy cost",
        "No monthly commitment",
        "24/7 Support",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Spark Pro",
      price: "₹999",
      description: "Monthly subscription",
      features: [
        "Free dispatch within 10km",
        "₹15/kWh discounted energy",
        "Priority scheduling",
        "Dedicated account manager",
      ],
      cta: "Subscribe Now",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For fleet management",
      features: [
        "Bulk pricing discounts",
        "API integration",
        "Custom reporting",
        "Fleet tracking dashboard",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <MainLayout>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Choose the plan that fits your charging needs. No hidden fees, just pure power.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border ${
                  plan.highlighted
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 shadow-xl relative"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.name !== "Enterprise" && (
                    <span className="text-slate-500 dark:text-slate-400 ml-1">
                      {plan.name === "Spark Pro" ? "/mo" : "/session"}
                    </span>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                  {plan.description}
                </p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700"
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
