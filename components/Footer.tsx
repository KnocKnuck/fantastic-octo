"use client";

import { Container } from "@/components/ui/section";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import { Heart, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <Container>
        <motion.div
          {...fadeInUp}
          className="space-y-8"
        >
          {/* Top Section */}
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Logo/Brand */}
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                AI Calendar Agent
              </h3>
              <p className="text-sm text-gray-400">
                Plan your day without thinking.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-6 justify-center">
              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log(`${link.label} clicked`);
                  }}
                  className="text-sm hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Contact */}
            <div className="flex justify-end">
              <a
                href="mailto:hello@aicalendaragent.com"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Contact email clicked");
                }}
              >
                <Mail className="w-4 h-4" />
                <span>hello@aicalendaragent.com</span>
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800" />

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span>© {currentYear} AI Calendar Agent.</span>
              <span className="hidden md:inline">Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>by Joseph Hani.</span>
            </div>

            <div className="text-gray-500 text-xs">
              Built with Next.js, TypeScript & TailwindCSS
            </div>
          </div>
        </motion.div>
      </Container>
    </footer>
  );
}
