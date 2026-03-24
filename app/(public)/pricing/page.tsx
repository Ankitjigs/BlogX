"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { tiers } from "@/data/tiers";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function PricingCard({ tier }: { tier: (typeof tiers)[0] }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex h-full flex-col pt-12">
      <div
        className={classNames(
          "absolute left-0 right-0 z-0 flex h-[4rem] items-start justify-center rounded-t-[2rem] pt-3 text-sm font-semibold transition-all duration-300 ease-out",
          tier.idealColor,
          isHovered ? "top-0 opacity-100" : "top-12 opacity-0",
        )}
      >
        {tier.idealFor}
      </div>

      <div
        className={classNames(
          "pointer-events-none absolute bottom-0 left-0 right-0 z-20 rounded-[2rem] ring-inset transition-all duration-300 ease-out",
          tier.borderColor,
          isHovered ? "top-0 opacity-100 ring-2" : "top-12 opacity-0 ring-0",
        )}
      />

      <div
        className={classNames(
          "relative z-10 flex h-full flex-col rounded-[2rem] p-8 xl:p-10 transition-colors duration-300",
          tier.featured
            ? "bg-slate-900 shadow-2xl shadow-primary/20 dark:bg-slate-800"
            : "bg-white shadow-lg dark:bg-slate-900/80",
          isHovered
            ? ""
            : tier.featured
              ? "ring-1 ring-inset ring-slate-700 dark:ring-slate-300"
              : "ring-1 ring-inset ring-slate-200 dark:ring-slate-800",
        )}
      >
        <div className="flex items-center justify-between gap-x-4">
          <h3
            id={tier.id}
            className={classNames(
              tier.featured ? "text-white" : "text-slate-900 dark:text-white",
              "text-lg font-semibold leading-8",
            )}
          >
            {tier.name}
          </h3>
          {tier.featured ? (
            <p className="rounded-full bg-primary/20 px-2.5 py-1 text-xs font-semibold leading-5 text-primary-foreground dark:text-primary">
              Most popular
            </p>
          ) : null}
        </div>
        <p
          className={classNames(
            tier.featured
              ? "text-slate-300"
              : "text-slate-600 dark:text-slate-400",
            "mt-4 text-sm leading-6",
          )}
        >
          {tier.description}
        </p>
        <p className="mt-6 flex items-baseline gap-x-1">
          <span
            className={classNames(
              tier.featured ? "text-white" : "text-slate-900 dark:text-white",
              "text-4xl font-bold tracking-tight",
            )}
          >
            {tier.priceMonthly}
          </span>
          <span
            className={classNames(
              tier.featured ? "text-slate-400" : "text-slate-500",
              "text-sm font-semibold leading-6",
            )}
          >
            /month
          </span>
        </p>
        <Link href={tier.href} className="mt-6 block">
          <Button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            className={classNames(
              "w-full rounded-xl py-6 font-semibold transition-all duration-300 border-transparent",
              tier.featured
                ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                : isHovered
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-primary/10 text-primary hover:bg-primary/20",
            )}
          >
            Get started today
          </Button>
        </Link>
        <ul
          role="list"
          className={classNames(
            tier.featured
              ? "text-slate-300"
              : "text-slate-600 dark:text-slate-400",
            "mt-8 flex-1 space-y-3 text-sm leading-6 xl:mt-10",
          )}
        >
          {tier.features.map((feature) => (
            <li key={feature} className="flex gap-x-3">
              <Check
                className={classNames(
                  tier.featured
                    ? "text-primary-foreground dark:text-primary"
                    : "text-primary",
                  "h-6 w-5 flex-none",
                )}
                aria-hidden="true"
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white py-24 sm:py-32 dark:bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Pricing
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Simple pricing for everyone
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-slate-600 dark:text-slate-400">
          Whether you&apos;re just starting out or running a massive
          publication, we have a plan that fits your needs.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-16 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
          {tiers.map((tier) => (
            <PricingCard key={tier.id} tier={tier} />
          ))}
        </div>
      </div>
    </div>
  );
}
