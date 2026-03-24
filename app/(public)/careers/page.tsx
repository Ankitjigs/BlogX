import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const openings = [
  {
    role: "Senior Full Stack Engineer",
    department: "Engineering",
    location: "Remote (US/EU)",
    type: "Full-time",
  },
  {
    role: "Product Designer",
    department: "Design",
    location: "Remote (Global)",
    type: "Full-time",
  },
  {
    role: "Developer Advocate",
    department: "DevRel",
    location: "Remote (US)",
    type: "Full-time",
  },
  {
    role: "Content Marketing Manager",
    department: "Marketing",
    location: "Remote (Global)",
    type: "Full-time",
  },
];

export default function CareersPage() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-[#0a0a0a] min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Work with us</h2>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
            We are a fully remote team passionate about building the best publishing platform on the internet. We value deep work, asynchronous communication, and craftsmanship.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900/50">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">Our Values</h3>
               <ul className="mt-6 space-y-4 text-slate-600 dark:text-slate-400">
                 <li className="flex gap-x-3"><span className="font-semibold text-slate-900 dark:text-white">Craft over Speed:</span> We take the time to build things right.</li>
                 <li className="flex gap-x-3"><span className="font-semibold text-slate-900 dark:text-white">Async First:</span> We minimize meetings so you can maximize flow state.</li>
                 <li className="flex gap-x-3"><span className="font-semibold text-slate-900 dark:text-white">Ownership:</span> Everyone is a manager of one.</li>
               </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900/50">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">Benefits</h3>
               <ul className="mt-6 space-y-4 text-slate-600 dark:text-slate-400">
                 <li className="flex gap-x-3"><span className="text-primary">✦</span> Competitive salary and equity</li>
                 <li className="flex gap-x-3"><span className="text-primary">✦</span> Healthcare, vision, and dental</li>
                 <li className="flex gap-x-3"><span className="text-primary">✦</span> Unlimited PTO (minimum 3 weeks required)</li>
                 <li className="flex gap-x-3"><span className="text-primary">✦</span> Work from anywhere</li>
               </ul>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-2xl lg:mx-0 lg:max-w-none border-t border-slate-200 pt-16 dark:border-slate-800">
           <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Open Roles</h3>
           <div className="mt-8 flex flex-col gap-4">
             {openings.map((opening) => (
                <div key={opening.role} className="flex flex-col justify-between gap-x-6 gap-y-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200 transition-shadow hover:shadow-md dark:bg-[#111] dark:ring-slate-800 sm:flex-row sm:items-center">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{opening.role}</h4>
                    <div className="mt-1 flex items-center gap-x-4 text-sm text-slate-500">
                      <span>{opening.department}</span>
                      <span className="hidden h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700 sm:block" />
                      <span>{opening.location}</span>
                      <span className="hidden h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700 sm:block" />
                      <span>{opening.type}</span>
                    </div>
                  </div>
                  <Button variant="ghost" className="shrink-0 text-primary hover:bg-primary/10 hover:text-primary">
                    Apply <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
             ))}
           </div>
           
           <div className="mt-10 rounded-2xl bg-primary/5 p-8 text-center ring-1 ring-primary/10 dark:bg-primary/10 dark:ring-primary/20">
             <p className="text-slate-600 dark:text-slate-400">
               Don't see a role that fits? We're always looking for talented people. Send your resume to <a href="mailto:careers@blogx.com" className="font-semibold text-primary hover:underline">careers@blogx.com</a>
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
