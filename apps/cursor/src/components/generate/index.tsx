"use client";

import { generateRule } from "@/actions/generate-rule";
import { cn } from "@/lib/utils";
import { readStreamableValue } from "ai/rsc";
import { useState } from "react";

import { GenerateInput } from "./input";
import { GenerateList } from "./list";
import { GeneratedResults } from "./results";
import { GenerateTitle } from "./title";

export function Generate() {
  const [value, setValue] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(packageJson?: string) {
    try {
      setIsLoading(true);
      setError(null);
      setResult("");

      const stream = await generateRule(packageJson || value);
      for await (const delta of readStreamableValue(stream.output)) {
        setResult((currentResult) => `${currentResult}${delta}`);
      }

      setFinished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  const hasResult = result.length > 0;

  return (
    <div>
      <div className="flex flex-col gap-4 w-full max-w-[860px] relative mx-auto h-screen justify-center">
        <div
          className={cn("transition-all duration-1000", {
            "blur-sm opacity-0": hasResult,
          })}
        >
          <GenerateTitle />

          <div className="max-w-[620px] mx-auto w-full">
            <GenerateInput
              value={value}
              setValue={setValue}
              onSubmit={handleGenerate}
              isLoading={isLoading}
            />
          </div>

          <GenerateList />
        </div>
      </div>

      {hasResult && (
        <GeneratedResults
          result={result}
          onNew={() => {
            setValue("");
            setResult("");
            setFinished(false);
          }}
        />
      )}

    </div>
  );
}
