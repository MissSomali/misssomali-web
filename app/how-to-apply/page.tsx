"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PillBadge from "@/components/ui/PillBadge";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Check,
  Camera,
  CreditCard,
  FileText,
  ShieldCheck,
  Award,
  Sparkles,
  Globe,
  ChevronDown,
  ArrowRight
} from "lucide-react";

// Framer Motion Animation Variants
const fadeInContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const fadeInUpItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  }
};

// Data Structures
const eligibilityCriteria = [
  "You are of Somali heritage",
  "You are between 19 and 24 years old",
  "You are single and have no children",
  "You are at least 5'3\" (160cm) tall",
  "You are willing to represent Miss Somali with respect and professionalism",
  "Tattoos are allowed as long as they are not visible in pageant attire"
];

const requirements = [
  {
    title: "12 professional photos",
    desc: "Clear, high quality, recent"
  },
  {
    title: "Application fee of $250",
    desc: "Paid during the application process"
  },
  {
    title: "Valid ID",
    desc: "Passport or national ID showing your date of birth"
  },
  {
    title: "A short personal statement",
    desc: "Who you are and why you are applying"
  }
];

const steps = [
  {
    step: "01",
    title: "Check Your Eligibility",
    desc: "Read the requirements above and make sure you qualify."
  },
  {
    step: "02",
    title: "Fill Out The Form",
    desc: "Complete the online application form. It takes about 10 minutes."
  },
  {
    step: "03",
    title: "Upload Your Photos",
    desc: "Upload your 12 photos directly in the form."
  },
  {
    step: "04",
    title: "Pay The Application Fee",
    desc: "Pay the $250 application fee to complete your submission."
  },
  {
    step: "05",
    title: "Wait To Hear From Us",
    desc: "Only shortlisted applicants will be contacted. If you are selected, we will reach out directly."
  }
];

const postApply = [
  {
    title: "Training and Mentorship",
    desc: "Confidence, presentation, public speaking",
    icon: Award
  },
  {
    title: "Cultural Showcase",
    desc: "Celebrating Somali heritage through fashion and talent",
    icon: Sparkles
  },
  {
    title: "Grand Finale",
    desc: "Compete for the Miss Somali 2026 crown in Nairobi, Kenya",
    icon: Globe
  }
];

const faqs = [
  {
    id: 1,
    q: "Is there an application fee?",
    a: "Yes. The application fee is $250. Payment details will be shared in the form."
  },
  {
    id: 2,
    q: "Can I apply if I live outside Africa?",
    a: "Yes. Miss Somali is open to Somali women from anywhere in the world."
  },
  {
    id: 3,
    q: "Will everyone be contacted after applying?",
    a: "No. Only shortlisted applicants will be contacted for the next stage."
  },
  {
    id: 4,
    q: "What if I am not selected this year?",
    a: "You are welcome to apply again next year as long as you still meet the age requirement."
  }
];

