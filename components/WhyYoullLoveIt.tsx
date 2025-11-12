"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Container, Section } from "@/components/ui/section";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { Clock, Brain, Eye } from "lucide-react";

export default function WhyYoullLoveIt() {
  const benefits = [
    {
      icon: Clock,
      stat: "+6h",
      title: "saved per week",
      description: "Thanks to automatic scheduling.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      stat: "Zero",
      title: "mental load",
      description: "No more manual planning.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Eye,
      stat: "Clear",
      title: "view of your week",
      description: "Instantly visualized.",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <Section className="bg-white">
      <Container>
        <motion.div
          {...fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            More time. Less chaos.
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Experience the freedom of automated scheduling
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div key={index} variants={staggerItem}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 group overflow-hidden border-2 border-transparent hover:border-gray-200">
                  <CardContent className="p-8">
                    <div className="text-center space-y-4">
                      {/* Icon with gradient background */}
                      <div className="relative mx-auto w-20 h-20 mb-6">
                        <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
                        <div className={`relative w-full h-full bg-gradient-to-br ${benefit.gradient} rounded-2xl flex items-center justify-center`}>
                          <Icon className="w-10 h-10 text-white" />
                        </div>
                      </div>

                      {/* Stat */}
                      <div>
                        <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-br ${benefit.gradient} bg-clip-text text-transparent mb-2`}>
                          {benefit.stat}
                        </div>
                        <div className="text-xl font-semibold text-gray-900 mb-3">
                          {benefit.title}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </Section>
  );
}
