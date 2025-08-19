"use client"

import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

import Header from "@/components/header"
import Hero from "@/components/hero"
import HowItWorks from "@/components/how-it-works"
import Features from "@/components/features"
import WhoBenefits from "@/components/who-benefits"
import Pricing from "@/components/pricing"
import Footer from "@/components/footer"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [counters, setCounters] = useState({ users: 0, tasks: 0, uptime: 0 })

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const parallax = document.querySelector(".parallax-bg")
      if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.5}px)`
      }
    }

    const animateCounters = () => {
      const duration = 2000
      const steps = 60
      const stepDuration = duration / steps

      const targets = { users: 10000, tasks: 50000, uptime: 99.9 }
      let step = 0

      const timer = setInterval(() => {
        step++
        const progress = step / steps
        const easeOut = 1 - Math.pow(1 - progress, 3)

        setCounters({
          users: Math.floor(targets.users * easeOut),
          tasks: Math.floor(targets.tasks * easeOut),
          uptime: Math.min(targets.uptime, (targets.uptime * easeOut).toFixed(1)),
        })

        if (step >= steps) {
          clearInterval(timer)
          setCounters(targets)
        }
      }, stepDuration)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
          animateCounters()
        }
      },
      { threshold: 0.5 },
    )

    const ctaSection = document.querySelector("#cta-section")
    if (ctaSection) observer.observe(ctaSection)

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      observer.disconnect()
    }
  }, [isVisible])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      <Hero />

      <HowItWorks />

      <Features />

      <WhoBenefits />

      <Pricing />

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="telegram">
              <AccordionTrigger>How does it work through Telegram?</AccordionTrigger>
              <AccordionContent>
                Simply add our Synoro bot to your Telegram and start chatting. Send text messages or voice notes about
                your tasks, expenses, or maintenance activities. Our AI will automatically understand and categorize
                everything for you.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="voice">
              <AccordionTrigger>Can I use voice messages?</AccordionTrigger>
              <AccordionContent>
                Yes! Voice messages are fully supported. Simply record a voice note in Telegram describing what you did,
                bought, or need to remember. Our system will transcribe and process your voice message automatically.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="security">
              <AccordionTrigger>Is my data secure?</AccordionTrigger>
              <AccordionContent>
                Absolutely. We use enterprise-grade encryption to protect your data. Your information is stored securely
                and never shared with third parties. You maintain full control over your data and can export or delete
                it at any time.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="family">
              <AccordionTrigger>How does family sharing work?</AccordionTrigger>
              <AccordionContent>
                With the Family plan, multiple family members can log activities to the same account. Each person gets
                their own Telegram bot access, and you can see combined analytics and reports for the entire household.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  )
}
