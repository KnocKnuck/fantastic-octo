"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container, Section } from "@/components/ui/section";
import { motion } from "framer-motion";
import { fadeIn, fadeInUp } from "@/lib/animations";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";

export default function Hero() {
  const handleTryFree = () => {
    console.log("Try for free clicked");
    const ctaSection = document.getElementById("cta");
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleJoinBeta = () => {
    console.log("Join Beta clicked");
    const ctaSection = document.getElementById("cta");
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Section className="relative pt-32 md:pt-40 pb-20 md:pb-32 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-violet-50 -z-10" />

      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col items-start space-y-8">
            <motion.div
              {...fadeIn}
              className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              ✨ Now in Private Beta
            </motion.div>

            <motion.h1
              {...fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              Plan your day without thinking.
            </motion.h1>

            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl"
            >
              Connect your Google or Outlook calendar, add your tasks, and let our AI create the perfect schedule — without stress or overload.
            </motion.p>

            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Button
                size="lg"
                onClick={handleTryFree}
                className="text-base"
              >
                Try for free
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={handleJoinBeta}
                className="text-base border border-gray-300"
              >
                Join the private beta
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-6 pt-4"
            >
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Free for 3 months</span>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Mockup */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <Card className="p-6 md:p-8 shadow-2xl">
              <div className="space-y-4">
                {/* Calendar Header */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-lg">Today&apos;s Schedule</h3>
                  </div>
                  <span className="text-sm text-gray-500">Wed, Nov 12</span>
                </div>

                {/* Calendar Items */}
                <div className="space-y-3">
                  {[
                    { time: "09:00", title: "Review project proposals", color: "bg-blue-500" },
                    { time: "10:30", title: "Team standup meeting", color: "bg-purple-500" },
                    { time: "12:00", title: "Lunch break", color: "bg-green-500" },
                    { time: "14:00", title: "Deep work: Feature development", color: "bg-orange-500" },
                    { time: "16:00", title: "Client presentation", color: "bg-pink-500" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className={`w-1 h-12 rounded-full ${item.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-500">{item.time}</span>
                        </div>
                        <p className="font-medium text-gray-900 mt-1">{item.title}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-200 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-violet-200 rounded-full blur-3xl opacity-50" />
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
