"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { useTranslations } from "next-intl";

export default function FAQ() {
  const t = useTranslations("Home");

  return (
    <section id="faq" className="bg-gray-50 px-4 py-20">
      <div className="container mx-auto max-w-3xl">
        <h2 className="mb-16 text-center text-4xl font-bold">
          {t("faq.title")}
        </h2>
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
