"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Container, Section } from "@/components/ui/section";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import { CheckCircle2, Users } from "lucide-react";

export default function CTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Beta signup submitted:", email);
    setSubmitted(true);
    // Simulate form submission
    setTimeout(() => {
      setEmail("");
    }, 2000);
  };

  // Simulated beta user count (67 out of 100)
  const currentUsers = 67;
  const maxUsers = 100;
  const percentageFilled = (currentUsers / maxUsers) * 100;

  return (
    <Section id="cta" className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMy4zMTQgMi42ODYtNiA2LTZzNiAyLjY4NiA2IDYtMi42ODYgNi02IDYtNi0yLjY4Ni02LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

      <Container className="relative z-10">
        <motion.div
          {...fadeInUp}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Be one of the first 100 beta users.
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Join now and get <span className="font-bold text-white">3 months free</span> when we launch.
          </p>

          {/* Beta User Counter */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-white">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">{currentUsers} / {maxUsers} spots filled</span>
                  </div>
                  <span className="text-blue-100 text-sm">{maxUsers - currentUsers} spots left</span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentageFilled}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Email Form */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.2 }}
          >
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 h-12 bg-white text-gray-900 border-white/20 focus:border-white"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold h-12 px-8"
                >
                  Join the Beta
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 py-4 text-green-300"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-lg font-semibold">Thanks! We&apos;ll be in touch soon.</span>
              </motion.div>
            )}

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>3 months free on launch</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  );
}
