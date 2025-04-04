"use client";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    {
      category: "For Coordinators",
      questions: [
        {
          q: "How do I create an organisation and programme?",
          a: "After signing up as a coordinator, you can create an organisation from your dashboard. Within your organisation, you can set up one or more mentoring programmes with custom matching rules."
        },
        {
          q: "Can I run multiple programmes in my organisation?",
          a: "Yes! You can create multiple programme years for the same mentoring programme, each with their own matching settings, criteria, and participants."
        }, 
        {
          q: "What’s the difference between a Programme and a Programme Year?",
          a: "A Programme is the overall mentoring initiative (e.g. Peer Mentoring, Career Mentoring). Each Programme can have multiple Programme Years, typically based on the academic year (e.g. 2023/2024). Programme Years are where participants sign up, matching happens, and progress is tracked."
        }
      ]
    },
    {
      category: "For Participants",
      questions: [
        {
          q: "How do I join an organisation?",
          a: "Use a join code provided by your coordinator. Enter it during signup or on the 'Join Organisation' page to get started."
        },
        {
          q: "What if I'm part of an organisation but not in a programme?",
          a: "You can browse available programme years from your organisation’s page and choose the one you want to join."
        },
        {
          q: "How do I know if I got matched?",
          a: "If you've been matched, you’ll see your mentor or mentee in your dashboard. You’ll also get notifications about your match status."
        }
      ]
    },
    {
      category: "About Matching",
      questions: [
        {
          q: "How are matches made?",
          a: "Matching is based on criteria set by the coordinator, such as skills, personality fit, availability, and more. An algorithm processes this information to create optimal pairs or groups."
        },
        {
          q: "Can matching happen multiple times?",
          a: "Yes! Matching can occur in several rounds. As more users join, the platform may run another matching cycle, so you may be matched later."
        },
        {
          q: "What if I’m not matched?",
          a: "Don’t worry. Unmatched participants are prioritised in future matching cycles. You'll remain in the programme and can be matched once more people join."
        }
      ]
    }
  ];

  return (
    <div className="my-16 w-[70vw] mx-auto px-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
      {faqData.map((section, i) => (
        <div key={i} className="mb-8">
          <h3 className="text-xl font-semibold mb-3">{section.category}</h3>
          <div className="space-y-2">
            {section.questions.map((item, j) => {
              const index = i * 10 + j;
              const isOpen = openIndex === index;

              return (
                <Collapsible
                  key={index}
                  open={isOpen}
                  onOpenChange={() => toggle(index)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="cursor-pointer p-3 bg-muted dark:bg-muted/20 rounded-md border hover:bg-muted/50 dark:hover:bg-muted/30 flex items-center justify-between">
                      <span className="font-medium">{item.q}</span>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-3 pl-5 text-sm bg-muted/10 dark:bg-muted/10 rounded-b-md border-t">
                    {item.a}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQ;
