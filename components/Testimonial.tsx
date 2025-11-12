"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Container, Section } from "@/components/ui/section";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import { Quote, Star } from "lucide-react";

export default function Testimonial() {
  return (
    <Section className="bg-white">
      <Container>
        <motion.div
          {...fadeInUp}
          className="max-w-4xl mx-auto"
        >
          <Card className="relative overflow-hidden border-2 border-gray-200 shadow-xl">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 -z-0" />

            <CardContent className="p-8 md:p-12 relative">
              {/* Quote icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Quote className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-center space-y-6">
                <p className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-900 leading-relaxed">
                  &ldquo;I finally stopped spending my Sundays planning my week. This app does it for me — and it&apos;s brilliant.&rdquo;
                </p>

                {/* Author */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      T
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Thomas</div>
                      <div className="text-sm text-gray-600">Independent Consultant</div>
                    </div>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>

          {/* Additional testimonial stats */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-8 mt-12 text-center"
          >
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-sm md:text-base text-gray-600">Beta users</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">4.9</div>
              <div className="text-sm md:text-base text-gray-600">Average rating</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">6h</div>
              <div className="text-sm md:text-base text-gray-600">Saved weekly</div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  );
}
