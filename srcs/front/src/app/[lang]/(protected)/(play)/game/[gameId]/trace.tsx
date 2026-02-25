"use client";

import { ScrollArea } from "../../../../../../components/ui/scroll-area";
import { useGame } from "../../../../../../contexts/GameContext";
import { useLanguage } from "../../../../../../contexts/LanguageContext";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../../../../../../components/ui/collapsible";
import { ChevronDown, FileText } from "lucide-react";
import { cn } from "../../../../../../lib/utils";

export default function Trace() {
    const { trace } = useGame();
    const { dictionary } = useLanguage();

    return (
        <>
            {trace.length > 0 ? (
                <ScrollArea className="h-full w-full min-h-0 overflow-auto p-4">
                    <div className="w-full flex flex-col gap-4">
                        {trace.map(({ trace, result }, index) => (
                            <Collapsible key={index} className="w-full flex flex-col rounded-md border border-px border-white/10 overflow-hidden">
                                <div className="flex items-center justify-between py-2 px-4 bg-black/50">
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm text-white font-medium font-mono">{dictionary.game.tryNumber.replace("{{number}}", String(index + 1))}</p>
                                        <p className={cn("text-sm font-medium font-mono", result ? "text-green" : "text-destructive")}>
                                            {result ? dictionary.game.successGame : dictionary.game.failedGame}
                                        </p>
                                    </div>
                                    <CollapsibleTrigger className="group/button p-0 cursor-pointer hover:bg-white/10 rounded-md p-2 transition-all duration-200">
                                        <ChevronDown className="size-4 transition-transform duration-200 group-data-panel-open/button:rotate-180" />
                                    </CollapsibleTrigger>
                                </div>
                                <CollapsibleContent className="py-3 px-4 bg-white/5 border-t border-px border-white/10">
                                    <p className="text-sm text-sub-text font-medium font-mono whitespace-pre-wrap break-words">{trace}</p>
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </div>
                </ScrollArea>
            ) : (
                <div className="h-full w-full flex items-center justify-center flex-col gap-2">
                    <FileText size={50} />
                    <p className="text-sub-text">{dictionary.game.noTraceAvailable}</p>
                </div>
            )}
        </>
    );
}