export default function HowToApplyPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 overflow-x-hidden">
        {/* HERO SECTION */}
        <section className="relative w-full py-28 md:py-36 flex flex-col overflow-hidden bg-gradient-to-b from-[#0B2D6B] via-[#0D3A8A] to-[#071E4A]">
          {/* Ambient Glows and Grid */}
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#071E4A_95%)] z-10" />
            <div
              className="absolute inset-0 opacity-10 pointer-events-none z-15"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(232, 201, 122, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(232, 201, 122, 0.08) 1px, transparent 1px)`,
                backgroundSize: "45px 45px"
              }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E8C97A]/5 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="relative w-full z-20">
            <div className="grid-container">
              <motion.div
                className="max-w-3xl mx-auto text-center flex flex-col items-center"
                initial="hidden"
                animate="visible"
                variants={fadeInContainer}
              >
                {/* Gold Pill Badge */}
                <motion.div variants={fadeInUpItem} className="mb-6">
                  <PillBadge variant="gold">Miss Somali 2026</PillBadge>
                </motion.div>

                {/* Main Heading (Never heavy font, clean and light weight tracking) */}
                <motion.h1
                  className="text-[38px] md:text-[56px] font-semibold text-white tracking-[-0.02em] leading-[1.1] mb-6"
                  variants={fadeInUpItem}
                >
                  How To Apply
                </motion.h1>

                {/* Luxury Divider */}
                <motion.div
                  className="w-16 h-[2px] bg-[#E8C97A] mb-6 rounded-full"
                  variants={fadeInUpItem}
                />

                {/* Announcement Copy */}
                <motion.p
                  className="text-[18px] md:text-[22px] font-light text-[#F5F0E8]/90 tracking-wide mb-10"
                  variants={fadeInUpItem}
                >
                  Applications For Miss Somali 2026 Are Now Open.
                </motion.p>

                {/* Primary CTA */}
                <motion.div variants={fadeInUpItem} className="w-full sm:w-auto">
                  <PrimaryButton href="/portal">Apply Now</PrimaryButton>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ELIGIBILITY SECTION ("Can You Apply?") */}
        <section id="eligibility" className="bg-[#FFFFFF] py-20 md:py-28 border-b border-[#0B2D6B]/5">
          <div className="grid-container">
            <div className="grid-12 items-start gap-y-12 lg:gap-x-12">
              
              {/* Left Column: Heading */}
              <motion.div
                className="col-span-12 lg:col-span-5 text-left flex flex-col items-start"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={slideInLeft}
              >
                <PillBadge className="mb-6">Eligibility</PillBadge>
                <h2 className="text-[32px] sm:text-[40px] font-semibold text-[#0B2D6B] tracking-tight leading-[1.2] mb-6">
                  Can You Apply?
                </h2>
                <p className="text-[16px] sm:text-[18px] font-light leading-[1.7] text-[#111111]/80 max-w-md">
                  Before you apply, make sure you meet all of the requirements. We value cultural representation and integrity.
                </p>
              </motion.div>

              {/* Right Column: Requirements Checklist */}
              <motion.div
                className="col-span-12 lg:col-span-7"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInContainer}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {eligibilityCriteria.map((criterion, idx) => (
                    <motion.div
                      key={idx}
                      className="group flex gap-4 p-5 rounded-[16px] bg-emerald-950/[0.02] border border-emerald-800/15 hover:border-emerald-600/40 transition-all duration-300 hover:shadow-sm"
                      variants={fadeInUpItem}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-900/10 border border-emerald-800/20 flex items-center justify-center text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white transition-all duration-300">
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                      </div>
                      <p className="text-[14px] sm:text-[15px] font-light leading-relaxed text-[#111111]/85 group-hover:text-black transition-colors duration-200">
                        {criterion}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* WHAT YOU WILL NEED SECTION */}
        <section id="requirements" className="bg-[#0B2D6B] py-20 md:py-28 relative">
          {/* subtle glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#071E4A_95%)] pointer-events-none" />

          <div className="grid-container relative z-10">
            {/* Section Header */}
            <div className="text-center mb-16 flex flex-col items-center">
              <PillBadge variant="gold" className="mb-6">Requirements</PillBadge>
              <h2 className="text-[32px] sm:text-[40px] font-semibold text-white tracking-tight leading-[1.2] mb-4">
                What You Will Need
              </h2>
              <p className="text-[#F5F0E8]/70 text-[15px] sm:text-[17px] font-light max-w-xl">
                Before you start your application, have these ready to ensure a smooth submission process.
              </p>
            </div>

            {/* Grid of items */}
            <motion.div
              className="grid-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInContainer}
            >
              {requirements.map((req, idx) => {
                return (
                  <motion.div
                    key={idx}
                    className="col-span-12 sm:col-span-6 lg:col-span-3 group relative rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/40 p-6 md:p-8 flex flex-col h-full hover:bg-white/[0.05] transition-all duration-300"
                    variants={fadeInUpItem}
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 mb-6 flex-shrink-0">
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2 tracking-tight group-hover:text-emerald-400 transition-colors">
                      {req.title}
                    </h3>
                    <p className="text-[#F5F0E8]/70 text-[14px] font-light leading-relaxed mt-auto">
                      {req.desc}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* STEP-BY-STEP CHECKLIST ("How To Apply") */}
        <section id="steps" className="bg-[#FFFFFF] py-20 md:py-28 overflow-hidden">
          <div className="grid-container">
            {/* Header */}
            <div className="text-center mb-16 md:mb-24 flex flex-col items-center">
              <PillBadge className="mb-6">Process</PillBadge>
              <h2 className="text-[32px] sm:text-[40px] font-semibold text-black tracking-tight leading-[1.2] mb-4">
                How To Apply
              </h2>
              <p className="text-slate-500 text-[15px] sm:text-[17px] font-light max-w-xl">
                Follow these five straightforward steps to submit your application.
              </p>
            </div>

            {/* Steps Timeline Grid */}
            <div className="grid-12">
              <div className="col-span-12">
                {/* Desktop view timeline connected with gold lines */}
                <div className="hidden lg:grid grid-cols-5 gap-6 relative">
                  {steps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      className="flex flex-col items-center text-center group relative z-10"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.1 }}
                    >
                      {/* Timeline node */}
                      <div className="relative flex items-center justify-center w-full mb-6">
                        <div className="w-12 h-12 rounded-full border-2 border-[#0B2D6B]/15 bg-white flex items-center justify-center text-[#0B2D6B] font-bold text-[15px] z-10 group-hover:border-[#E8C97A] group-hover:bg-[#0B2D6B] group-hover:text-white transition-all duration-300">
                          {step.step}
                        </div>

                        {/* Connecting Line (drawn to the right of each step except the last) */}
                        {idx < steps.length - 1 && (
                          <div className="absolute left-[calc(50%+1.5rem)] right-0 top-1/2 h-[1px] bg-slate-100 group-hover:bg-[#E8C97A]/40 transition-colors duration-300 pointer-events-none z-0" />
                        )}
                      </div>

                      {/* Content */}
                      <h4 className="text-[16px] font-semibold text-[#0B2D6B] mb-2 tracking-tight group-hover:text-black transition-colors duration-200">
                        {step.title}
                      </h4>
                      <p className="text-slate-500 text-[13px] font-light leading-relaxed max-w-[180px]">
                        {step.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile/Tablet view: simple vertical list */}
                <div className="grid lg:hidden gap-8 pl-4 sm:pl-8 relative border-l border-slate-100">
                  {steps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      className="flex gap-5 items-start relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: idx * 0.08 }}
                    >
                      {/* Step Badge */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0B2D6B]/5 border border-[#0B2D6B]/15 flex items-center justify-center text-[#0B2D6B] font-bold text-[14px]">
                        {step.step}
                      </div>

                      {/* Step Details */}
                      <div className="flex flex-col pt-1">
                        <h4 className="text-[17px] font-semibold text-black mb-1.5 tracking-tight">
                          {step.title}
                        </h4>
                        <p className="text-slate-500 text-[14px] font-light leading-relaxed max-w-lg">
                          {step.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PIPELINE SECTION ("What Happens After You Apply?") */}
        <section className="bg-[#F5F0E8]/40 py-20 md:py-28 border-t border-b border-[#0B2D6B]/5">
          <div className="grid-container">
            {/* Header */}
            <div className="text-center mb-16 md:mb-20 flex flex-col items-center">
              <PillBadge className="mb-6">Next Steps</PillBadge>
              <h2 className="text-[32px] sm:text-[40px] font-semibold text-[#0B2D6B] tracking-tight leading-[1.2] mb-4">
                What Happens After You Apply?
              </h2>
              <p className="text-slate-600 text-[15px] sm:text-[17px] font-light max-w-xl">
                If you are shortlisted, you will embark on a comprehensive journey designed to empower you.
              </p>
            </div>

            {/* Columns */}
            <motion.div
              className="grid-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInContainer}
            >
              {postApply.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    className="col-span-12 md:col-span-4 flex flex-col items-start p-6 bg-white border border-[#E8C97A]/10 rounded-2xl shadow-sm hover:shadow-md hover:border-[#E8C97A]/40 transition-all duration-300"
                    variants={fadeInUpItem}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#0B2D6B]/5 border border-[#0B2D6B]/10 flex items-center justify-center mb-5 text-[#0D3A8A]">
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0B2D6B] mb-2 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 text-[14px] font-light leading-relaxed">
                      {item.desc}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* QUESTIONS (FAQ) SECTION */}
        <section id="faq" className="bg-[#FFFFFF] py-20 md:py-28">
          <div className="grid-container">
            <div className="grid-12 items-start gap-y-12 lg:gap-x-12">
              
              {/* Left Column: Heading */}
              <div className="col-span-12 lg:col-span-5 text-left flex flex-col items-start">
                <PillBadge className="mb-6">Support</PillBadge>
                <h2 className="text-[32px] sm:text-[40px] font-semibold text-[#0B2D6B] tracking-tight leading-[1.2] mb-6">
                  Questions?
                </h2>
                <p className="text-slate-500 text-[16px] font-light leading-relaxed max-w-sm">
                  Find answers to common questions about the application criteria, process, fees, and requirements.
                </p>
              </div>

              {/* Right Column: Accordion */}
              <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
                {faqs.map((faq) => {
                  const isOpen = openFaq === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="border border-slate-100 rounded-xl overflow-hidden bg-white hover:border-[#E8C97A]/30 transition-colors duration-300"
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none"
                      >
                        <span className="text-[15px] sm:text-[16px] font-medium text-black leading-snug pr-4">
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${
                            isOpen ? "rotate-180 text-[#0B2D6B]" : ""
                          }`}
                          strokeWidth={2}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <div className="p-5 md:p-6 pt-0 border-t border-slate-50 text-[14px] sm:text-[15px] font-light leading-relaxed text-slate-500">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0B2D6B] via-[#0D3A8A] to-[#071E4A] py-16 md:py-24 text-white border-t border-white/5">
          {/* Ambient Glows */}
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#071E4A_95%)] z-10" />
            <div
              className="absolute inset-0 opacity-10 pointer-events-none z-15"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(232, 201, 122, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(232, 201, 122, 0.08) 1px, transparent 1px)`,
                backgroundSize: "45px 45px"
              }}
            />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-[#E8C97A]/5 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <h2 className="text-[28px] sm:text-[38px] font-semibold text-white tracking-tight leading-[1.2] mb-4">
                Are You Ready To Step Forward?
              </h2>
              <p className="text-[#F5F0E8]/75 text-[15px] sm:text-[17px] font-light leading-relaxed mb-8 max-w-xl">
                Applications close soon. Do not miss your chance to represent your culture and community.
              </p>

              {/* Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <PrimaryButton href="/portal">Apply Now</PrimaryButton>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
