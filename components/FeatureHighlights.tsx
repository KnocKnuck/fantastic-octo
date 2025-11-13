"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container, Section } from "@/components/ui/section";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { RefreshCw, Clock3, Moon, BarChart3 } from "lucide-react";

export default function FeatureHighlights() {
  const features = [
    {
      icon: RefreshCw,
      title: "Dynamic rescheduling",
      description: "Plans adapt automatically when priorities change or meetings run over.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Clock3,
      title: "Smart time estimation",
      description: "AI learns from your habits to suggest realistic task durations.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Moon,
      title: "Focus mode",
      description: "Block distractions and deep work time automatically when you need it most.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      icon: BarChart3,
      title: "Weekly balance analytics",
      description: "Track your work-life balance with insightful reports and suggestions.",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const handleStartClick = () => {
    console.log("Start organizing smarter clicked");
    const ctaSection = document.getElementById("cta");
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Section id="features" className="bg-gray-50">
      <Container>
        <motion.div
          {...fadeInUp}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Built for your workflow
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Powerful features designed to help you work smarter, not harder
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={staggerItem}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-200 group">
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl md:text-2xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          {...fadeInUp}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={handleStartClick}
            className="text-base"
          >
            Start organizing smarter →
          </Button>
        </motion.div>
      </Container>
    </Section>
  );
}
