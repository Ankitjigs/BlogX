import { Box, Code2, PenTool, LayoutTemplate } from "lucide-react";

export default function IntegrationsPage() {
  const integrations = [
    { name: "Ghost", status: "Available", icon: <PenTool className="h-8 w-8 text-[#15171A]" /> },
    { name: "WordPress", status: "Available", icon: <LayoutTemplate className="h-8 w-8 text-[#21759B]" /> },
    { name: "Notion", status: "Beta", icon: <Box className="h-8 w-8 text-black dark:text-white" /> },
    { name: "Vercel", status: "Available", icon: <Box className="h-8 w-8 text-black dark:text-white" /> },
    { name: "Shopify", status: "Coming Soon", icon: <Box className="h-8 w-8 text-[#95BF47]" /> },
    { name: "Custom API", status: "Available", icon: <Code2 className="h-8 w-8 text-primary" /> },
  ];

  return (
    <div className="min-h-screen bg-white py-24 sm:py-32 dark:bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Seamless Workflows</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Integrate with the tools you love
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
            BlogX isn&apos;t just a destination, it&apos;s a hub. Connect your content to your existing tech stack without breaking a sweat.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl rounded-3xl bg-slate-50 p-8 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:ring-slate-800">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            {integrations.map((item) => (
              <div key={item.name} className="flex flex-col items-center justify-center space-y-4 rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200 transition-all hover:scale-105 hover:shadow-md dark:bg-slate-900/60 dark:ring-slate-800">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                   {item.icon}
                </div>
                <div>
                   <h3 className="text-base font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                   <span className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                     {item.status}
                   </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
