"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
// import { Progress } from "@/components/ui/progress";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function FeedbackPage() {
    const [openSections, setOpenSections] = useState<{
        [key: string]: boolean;
    }>({});

    const toggleSection = (section: string) => {
        setOpenSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-4 bg-background">
            <Card className="w-full max-w-2xl p-6 space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">You did Amazing!</h1>
                    <div className="flex justify-center items-center">
                        <span className="text-4xl font-bold text-yellow-400">
                            98%
                        </span>
                        <div className="flex text-yellow-400 text-2xl ml-2">
                            {"★".repeat(3)}
                        </div>
                    </div>
                </div>

                {/* Strong Points Section */}
                <Collapsible
                    open={openSections["strengths"]}
                    onOpenChange={() => toggleSection("strengths")}
                    className="w-full"
                >
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-4 bg-muted rounded-lg">
                        <span className="font-semibold">Strong Points</span>
                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                                openSections["strengths"]
                                    ? "transform rotate-180"
                                    : ""
                            }`}
                        />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4">
                        <ul className="list-disc list-inside space-y-2">
                            <li>Great use of your tone</li>
                            <li>Clear pronunciation</li>
                            <li>Excellent pacing</li>
                        </ul>
                    </CollapsibleContent>
                </Collapsible>

                {/* Areas of Improvement Section */}
                <Collapsible
                    open={openSections["improvements"]}
                    onOpenChange={() => toggleSection("improvements")}
                    className="w-full"
                >
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-4 bg-muted rounded-lg">
                        <span className="font-semibold">
                            Areas of Improvement
                        </span>
                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                                openSections["improvements"]
                                    ? "transform rotate-180"
                                    : ""
                            }`}
                        />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4">
                        <ul className="list-disc list-inside space-y-2">
                            <li>Work on reducing filler words</li>
                            <li>Try to maintain more consistent eye contact</li>
                        </ul>
                    </CollapsibleContent>
                </Collapsible>

                {/* Tonality Graph Section */}
                <div className="space-y-2">
                    <h3 className="font-semibold">Your Tonality</h3>
                    <div className="h-24 bg-muted rounded-lg p-4">
                        {/* This is a placeholder for the actual graph */}
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="w-full border-b-2 border-foreground relative">
                                <div className="absolute w-full h-8 -top-4">
                                    <svg
                                        viewBox="0 0 100 20"
                                        preserveAspectRatio="none"
                                        className="w-full h-full"
                                    >
                                        <path
                                            d="M0,10 Q25,2 50,10 T100,10"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Link href="/" className="block">
                    <Button className="w-full">Continue</Button>
                </Link>
            </Card>
        </main>
    );
}
