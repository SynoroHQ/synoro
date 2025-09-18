"use client";

import { useEffect, useState } from "react";
import Features from "@/src/components/features";
import Footer from "@/src/components/footer";
import Header from "@/src/components/header";
import Hero from "@/src/components/hero";
import HowItWorks from "@/src/components/how-it-works";
import TelegramCTA from "@/src/components/telegram-cta";

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({ users: 0, tasks: 0, uptime: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const parallax = document.querySelector(".parallax-bg") as HTMLElement;
      if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    const animateCounters = () => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      const targets = { users: 10000, tasks: 50000, uptime: 99.9 };
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - (1 - progress) ** 3;

        setCounters({
          users: Math.floor(targets.users * easeOut),
          tasks: Math.floor(targets.tasks * easeOut),
          uptime: Math.min(
            targets.uptime,
            Number((targets.uptime * easeOut).toFixed(1)),
          ),
        });

        if (step >= steps) {
          clearInterval(timer);
          setCounters(targets);
        }
      }, stepDuration);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          animateCounters();
        }
      },
      { threshold: 0.5 },
    );

    const ctaSection = document.querySelector("#cta-section");
    if (ctaSection) observer.observe(ctaSection);

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [isVisible]);

  return (
    <div className="bg-background min-h-screen overflow-x-hidden">
      <Header />

      <Hero />

      <TelegramCTA />

      <Features />

      <HowItWorks />

      <Footer />
    </div>
  );
}
