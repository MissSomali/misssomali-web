"use client";

import { motion } from "framer-motion";
import PillBadge from "@/components/ui/PillBadge";

interface Step {
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "1",
    title: "Create Your Account",
    description: "Create your Miss Somali account to begin your journey and access the application portal.",
  },
  {
    number: "2",
    title: "Submit Your Application",
    description: "Complete the online application and share your background, ambitions, and story with us.",
  },
  {
    number: "3",
    title: "Application Review",
    description: "Our selection team carefully reviews every submission from across the Somali community worldwide.",
  },
  {
    number: "4",
    title: "Selection & Confirmation",
    description: "Selected candidates will receive an official invitation to confirm participation in Miss Somali 2026.",
  },
  {
    number: "5",
    title: "Training & Preparation",
    description: "Contestants receive preparation sessions focused on confidence, presentation, leadership, and cultural representation.",
  },
  {
    number: "6",
    title: "Grand Finale",
    description: "Take the stage in Nairobi, Kenya and compete for the Miss Somali 2026 crown before a live audience.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-[#FAFAFA] py-24 md:py-32 border-t border-[#E8E8E8] overflow-hidden">
      <div className="grid-container relative z-10">
        <div className="grid-12 items-start gap-y-16 lg:gap-y-0">
          
          {/* LEFT COLUMN: Sticky Header */}
          <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-32 lg:pr-8 z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <PillBadge className="mb-6 bg-white border-slate-200 text-[#0B2D6B] shadow-sm">
                How it works
              </PillBadge>
              
              <h2 className="text-[32px] sm:text-[42px] font-semibold text-[#071E4A] tracking-tighter leading-[1.15] mb-6">
                How The Selection Process Works
              </h2>
              
              <p className="text-slate-500 text-base sm:text-lg font-light leading-relaxed">
                Apply, Prepare, Succeed: Embark on an extraordinary journey of cultural pride, leadership, and personal growth. Follow our structured path to represent your heritage on the international stage.
              </p>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Scrolling Timeline */}
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 relative z-10">
            <div className="relative">
              {/* Continuous vertical line behind the nodes */}
              <div className="absolute left-[20px] top-5 bottom-12 w-[2px] -translate-x-1/2 bg-slate-200 z-0" />
              
              {steps.map((step, stepIdx) => (
                <motion.div 
                  key={step.title} 
                  className="relative flex gap-x-6 sm:gap-x-8 z-10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: stepIdx * 0.1 }}
                >
                  
                  {/* Timeline Node */}
                  <div className="relative flex h-10 w-10 flex-none items-center justify-center bg-white border border-[#E8C97A]/50 rounded-full shadow-sm mt-1 z-10 transition-colors duration-300 hover:border-[#0B2D6B]">
                    <span className="text-[#0B2D6B] text-sm font-semibold">{step.number}</span>
                  </div>
                  
                  {/* Step Content */}
                  <div className="pt-1.5 pb-12 sm:pb-16 flex-auto">
                    <span className="text-[11px] font-semibold tracking-[0.15em] text-[#E8C97A] uppercase mb-2 block">
                      Step {step.number}
                    </span>
                    <h3 className="text-[20px] sm:text-[24px] font-semibold leading-tight text-[#071E4A] tracking-tight mb-3">
                      {step.title}
                    </h3>
                    <p className="text-[15px] sm:text-[16px] leading-[1.7] text-slate-500 font-light max-w-lg">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
