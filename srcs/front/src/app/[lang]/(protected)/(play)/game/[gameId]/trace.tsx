"use client";

import { ScrollArea } from "../../../../../../components/ui/scroll-area";
import { useGame } from "../../../../../../contexts/GameContext";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../../../../../../components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "../../../../../../lib/utils";

export default function Trace() {
    const { trace } = useGame();

    return (
        <div className="h-full w-full">
            <ScrollArea className="w-full h-full">
                <div className="flex flex-col gap-2">
                    {trace.map(({ trace, result }, index) => (
                        <Collapsible key={index} className="w-full flex flex-col gap-2 bg-black/50 py-2 px-4 rounded-md border border-px border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <p className="text-sm text-white font-medium font-mono">Try {index + 1}</p>
                                    <p className={cn("text-sm font-medium font-mono", result ? "text-green" : "text-destructive")}>
                                        {result ? "Success" : "Failed"}
                                    </p>
                                </div>
                                <CollapsibleTrigger className="group/button p-0 cursor-pointer hover:bg-white/10 rounded-md p-2 transition-all duration-200">
                                    <ChevronDown className="size-4 transition-transform duration-200 group-data-panel-open/button:rotate-180" />
                                </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent className="py-2 px-4 bg-white/5 rounded-md">
                                <p>{trace}</p>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
