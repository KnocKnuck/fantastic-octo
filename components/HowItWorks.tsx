"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container, Section } from "@/components/ui/section";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { Brain, Calendar, Zap } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Brain,
      title: "Add your tasks",
      description: "Write what you need to do and estimate your time.",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Calendar,
      title: "Connect your calendar",
      description: "Sync Google or Outlook in one click.",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: Zap,
      title: "Let the AI plan it",
      description: "It automatically fills your free time slots.",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <Section id="how-it-works" className="bg-gray-50">
      <Container>
        <motion.div
          {...fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Three simple steps to transform your productivity
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div key={index} variants={staggerItem}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-2 border-transparent hover:border-blue-200">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl ${step.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`w-8 h-8 ${step.color}`} />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-gray-400">STEP {index + 1}</span>
                    </div>
                    <CardTitle className="text-xl md:text-2xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Connection Arrow (Desktop only) */}
        <div className="hidden md:flex justify-center items-center mt-8 gap-4 opacity-30">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center">
              <div className="w-16 h-0.5 bg-gray-400" />
              <div className="w-2 h-2 rounded-full bg-gray-400" />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
