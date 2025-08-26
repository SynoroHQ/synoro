"use client";

import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@synoro/ui";

export default function FAQ() {
  const t = useTranslations("Home");

  return (
    <section id="faq" className="section section-muted">
      <div className="container-default max-w-3xl">
        <h2 className="heading-title mb-16 text-center">{t("faq.title")}</h2>
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="telegram">
            <AccordionTrigger>{t("faq.telegram.question")}</AccordionTrigger>
            <AccordionContent>{t("faq.telegram.answer")}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="voice">
            <AccordionTrigger>{t("faq.voice.question")}</AccordionTrigger>
            <AccordionContent>{t("faq.voice.answer")}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="security">
            <AccordionTrigger>{t("faq.security.question")}</AccordionTrigger>
            <AccordionContent>{t("faq.security.answer")}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="family">
            <AccordionTrigger>{t("faq.family.question")}</AccordionTrigger>
            <AccordionContent>{t("faq.family.answer")}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
